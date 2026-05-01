import Link from "next/link";
import type { Listing } from "@/lib/types";
import { formatMoney } from "@/lib/format";

type ListingCardProps = {
  listing: Listing;
};

export function ListingCard({ listing }: ListingCardProps) {
  const primaryImage = listing.image_urls[0];

  return (
    <article className="listing-card">
      <div className="listing-image">
        {primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={primaryImage} alt={listing.name} />
        ) : (
          <span>Twin Unity TCG</span>
        )}
      </div>
      <div className="badge-row">
        <span className="badge">{listing.category}</span>
        <span className="badge">{listing.intent}</span>
        {listing.grade ? <span className="badge">{listing.grade}</span> : null}
      </div>
      <h3>{listing.name}</h3>
      <p>
        {[listing.set_name, listing.card_number, listing.condition]
          .filter(Boolean)
          .join(" | ")}
      </p>
      <p className="price">{formatMoney(listing.price_cents)}</p>
      <div className="actions">
        <Link className="btn secondary" href={`/inventory/${listing.slug}`}>
          View Listing
        </Link>
      </div>
    </article>
  );
}
