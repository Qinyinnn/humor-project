import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatSurvivalAdvice } from "@/lib/format-survival-advice";
import DeletePostButton from "./DeletePostButton";

export default async function MyPostsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: posts, error } = await supabase
    .from("survival_posts")
    .select(`
      id,
      situation,
      title,
      content,
      created_at,
      votes (
        vote_value
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#e8f3fb] px-4 py-10 text-[#101c2a] sm:px-6">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#174f82]/15 bg-white p-8 shadow-[0_18px_40px_rgba(16,47,77,0.1)]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#174f82]">My Posts</p>
          <p className="mt-4 text-lg text-[#33465a]">Failed to load your posts: {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e8f3fb] px-4 py-8 text-[#101c2a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="relative mb-8 flex flex-col gap-4 overflow-hidden rounded-[28px] bg-[#174f82] p-5 text-white shadow-[0_22px_50px_rgba(16,47,77,0.18)] sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div className="blueprint-dots absolute inset-0 opacity-30" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#a9d5f8]">
              Personal dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
              My Posts
            </h1>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/30 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              ← Back to Feed
            </Link>
            <Link
              href="/generate"
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#174f82] transition hover:-translate-y-0.5 hover:bg-[#dff0fc]"
            >
              Generate Advice
            </Link>
          </div>
        </header>

        {!posts || posts.length === 0 ? (
          <div className="rounded-[30px] border border-[#174f82]/15 bg-white p-8 text-center shadow-[0_18px_40px_rgba(16,47,77,0.08)]">
            <h2 className="text-2xl font-bold text-[#101c2a]">You haven’t posted anything yet.</h2>
            <p className="mt-3 text-base text-[#5e7388]">
              Generate some survival advice and share it with the community.
            </p>
            <Link
              href="/generate"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#174f82] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#103b64]"
            >
              Generate Advice
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => {
              const helpfulFunnyCount =
                post.votes?.filter((vote) => vote.vote_value === 1).length ?? 0;

              const doesntHitCount =
                post.votes?.filter((vote) => vote.vote_value === 0).length ?? 0;

              return (
                <article
                  key={post.id}
                  className="editorial-card fade-up rounded-[30px] border border-[#174f82]/15 bg-white p-5 shadow-[0_18px_40px_rgba(16,47,77,0.09)] sm:p-6"
                >
                  <p className="inline-flex -rotate-1 rounded-full bg-[#d6eafa] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">
                    Your campus dispatch
                  </p>

                  <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[#101c2a] sm:text-4xl">
                    {post.title}
                  </h2>

                  <div className="mt-5 rounded-2xl border-l-4 border-[#75aadb] bg-[#edf6fc] p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174f82]">
                      The Crisis
                    </p>
                    <p className="mt-2 text-base leading-7 text-[#263f58]">
                      {post.situation}
                    </p>
                  </div>

                  <p className="mt-5 whitespace-pre-line text-lg leading-8 text-[#17283a]">
                    {formatSurvivalAdvice(post.content)}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#174f82]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#75aadb]/30 bg-[#edf6fc] px-3 py-1.5 font-semibold">
                      😂 Helpful / Funny: {helpfulFunnyCount}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#75aadb]/30 bg-[#edf6fc] px-3 py-1.5 font-semibold">
                      😐 Doesn’t Hit: {doesntHitCount}
                    </span>
                  </div>

                  <DeletePostButton postId={post.id} />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
