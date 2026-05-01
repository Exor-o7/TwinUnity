import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { getPublishedListings } from "@/lib/supabase";
import type { ListingCategory } from "@/lib/types";

const categories: Array<{ label: string; value?: ListingCategory }> = [
  { label: "All" },
  { label: "Singles", value: "single" },
  { label: "Graded", value: "graded" },
  { label: "Sealed", value: "sealed" },
  { label: "Collections", value: "collection" }
];

type InventoryPageProps = {
  searchParams: Promise<{ category?: ListingCategory }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const { category } = await searchParams;
  const listings = await getPublishedListings();
  const filteredListings = category
    ? listings.filter((listing) => listing.category === category)
    : listings;

  return (
    <main className="section">
      <div className="container">
        <p className="tag">Live Inventory</p>
        <h1>Shop, Trade, and Watch New Drops</h1>
        <p className="lead">
          Browse available Twin Unity TCG listings. Purchasable cards can go
          through checkout, while trade and sell listings route to direct
          contact.
        </p>

        <nav className="filters" aria-label="Inventory filters">
          {categories.map((item) => {
            const href = item.value ? `/inventory?category=${item.value}` : "/inventory";
            const active = item.value === category || (!item.value && !category);

            return (
              <Link className={active ? "active" : ""} href={href} key={item.label}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {filteredListings.length > 0 ? (
          <div className="grid three">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="panel">
            <h2>No listings found</h2>
            <p>
              Check back soon or choose a different category. New inventory can
              be added from the admin dashboard.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
