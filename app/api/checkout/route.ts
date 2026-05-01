import { NextResponse, type NextRequest } from "next/server";
import { createStripeClient } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Listing } from "@/lib/types";

export async function POST(request: NextRequest) {
  const stripe = createStripeClient();
  const supabase = createSupabaseAdminClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe secret key is not configured" },
      { status: 500 }
    );
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role key is not configured" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { listingId?: string };

  if (!body.listingId) {
    return NextResponse.json({ error: "Missing listing ID" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", body.listingId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const listing = data as Listing;

  if (
    listing.status !== "published" ||
    listing.intent !== "buy" ||
    listing.price_cents === null ||
    listing.quantity < 1
  ) {
    return NextResponse.json(
      { error: "This listing is not available for checkout" },
      { status: 400 }
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/inventory/${listing.slug}?checkout=success`,
    cancel_url: `${siteUrl}/inventory/${listing.slug}?checkout=cancelled`,
    customer_creation: "if_required",
    metadata: {
      listing_id: listing.id
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: listing.price_cents,
          product_data: {
            name: listing.name,
            description:
              [listing.set_name, listing.card_number, listing.condition]
                .filter(Boolean)
                .join(" | ") || undefined,
            images: listing.image_urls.slice(0, 8)
          }
        }
      }
    ]
  });

  const { error: orderError } = await supabase.from("orders").insert({
    listing_id: listing.id,
    stripe_checkout_session_id: session.id,
    amount_total_cents: listing.price_cents,
    currency: "usd",
    status: "pending"
  });

  if (orderError) {
    return NextResponse.json(
      { error: "Unable to create order record" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
