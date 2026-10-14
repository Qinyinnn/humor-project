import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/`);
  }

  const email = user.email?.toLowerCase();
  const emailDomain = email?.split("@").pop();
  const allowedDomains = new Set(["columbia.edu", "barnard.edu", "alum.barnard.edu"]);

  if (
    !email ||
    !user.email_confirmed_at ||
    !emailDomain ||
    !allowedDomains.has(emailDomain)
  ) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?authError=columbia-email-required`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile?.first_name || !profile?.last_name) {
    return NextResponse.redirect(`${origin}/profile`);
  }

  return NextResponse.redirect(`${origin}/`);
}
