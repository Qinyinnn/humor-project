import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, check whether profile is complete
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    if (!profile?.first_name || !profile?.last_name) {
      redirect("/profile");
    }
  }

  const { data: jokes, error } = await supabase
    .from("jokes")
    .select("*");

  if (error) {
    return <p>Error loading jokes: {error.message}</p>;
  }

  // Logged-out welcome page
  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <nav className="mb-24">
            <h1 className="text-3xl font-bold tracking-tight">
              Humor Project
            </h1>
          </nav>

          <div className="flex justify-center">
            <div className="w-full max-w-xl rounded-3xl border border-gray-300 bg-white px-10 py-12 text-center shadow-sm">
              <h2 className="text-4xl font-semibold tracking-tight">
                Welcome
              </h2>

              <p className="mt-5 text-xl text-gray-500">
                Sign in to access your profile.
              </p>

              <div className="mt-10">
                <GoogleSignInButton />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Logged-in homepage
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <nav className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Humor Project
          </h1>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-gray-600 transition hover:text-black"
            >
              Home
            </Link>

            <Link
              href="/profile"
              className="text-gray-600 transition hover:text-black"
            >
              Profile
            </Link>

            <Link
              href="/members"
              className="text-gray-600 transition hover:text-black"
            >
              Members
            </Link>

            <SignOutButton />
          </div>
        </nav>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Jokes
          </h2>

          <p className="mt-2 text-gray-500">
            A few jokes loaded from Supabase.
          </p>
        </section>

        <div className="grid gap-4">
          {jokes?.map((joke) => (
            <div
              key={joke.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">
                {joke.setup}
              </h3>

              <p className="mt-2 text-gray-600">
                {joke.punchline}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}