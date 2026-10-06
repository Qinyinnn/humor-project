"use client";

import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton() {
  const handleLogin = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#174f82] bg-[#102943] px-5 py-3.5 text-base font-bold text-white shadow-[0_12px_28px_rgba(16,47,77,0.2)] transition duration-200 hover:-translate-y-1 hover:bg-[#174f82] focus:outline-none focus:ring-2 focus:ring-[#174f82]/25"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-black text-[#174f82]">
        G
      </span>
      Continue with Google
    </button>
  );
}
