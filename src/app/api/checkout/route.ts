import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil", // Use a specific API version
});

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create line items for Stripe Checkout
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = await Promise.all(
      items.map(async (item) => {
        // Supabaseから商品情報を取得
        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", item.productId)
          .single();

        if (error || !product) {
          throw new Error(`Product with ID ${item.productId} not found or error fetching: ${error?.message}`);
        }

        return {
          price_data: {
            currency: "jpy",
            product_data: {
              name: product.name,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}${product.image}`],
            },
            unit_amount: product.price, // Price in JPY
          },
          quantity: item.quantity,
        };
      })
    );

    // Create a new Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      billing_address_collection: "required",
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}