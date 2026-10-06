import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { formatSurvivalAdvice } from "@/lib/format-survival-advice";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import SignOutButton from "@/components/SignOutButton";
import VoteButtons from "./feed/VoteButtons";

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

  if (!user) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#e8f3fb] text-[#101c2a]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <header className="mb-12 flex items-center justify-between gap-4 border-b border-[#174f82]/15 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#174f82] text-sm font-black tracking-[0.15em] text-white shadow-[0_10px_24px_rgba(23,79,130,0.25)]">
                CS
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#174f82]">
                  Columbia
                </p>
                <h1 className="text-lg font-bold tracking-tight text-[#101c2a]">
                  Survival Guide
                </h1>
              </div>
            </div>
            <div className="hidden -rotate-2 rounded-full border border-[#174f82]/20 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#174f82] shadow-sm sm:block">
              Columbia, unfiltered
            </div>
          </header>

          <div className="relative grid items-center gap-6 lg:grid-cols-[1.28fr_0.72fr]">
            <section className="fade-up relative isolate overflow-hidden rounded-[34px] bg-[#75aadb] p-7 text-[#102943] shadow-[0_28px_70px_rgba(23,79,130,0.2)] sm:p-10 lg:p-14">
              <div className="blueprint-dots absolute inset-0 -z-10 opacity-70" />
              <div className="absolute -right-14 -top-20 -z-10 h-64 w-64 rounded-full border-[34px] border-white/20" />
              <div className="absolute bottom-8 right-10 hidden -rotate-6 rounded-xl border border-white/50 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#174f82] shadow-sm lg:block">
                Built on Broadway
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#174f82]">
                The campus survival manual
              </p>
              <h2 className="mt-5 max-w-3xl text-5xl font-black leading-[0.97] tracking-[-0.065em] text-[#101c2a] sm:text-6xl lg:text-7xl">
                Get funny, useful advice for surviving Columbia.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#173b5d] sm:text-xl">
                From registration panic to 8 a.m. lectures: turn campus chaos into a story you can laugh about later.
              </p>
              <div className="mt-8 max-w-sm">
                <GoogleSignInButton />
              </div>
            </section>

            <aside className="fade-up relative space-y-4 lg:translate-y-10">
              <div className="absolute -right-7 -top-8 h-20 w-20 rotate-12 rounded-3xl bg-[#174f82] shadow-lg" />
              <div className="space-y-4">
                <div className="editorial-card relative rounded-[26px] border border-[#174f82]/15 bg-white p-5 shadow-[0_20px_40px_rgba(16,47,77,0.12)] sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#174f82]">
                    Dispatch from campus / 001
                  </p>
                  <p className="mt-5 text-2xl font-bold leading-8 tracking-[-0.04em] text-[#101c2a]">
                    “I have three exams, no sleep, and one seminar that somehow starts at 8:40 a.m.”
                  </p>
                  <div className="mt-5 inline-flex -rotate-2 rounded-full bg-[#d6eafa] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#174f82]">
                    Extremely Columbia
                  </div>
                </div>

                <div className="editorial-card ml-8 rounded-[26px] bg-[#102943] p-5 text-white shadow-[0_20px_40px_rgba(16,47,77,0.17)] sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9bc9f0]">
                    Community mood
                  </p>
                  <p className="mt-3 text-lg font-medium leading-7 text-white">
                    Real student chaos. Witty advice. The group chat gets a feed.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    );
  }

  const { data: posts, error } = await supabase
    .from("survival_posts")
    .select(`
      id,
      situation,
      title,
      content,
      created_at,
      profiles (
        first_name,
        last_name,
        avatar_url
      ),
      votes (
        user_id,
        vote_value
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Feed error:", error);

    return (
      <main className="min-h-screen bg-[#e8f3fb] p-6 text-[#101c2a] sm:p-10">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#174f82]/15 bg-white p-8 shadow-[0_18px_40px_rgba(16,47,77,0.1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#174f82]">Community feed</p>
          <p className="mt-4 text-lg text-[#33465a]">Error loading community feed: {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e8f3fb] text-[#101c2a]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-[#174f82]/15 px-1 py-4 sm:px-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#174f82] text-sm font-black tracking-[0.2em] text-white">
                CS
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#174f82]">
                  Columbia
                </p>
                <h1 className="text-xl font-bold tracking-tight text-[#101c2a]">
                  Survival Guide
                </h1>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <Link href="/" className="rounded-full bg-[#174f82] px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#103b64]">
                Feed
              </Link>
              <Link href="/my-posts" className="rounded-full px-4 py-2 text-[#33465a] transition hover:bg-white hover:text-[#174f82]">
                My Posts
              </Link>
              <Link href="/profile" className="rounded-full px-4 py-2 text-[#33465a] transition hover:bg-white hover:text-[#174f82]">
                Profile
              </Link>
              <SignOutButton />
            </nav>
          </div>
        </header>

        <section className="relative mb-8 flex flex-col gap-5 overflow-hidden rounded-[30px] bg-[#174f82] p-6 text-white shadow-[0_24px_55px_rgba(16,47,77,0.2)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="blueprint-dots absolute inset-0 opacity-30" />
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[40px] border-white/10" />
          <div>
            <p className="relative text-[11px] font-black uppercase tracking-[0.2em] text-[#a9d5f8]">
              Columbia student dispatches
            </p>
            <h2 className="relative mt-2 max-w-3xl text-2xl font-black tracking-[-0.05em] text-white sm:text-4xl">
              See how Columbia students are surviving their latest crises.
            </h2>
          </div>

          <Link
            href="/generate"
            className="relative inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-[#f5b6cb] px-7 py-5 text-base font-black text-[#3f1e2c] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#f9cbd9] hover:shadow-md active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d75b88] text-xl leading-none text-white">
              +
            </span>
            Get My Survival Advice — Click Here
          </Link>
        </section>

        {!posts || posts.length === 0 ? (
          <div className="rounded-[28px] border border-[#174f82]/15 bg-white p-8 text-center shadow-[0_18px_40px_rgba(16,47,77,0.08)]">
            <h3 className="text-2xl font-bold text-[#101c2a]">No survival advice yet.</h3>
            <p className="mt-3 text-base text-[#5e7388]">
              Be the first person to share a Columbia crisis.
            </p>
            <Link
              href="/generate"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#174f82] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#103b64]"
            >
              Generate Advice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {posts.map((post) => {
              const helpfulFunnyCount =
                post.votes?.filter((vote) => vote.vote_value === 1).length ?? 0;

              const doesntHitCount =
                post.votes?.filter((vote) => vote.vote_value === 0).length ?? 0;

              const currentUserVote =
                post.votes?.find((vote) => vote.user_id === user.id)?.vote_value ?? null;

              return (
                <article
                  key={post.id}
                  className="editorial-card fade-up rounded-[28px] border border-[#174f82]/15 bg-white p-5 shadow-[0_18px_42px_rgba(16,47,77,0.09)] sm:p-6"
                >
                  <div className="mx-auto w-full max-w-3xl">
                  <p className="inline-flex -rotate-1 rounded-full bg-[#d6eafa] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">
                    Campus dispatch
                  </p>

                  <h3 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#101c2a] sm:text-4xl">
                    {post.title}
                  </h3>

                  <div className="mt-5 rounded-2xl border-l-4 border-[#75aadb] bg-[#edf6fc] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174f82]">
                      The Crisis
                    </p>
                    <p className="mt-2 text-base leading-7 text-[#263f58]">
                      {post.situation}
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174f82]">
                      The Survival Advice
                    </p>
                    <p className="mt-3 whitespace-pre-line text-lg leading-8 text-[#17283a]">
                      {formatSurvivalAdvice(post.content)}
                    </p>
                  </div>

                  <VoteButtons
                    postId={post.id}
                    initialHelpfulFunny={helpfulFunnyCount}
                    initialDoesntHit={doesntHitCount}
                    initialUserVote={currentUserVote}
                  />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
