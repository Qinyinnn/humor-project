import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-[#e8f3fb] px-4 py-8 text-[#101c2a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] bg-[#174f82] p-5 text-white shadow-[0_22px_50px_rgba(16,47,77,0.18)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a9d5f8]">
              Your profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">
              Update your Columbia profile
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm font-medium">
            <Link href="/" className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-white transition hover:bg-white/20">
              ← Feed
            </Link>
          </div>
        </header>

        <div className="overflow-hidden rounded-[30px] border border-[#174f82]/15 bg-white shadow-[0_20px_50px_rgba(16,47,77,0.1)]">
          <div className="border-b border-[#174f82]/10 px-5 py-6 sm:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#174f82]">
              Account
            </p>
            <p className="mt-2 text-sm text-[#5e7388]">Signed in as {user.email}</p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-8">
            {!profile?.first_name || !profile?.last_name ? (
              <div className="mb-6 rounded-2xl border border-[#75aadb]/40 bg-[#edf6fc] px-4 py-3 text-sm font-medium text-[#174f82]">
                Please complete your first and last name.
              </div>
            ) : null}

            <ProfileForm
              userId={user.id}
              firstName={profile?.first_name ?? null}
              lastName={profile?.last_name ?? null}
              avatarUrl={profile?.avatar_url ?? null}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
