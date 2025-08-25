import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabaseClient'; // ADD THIS

// Stripeクライアントの初期化
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil', // checkout時とバージョンを合わせる
});

// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(); // ADD THIS

// Stripe Webhookのシークレットキー
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const buf = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  // Stripeからのリクエスト署名を検証
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // 'checkout.session.completed'イベントを処理
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the full session with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'], // Expand line items and product details
    });
    const lineItems = fullSession.line_items?.data;

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name || 'お客様';

    console.log(`[Webhook] Received checkout.session.completed for email: ${customerEmail}`);
    console.log(`[Webhook] Customer Name: ${customerName}`);
    console.log(`[Webhook] Session ID: ${session.id}`);
    console.log(`[Webhook] Total Amount: ${session.amount_total} ${session.currency}`);

    if (!customerEmail) {
      console.error('Customer email not found in checkout session. Cannot send email.');
      return NextResponse.json({ received: true, message: 'No email to send.' });
    }

    // --- Start Order Saving Logic ---
    try {
      // 1. Save to public.orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: customerEmail,
          stripe_session_id: session.id,
          total: session.amount_total, // Corrected line
          currency: session.currency,
          status: 'completed',
        })
        .select()
        .single();

      if (orderError) {
        console.error('Error saving order to Supabase:', orderError);
        throw new Error('Failed to save order.');
      }
      console.log(`Order saved to Supabase with ID: ${order.id}`);

      // 2. Save to public.order_details table
      if (lineItems && lineItems.length > 0) {
        const orderDetailsToInsert = await Promise.all(
          lineItems.map(async (item: any) => {
            const stripeProductId = item.price?.product?.id || item.description; // This is the Stripe Product ID
            console.log(`[Webhook] Attempting to insert product_id: ${stripeProductId}`); // Log the Stripe Product ID

            // Look up the Supabase product ID using the Stripe Product ID
            const { data: supabaseProduct, error: supabaseProductError } = await supabase
              .from('products')
              .select('id') // Select only the Supabase product ID
              .eq('stripe_product_id', stripeProductId) // Match by the new column
              .single();

            if (supabaseProductError || !supabaseProduct) {
              console.error(`Error finding Supabase product for Stripe ID ${stripeProductId}:`, supabaseProductError);
              // Decide how to handle: throw error, skip item, or use a placeholder
              // For now, let's throw to make it explicit
              throw new Error(`Supabase product not found for Stripe ID: ${stripeProductId}`);
            }

            return {
              order_id: order.id,
              product_id: supabaseProduct.id, // Use the Supabase product ID
              quantity: item.quantity,
              price: item.price?.unit_amount,
            };
          })
        );

        const { error: orderDetailsError } = await supabase
          .from('order_details')
          .insert(orderDetailsToInsert);

        if (orderDetailsError) {
          console.error('Error saving order details to Supabase:', orderDetailsError);
          throw new Error('Failed to save order details.');
        }
        console.log('Order details saved to Supabase.');
      }
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      // Decide whether to return an error to Stripe or just log
    }
    // --- End Order Saving Logic ---

    try {
      // Resendを使って購入確認メールを送信
      const { data, error: resendError } = await resend.emails.send({
        from: 'megurid <noreply@megurid.com>', // Resendで設定・認証したドメインのメールアドレスに変更してください
        to: customerEmail,
        subject: '【megurid】ご注文ありがとうございます',
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h1 style="font-size: 1.5em;">ご注文ありがとうございます</h1>
            <p>${customerName}様</p>
            <p>この度は、meguridをご利用いただき、誠にありがとうございます。</p>
            <p>ご注文内容の詳細は、ウェブサイトの注文履歴よりご確認いただけます。</p>
            <p>商品の発送まで、今しばらくお待ちくださいませ。</p>
            <br>
            <p>megurid</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}">ウェブサイトに戻る</a></p>
          </div>
        `,
      });

      if (resendError) {
        console.error('Error sending email via Resend:', resendError);
      } else {
        console.log(`Purchase confirmation email sent successfully via Resend. ID: ${data?.id}`);
      }
    } catch (error) {
      console.error('Unexpected error during email sending:', error);
    }
  } else {
    console.warn(`Unhandled event type: ${event.type}`);
  }

  // Stripeに正常に受信したことを伝える
  return NextResponse.json({ received: true });
}

