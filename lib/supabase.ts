import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { sampleListings } from "@/lib/sample-data";
import type { Listing, ListingInput } from "@/lib/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl && supabaseServiceRoleKey
);

export function createBrowserSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function createSupabaseAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getPublishedListings() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return sampleListings;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load listings", error);
    return sampleListings;
  }

  return data as Listing[];
}

export async function getSoldListings() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return sampleListings.filter((listing) => listing.status === "sold");
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "sold")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Unable to load sold listings", error);
    return sampleListings.filter((listing) => listing.status === "sold");
  }

  return data as Listing[];
}

export async function getListingBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return sampleListings.find((listing) => listing.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Unable to load listing", error);
    return null;
  }

  return data as Listing;
}

export async function getAdminListings(client: SupabaseClient) {
  const { data, error } = await client
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as Listing[];
}

export async function createListing(
  client: SupabaseClient,
  listing: ListingInput
) {
  const { data, error } = await client
    .from("listings")
    .insert(listing)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Listing;
}

export async function updateListing(
  client: SupabaseClient,
  id: string,
  listing: Partial<ListingInput>
) {
  const { data, error } = await client
    .from("listings")
    .update(listing)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Listing;
}

export async function deleteListing(client: SupabaseClient, id: string) {
  const { error } = await client.from("listings").delete().eq("id", id);

  if (error) {
    throw error;
  }
}
