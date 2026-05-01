export type ListingCategory = "single" | "graded" | "sealed" | "collection";

export type ListingIntent = "buy" | "sell" | "trade";

export type ListingStatus = "draft" | "published" | "sold" | "archived";

export type Listing = {
  id: string;
  slug: string;
  name: string;
  category: ListingCategory;
  intent: ListingIntent;
  status: ListingStatus;
  set_name: string | null;
  card_number: string | null;
  condition: string | null;
  grade: string | null;
  price_cents: number | null;
  quantity: number;
  description: string | null;
  notes: string | null;
  image_urls: string[];
  created_at: string;
  updated_at: string;
};

export type ListingInput = Omit<Listing, "id" | "created_at" | "updated_at">;

export type OrderStatus = "pending" | "paid" | "cancelled" | "fulfilled";

export type Order = {
  id: string;
  listing_id: string;
  stripe_checkout_session_id: string;
  buyer_email: string | null;
  amount_total_cents: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
