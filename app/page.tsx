import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const { data: jokes } = await supabase
    .from("jokes")
    .select("*");

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <nav className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Humor Project</h1>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-black">
              Home
            </Link>

            {user && (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-black">
                  Profile
                </Link>

                <Link href="/members" className="text-gray-600 hover:text-black">
                  Members
                </Link>

                <SignOutButton />
              </>
            )}
          </div>
        </nav>

        {!user ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-center text-2xl font-semibold">
              Welcome
            </h2>

            <p className="mb-6 text-center text-gray-500">
              Sign in to access your profile.
            </p>

            <GoogleSignInButton />
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-semibold">Jokes</h2>
              <p className="mt-1 text-gray-500">
                Have a laugh with them!
              </p>
            </div>

            <div className="grid gap-4">
              {jokes?.map((joke) => (
                <div
                  key={joke.id}
                  className="rounded-2xl border bg-white p-6 shadow-sm"
                >
                  <h3 className="text-lg font-medium">
                    {joke.setup}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {joke.punchline}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}