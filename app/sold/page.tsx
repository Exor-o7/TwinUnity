import { ListingCard } from "@/components/ListingCard";
import { getSoldListings } from "@/lib/supabase";

const RECENTLY_SOLD_DAYS = 7;

export default async function SoldPage() {
  const listings = await getSoldListings();
  // Recently Sold is intentionally time-based; older sold products stay hidden.
  // eslint-disable-next-line react-hooks/purity
  const cutoff = Date.now() - RECENTLY_SOLD_DAYS * 24 * 60 * 60 * 1000;
  const recentlySold = listings.filter(
    (listing) => new Date(listing.updated_at).getTime() >= cutoff
  );

  return (
    <main className="section">
      <div className="container">
        <div className="section-heading product-heading">
          <div>
            <h1>Recently Sold</h1>
            <p className="lead">
              Products sold within the last 7 days. Sold items are removed from
              shopping categories automatically.
            </p>
          </div>
        </div>

        {recentlySold.length > 0 ? (
          <div className="listing-grid">
            {recentlySold.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="panel">
            <h2>No recent sold items</h2>
            <p>Recently sold products will appear here for 7 days.</p>
          </div>
        )}
      </div>
    </main>
  );
}
