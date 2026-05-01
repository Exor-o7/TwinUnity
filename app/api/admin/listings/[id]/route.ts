import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  createSupabaseAdminClient,
  deleteListing,
  updateListing
} from "@/lib/supabase";
import { listingSchema } from "@/lib/validation";

type ListingParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: ListingParams) {
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
  const parsed = listingSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid listing" },
      { status: 400 }
    );
  }

  const { id } = await params;
  const listing = await updateListing(supabase, id, parsed.data);
  return NextResponse.json({ listing });
}

export async function DELETE(request: NextRequest, { params }: ListingParams) {
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

  const { id } = await params;
  await deleteListing(supabase, id);
  return NextResponse.json({ ok: true });
}
