import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@/lib/supabaseClient";

console.log('API route invoked: /api/checkout/quick-buy');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

interface QuickBuyRequest {
  productId: string;
  quantity: number;
}

async function logError(source: string, error: any, context: object = {}) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error(`Error from ${source}:`, errorMessage, context);
  try {
    const supabaseAdmin = createAdminClient({
      global: {
        headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}` },
      },
    });
    await supabaseAdmin.from('app_errors').insert({
      source,
      error_message: errorMessage,
      error_details: { ...context, stack: error instanceof Error ? error.stack : 'N/A' },
    });
  } catch (logError) {
    console.error("Failed to log error to Supabase:", logError);
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
      cookieOptions: {
        domain: new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname,
        path: '/',
      },
    }
  );

  let productId: string | undefined; // productIdをtryブロックの外で定義

  try {
    // Get user session (optional for guest checkout)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id || null;

    const body: QuickBuyRequest = await req.json();
    productId = body.productId; // productIdを取得して変数に格納
    const { quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Product ID and a valid quantity are required" }, { status: 400 });
    }

    // --- Fetch product and check stock ---
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, stock_quantity, stripe_price_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    if (!product.stripe_price_id) {
      throw new Error(`Product '${product.name}' is not configured for sale.`);
    }

    if (product.stock_quantity < quantity) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` }, { status: 400 });
    }
    // --- End Check ---

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
      price: product.stripe_price_id,
      quantity: quantity,
    }];

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${productId}`,
      shipping_address_collection: { allowed_countries: ['JP'] },
      automatic_tax: { enabled: true },
      client_reference_id: userId ?? undefined,
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    if (!stripeSession.url) {
      throw new Error("Could not create Stripe checkout session.");
    }

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    // tryブロックで取得したproductIdを使用
    await logError('quick_buy_api', error, { productId });
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}