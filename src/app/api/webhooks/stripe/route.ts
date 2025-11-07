import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabaseClient';

// Stripeクライアントの初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY!);

// Supabase Admin Client
const supabase = createClient({
  global: {
    headers: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  },
});

// Stripe Webhookのシークレットキー
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function logError(source: string, error: any, context: object = {}) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Error from ${source}:`, errorMessage, context);
  try {
    await supabase.from('app_errors').insert({
      source,
      error_message: errorMessage,
      error_details: { ...context, stack: error instanceof Error ? error.stack : 'N/A' },
    });
  } catch (logError) {
    console.error('Failed to log error to Supabase:', logError);
  }
}

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    await logError('webhook_signature_verification', err);
    return NextResponse.json({ error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` }, { status: 400 });
  }

  // --- Idempotency Check ---
  try {
    const { error: eventError } = await supabase
      .from('processed_stripe_events')
      .insert({ event_id: event.id });

    if (eventError) {
      console.log(`[Webhook] Duplicate event received, ignoring: ${event.id}`);
      return NextResponse.json({ received: true, message: 'Duplicate event' });
    }
  } catch (dbError) {
    await logError('webhook_idempotency_check', dbError, { eventId: event.id });
    return NextResponse.json({ error: 'Database error during event processing' }, { status: 500 });
  }
  // --- End Idempotency Check ---

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { client_reference_id: userId, id: sessionId } = session;

    try {
      const fullSession: Stripe.Checkout.Session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price.product'],
      });
      const lineItems = fullSession.line_items?.data;
      const { customer_details } = fullSession;
      const shipping_details = fullSession.collected_information?.shipping_details;

      if (!customer_details?.email || !shipping_details) {
        throw new Error('Critical data missing in session (email or shipping).');
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: userId, customer_email: customer_details.email, stripe_session_id: sessionId, total: fullSession.amount_total, currency: fullSession.currency, status: 'completed', shipping_address: shipping_details })
        .select()
        .single();

      if (orderError) throw orderError;

      if (lineItems && lineItems.length > 0) {
        const orderDetailsPromises = lineItems.map(async (item: any) => {
          const stripeProductId = item.price?.product?.id;
          if (!stripeProductId) throw new Error('Stripe Product ID missing in line item.');

          const { data: supabaseProduct, error: productError } = await supabase.from('products').select('id').eq('stripe_product_id', stripeProductId).single();
          if (productError || !supabaseProduct) throw new Error(`Product not found in Supabase for Stripe ID: ${stripeProductId}`);

          const { error: rpcError } = await supabase.rpc('decrement_stock_and_log', { p_order_id: order.id, p_product_id: supabaseProduct.id, p_quantity_sold: item.quantity });
          if (rpcError) await logError('webhook_stock_decrement', rpcError, { orderId: order.id, productId: supabaseProduct.id });

          return { order_id: order.id, product_id: supabaseProduct.id, quantity: item.quantity, price: item.price?.unit_amount };
        });

        const orderDetailsToInsert = await Promise.all(orderDetailsPromises);
        const { error: orderDetailsError } = await supabase.from('order_details').insert(orderDetailsToInsert);
        if (orderDetailsError) throw orderDetailsError;
      }

      // --- Affiliate Attribution ---
      const affiliateCode = fullSession.metadata?.affiliate_code;
      if (affiliateCode) {
        console.log(`[Webhook] Affiliate code found in session: ${affiliateCode}`);
        try {
          const { data: link, error: linkError } = await supabase
            .from('affiliate_links')
            .select(`
              id,
              affiliate:affiliates (id, default_rate_type, default_rate_value)
            `)
            .eq('code', affiliateCode)
            .single();

          if (linkError) throw new Error(`Affiliate link lookup failed: ${linkError.message}`);

          if (link && link.affiliate) {
            const affiliate = link.affiliate as unknown as { id: string; default_rate_type: string; default_rate_value: number };
            const subtotal = fullSession.amount_subtotal / 100; // Convert from cents
            let commission_amount = 0;

            if (affiliate.default_rate_type === 'percentage') {
              commission_amount = subtotal * affiliate.default_rate_value;
            } else if (affiliate.default_rate_type === 'fixed') {
              commission_amount = affiliate.default_rate_value;
            }

            const { error: orderAffiliateError } = await supabase
              .from('order_affiliates')
              .insert({
                order_id: order.id,
                affiliate_id: affiliate.id,
                link_id: link.id,
                commission_amount: Math.round(commission_amount),
                commission_rate: affiliate.default_rate_value,
                commission_type: affiliate.default_rate_type,
                status: 'unpaid',
              });

            if (orderAffiliateError) throw new Error(`Failed to create order_affiliates record: ${orderAffiliateError.message}`);
            console.log(`[Webhook] Successfully attributed order ${order.id} to affiliate ${affiliate.id}`);
          } else {
            console.warn(`[Webhook] Affiliate link with code ${affiliateCode} not found or affiliate data is missing.`);
          }
        } catch (attributionError) {
          await logError('webhook_affiliate_attribution', attributionError, { orderId: order.id, affiliateCode });
        }
      }
      // --- End Affiliate Attribution ---

      try {
        await resend.emails.send({ from: 'megurid <noreply@megurid.com>', to: customer_details.email, subject: '【megurid】ご注文ありがとうございます', html: `...` });
      } catch (emailError) {
        await logError('webhook_email_sending', emailError, { orderId: order.id, customerEmail: customer_details.email });
      }

      // Send notification email to admin
      try {
        const itemsHtml = lineItems?.map(item => `<li>${item.description} (Quantity: ${item.quantity})</li>`).join('') || '<li>No items found</li>';
        const shippingAddressHtml = `
          <p>
            ${shipping_details.name}<br>
            〒${shipping_details.address?.postal_code || ''}<br>
            ${shipping_details.address?.state || ''}${shipping_details.address?.city || ''}${shipping_details.address?.line1 || ''}<br>
            ${shipping_details.address?.line2 || ''}
          </p>
        `;

        await resend.emails.send({
          from: 'megurid <noreply@megurid.com>',
          to: 'info@megurid.com',
          subject: `[megurid Admin] New Order Received - ${order.id}`,
          html: `
            <h1>New Order Received</h1>
            <p>A new order has been placed on megurid.</p>
            <h2>Order Details</h2>
            <ul>
              <li><strong>Order ID:</strong> ${order.id}</li>
              <li><strong>Customer Name:</strong> ${shipping_details.name}</li>
              <li><strong>Customer Email:</strong> ${customer_details.email}</li>
              <li><strong>Total Amount:</strong> ¥${fullSession.amount_total?.toLocaleString()}</li>
            </ul>
            <h2>Shipping Address</h2>
            ${shippingAddressHtml}
            <h2>Items</h2>
            <ul>
              ${itemsHtml}
            </ul>
          `
        });
      } catch (adminEmailError) {
        // Log the error but don't crash the process
        await logError('webhook_admin_email_sending', adminEmailError, { orderId: order.id });
      }

    } catch (processingError) {
      await logError('webhook_order_processing', processingError, { sessionId });
      return NextResponse.json({ error: 'Error during order processing' }, { status: 500 });
    }
  } else {
    console.warn(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

