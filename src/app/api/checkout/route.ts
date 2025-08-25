import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@/lib/supabaseClient";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil", // Use a specific API version
});

interface CartItem {
  productId: string;
  quantity: number;
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
    }
  );

  try {
    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.user.id;

    const { items }: { items: CartItem[] } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // --- Stock Check ---
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, stock_quantity, stripe_price_id") // Fetch stripe_price_id instead of price
      .in("id", productIds);

    if (productsError) {
      console.error("Error fetching products for stock check:", productsError);
      throw new Error("Could not verify product stock.");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const misconfiguredItems: string[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found in database.`);
      }
      if (product.stock_quantity < item.quantity) {
        misconfiguredItems.push(`${product.name} (Insufficient Stock)`);
      }
      if (!product.stripe_price_id) {
        misconfiguredItems.push(`${product.name} (Not configured for sale)`);
      }
    }

    if (misconfiguredItems.length > 0) {
      return NextResponse.json(
        {
          error: `The following items have issues: ${misconfiguredItems.join(", ")}`,
        },
        { status: 400 }
      );
    }
    // --- End Stock Check ---

    // Create line items for Stripe Checkout using the Price ID
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        price: product.stripe_price_id!, // Use the Stripe Price ID
        quantity: item.quantity,
      };
    });

    // Create a new Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      billing_address_collection: "required",
      client_reference_id: userId, // Add user_id here
    };

    const stripeSession = await stripe.checkout.sessions.create(sessionParams);

    if (!stripeSession.url) {
      return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: stripeSession.url });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating checkout session:", error);

    // --- Log error to Supabase ---
    try {
      const supabaseAdmin = createAdminClient({
        global: {
          headers: {
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
        },
      });
      await supabaseAdmin.from('app_errors').insert({
        source: 'checkout_api',
        error_message: errorMessage,
        error_details: { 
          stack: error instanceof Error ? error.stack : 'N/A' 
        },
      });
    } catch (logError) {
      console.error("Failed to log error to Supabase:", logError);
    }
    // --- End logging ---

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}