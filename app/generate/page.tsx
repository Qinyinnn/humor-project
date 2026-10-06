"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatSurvivalAdvice } from "@/lib/format-survival-advice";

export default function GeneratePage() {
  const supabase = createClient();
  const router = useRouter();

  const [situation, setSituation] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleGenerate() {
    if (!situation.trim()) {
      setError("Please enter a situation first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    setTitle("");
    setContent("");
    setAiPrompt("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while generating.");
      }

      setTitle(data.title);
      setContent(data.content);
      setAiPrompt(data.aiPrompt);
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate survival advice.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePost() {
    setPosting(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setError("You must be logged in to post survival advice.");
        return;
      }

      const { error: insertError } = await supabase
        .from("survival_posts")
        .insert({
          user_id: user.id,
          situation: situation,
          ai_prompt: aiPrompt,
          title: title,
          content: content,
        });

      if (insertError) {
        throw insertError;
      }

      setMessage("Posted successfully!");
    } catch (err) {
      console.error("Post error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to post survival advice.");
      }
    } finally {
      setPosting(false);
    }
  }

  function handleDiscard() {
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#e8f3fb] px-4 py-6 text-[#101c2a] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-full border border-[#174f82]/20 bg-white px-4 py-2 text-sm font-semibold text-[#174f82] transition hover:-translate-x-0.5 hover:border-[#174f82]/40 hover:bg-[#f2f8fc]"
          >
            ← Back to Feed
          </button>
        </div>

        <section className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#174f82]">
            Columbia Survival Guide / field notes
          </p>
          <h1 className="mt-3 max-w-3xl text-5xl font-black tracking-[-0.06em] text-[#101c2a] sm:text-6xl">
            What’s going wrong?
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-[#405b73]">
            Tell us your latest Columbia crisis and get some survival advice.
          </p>
        </section>

        <section className="rounded-[30px] border border-[#174f82]/15 bg-white p-5 shadow-[0_20px_50px_rgba(16,47,77,0.1)] sm:p-7">
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#75aadb]/30 bg-[#edf6fc] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">01 / begin</p>
              <p className="mt-1 font-semibold text-[#17283a]">Describe your crisis</p>
            </div>
            <div className="rounded-2xl border border-[#75aadb]/30 bg-[#edf6fc] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">02 / riff</p>
              <p className="mt-1 font-semibold text-[#17283a]">Generate advice</p>
            </div>
            <div className="rounded-2xl border border-[#75aadb]/30 bg-[#edf6fc] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">03 / review</p>
              <p className="mt-1 font-semibold text-[#17283a]">Review the result</p>
            </div>
            <div className="rounded-2xl border border-[#75aadb]/30 bg-[#edf6fc] p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#174f82]">04 / decide</p>
              <p className="mt-1 font-semibold text-[#17283a]">Post or return</p>
            </div>
          </div>

          <label htmlFor="situation" className="mb-2 block text-sm font-bold text-[#17283a]">
            Your crisis
          </label>
          <textarea
            id="situation"
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder="Example: I have three midterms today and only slept two hours last night."
            rows={6}
            className="w-full resize-y rounded-2xl border border-[#174f82]/20 bg-[#f9fcfe] px-4 py-3.5 text-base leading-7 text-[#101c2a] outline-none transition focus:border-[#174f82] focus:ring-2 focus:ring-[#75aadb]/30"
          />

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#174f82] px-5 py-3.5 text-base font-bold text-white shadow-[0_10px_24px_rgba(23,79,130,0.2)] transition duration-200 hover:-translate-y-1 hover:bg-[#103b64] hover:shadow-[0_15px_30px_rgba(23,79,130,0.25)] disabled:cursor-not-allowed disabled:bg-[#71879a]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Generating your survival advice...
              </span>
            ) : (
              "Generate Survival Advice"
            )}
          </button>
        </section>

        {error && (
          <div className="mt-5 rounded-2xl border border-[#f4d3d0] bg-[#fff3f1] px-4 py-3 text-sm font-medium text-[#9f3f35]">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-2xl border border-[#cfe8d4] bg-[#eef8f0] px-4 py-4">
            <p className="font-semibold text-[#1f2d25]">{message}</p>
          </div>
        )}

        {content && !message && (
          <section className="fade-up mt-8 rounded-[30px] border border-[#174f82]/15 bg-white p-5 shadow-[0_24px_55px_rgba(16,47,77,0.12)] sm:p-7">
            <p className="inline-flex -rotate-1 rounded-full bg-[#d6eafa] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#174f82]">
              Your survival advice
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] text-[#101c2a] sm:text-5xl">
              {title}
            </h2>

            <div className="mt-5 rounded-2xl border-l-4 border-[#75aadb] bg-[#edf6fc] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#174f82]">
                Your Crisis
              </p>
              <p className="mt-2 text-base leading-7 text-[#263f58]">
                {situation}
              </p>
            </div>

            <p className="mt-5 whitespace-pre-line text-lg leading-8 text-[#17283a]">
              {formatSurvivalAdvice(content)}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handlePost}
                disabled={posting}
                className="flex-1 rounded-2xl bg-[#174f82] px-5 py-3.5 text-base font-bold text-white transition duration-200 hover:-translate-y-1 hover:bg-[#103b64] disabled:cursor-not-allowed disabled:bg-[#71879a]"
              >
                {posting ? "Posting..." : "Post to Community Feed"}
              </button>

              <button
                onClick={handleDiscard}
                disabled={posting}
                className="flex-1 rounded-2xl border border-[#174f82]/20 bg-white px-5 py-3.5 text-base font-semibold text-[#174f82] transition duration-200 hover:-translate-y-0.5 hover:border-[#174f82]/40 hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Not for me — return to Feed
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
