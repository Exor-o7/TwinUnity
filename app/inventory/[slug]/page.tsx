import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";
import { formatMoney } from "@/lib/format";
import { getListingBySlug } from "@/lib/supabase";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ListingDetailPage({
  params
}: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing || listing.status !== "published") {
    notFound();
  }

  const canCheckout =
    listing.intent === "buy" &&
    listing.price_cents !== null &&
    listing.quantity > 0;
  const primaryImage = listing.image_urls[0];

  return (
    <main className="section">
      <div className="container">
        <Link href="/inventory">Back to inventory</Link>
        <div className="detail-grid section">
          <div className="listing-image">
            {primaryImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primaryImage} alt={listing.name} />
            ) : (
              <span>Twin Unity TCG</span>
            )}
          </div>

          <article>
            <div className="badge-row">
              <span className="badge">{listing.category}</span>
              <span className="badge">{listing.intent}</span>
              <span className="badge">{listing.status}</span>
            </div>
            <h1>{listing.name}</h1>
            <p className="price">{formatMoney(listing.price_cents)}</p>
            <p className="lead">{listing.description}</p>

            <dl className="spec-list">
              <div>
                <dt>Set</dt>
                <dd>{listing.set_name ?? "N/A"}</dd>
              </div>
              <div>
                <dt>Card Number</dt>
                <dd>{listing.card_number ?? "N/A"}</dd>
              </div>
              <div>
                <dt>Condition</dt>
                <dd>{listing.condition ?? "N/A"}</dd>
              </div>
              <div>
                <dt>Grade</dt>
                <dd>{listing.grade ?? "Raw / Ungraded"}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{listing.quantity}</dd>
              </div>
            </dl>

            <div className="actions">
              {canCheckout ? (
                <CheckoutButton listingId={listing.id} />
              ) : (
                <a className="btn primary" href="mailto:hello@twinunitytcg.com">
                  Contact Twin Unity
                </a>
              )}
              <a
                className="btn secondary"
                href="https://www.instagram.com/twin_unity/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask on Instagram
              </a>
            </div>

            {listing.notes ? <p className="status-message">{listing.notes}</p> : null}
          </article>
        </div>
      </div>
    </main>
  );
}
