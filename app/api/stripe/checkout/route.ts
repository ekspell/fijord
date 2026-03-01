import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const { email, priceId, successUrl, cancelUrl } = await req.json();

    if (!email || !priceId) {
      return NextResponse.json(
        { error: "Email and priceId are required", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: successUrl || `${origin}/?upgraded=true`,
      cancel_url: cancelUrl || `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session", code: "CHECKOUT_ERROR" },
      { status: 500 }
    );
  }
}
