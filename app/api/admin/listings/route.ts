import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createListing,
  createSupabaseAdminClient,
  getAdminListings
} from "@/lib/supabase";
import { listingSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin.error) {
    return admin.error;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role key is not configured" },
      { status: 500 }
    );
  }

  const listings = await getAdminListings(supabase);
  return NextResponse.json({ listings });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin.error) {
    return admin.error;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service role key is not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = listingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid listing" },
      { status: 400 }
    );
  }

  const listing = await createListing(supabase, parsed.data);
  return NextResponse.json({ listing }, { status: 201 });
}
