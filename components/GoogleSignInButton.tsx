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
      className="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50"
    >
      <span className="text-lg">G</span>
      Continue with Google
    </button>
  );
}