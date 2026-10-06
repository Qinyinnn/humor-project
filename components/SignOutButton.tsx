"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="rounded-full border border-[#174f82]/20 bg-white px-3 py-2 text-sm font-semibold text-[#33465a] transition hover:-translate-y-0.5 hover:border-[#174f82]/40 hover:bg-[#edf6fc]"
    >
      Sign out
    </button>
  );
}
