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
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <nav className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Home
          </Link>

          <Link
            href="/members"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            Members
          </Link>
        </nav>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-8 py-7">
            <h1 className="text-3xl font-semibold tracking-tight">
              Your profile
            </h1>

            <p className="mt-2 text-gray-500">
              Manage your personal information and profile photo.
            </p>
          </div>

          <div className="px-8 py-8">
            <div className="mb-8 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Signed in as
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                {user.email}
              </p>
            </div>

            {!profile?.first_name || !profile?.last_name ? (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm text-amber-800">
                  Please complete your first and last name.
                </p>
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