import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAuthClient } from "@/lib/supabase";

export async function requireAdmin(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.replace("Bearer ", "");
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!token) {
    return {
      error: NextResponse.json({ error: "Missing auth token" }, { status: 401 })
    };
  }

  if (adminEmails.length === 0) {
    return {
      error: NextResponse.json(
        { error: "ADMIN_EMAILS must include at least one admin email" },
        { status: 500 }
      )
    };
  }

  const supabase = createSupabaseAuthClient();

  if (!supabase) {
    return {
      error: NextResponse.json(
        { error: "Supabase environment variables are not configured" },
        { status: 500 }
      )
    };
  }

  const { data, error } = await supabase.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email || !adminEmails.includes(email)) {
    return {
      error: NextResponse.json({ error: "Admin access required" }, { status: 403 })
    };
  }

  return { user: data.user };
}
