import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

export async function POST(request: NextRequest) {
  const stripe = createStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabase = createSupabaseAdminClient();

  if (!stripe || !webhookSecret || !supabase) {
    return NextResponse.json(
      { error: "Stripe webhook or Supabase is not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const listingId = session.metadata?.listing_id;

    if (!listingId) {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        buyer_email: session.customer_details?.email ?? null
      })
      .eq("stripe_checkout_session_id", session.id);

    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", listingId)
      .single();

    if (data) {
      const listing = data as Listing;
      const nextQuantity = Math.max(0, listing.quantity - 1);

      await supabase
        .from("listings")
        .update({
          quantity: nextQuantity,
          status: nextQuantity === 0 ? "sold" : listing.status
        })
        .eq("id", listing.id);
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("stripe_checkout_session_id", session.id);
  }

  return NextResponse.json({ received: true });
}
