import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <nav className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            ← Back to Home
          </Link>

          <Link
            href="/profile"
            className="text-sm font-medium text-gray-600 hover:text-black"
          >
            Profile
          </Link>
        </nav>

        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-400">
              Members only
            </p>

            <h1 className="text-4xl font-semibold tracking-tight">
              Welcome to the Members Area
            </h1>

            <p className="mt-3 max-w-2xl text-gray-500">
              This page is protected and can only be viewed by signed-in users.
              More members-only features can be added here later.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </main>
  );
}