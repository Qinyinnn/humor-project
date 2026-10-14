"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type VoteButtonsProps = {
  postId: number;
  initialHelpfulFunny: number;
  initialDoesntHit: number;
  initialUserVote: number | null;
};

export default function VoteButtons({
  postId,
  initialHelpfulFunny,
  initialDoesntHit,
  initialUserVote,
}: VoteButtonsProps) {
  const supabase = createClient();

  const [helpfulFunnyCount, setHelpfulFunnyCount] =
    useState(initialHelpfulFunny);

  const [doesntHitCount, setDoesntHitCount] = useState(initialDoesntHit);

  const [userVote, setUserVote] = useState<number | null>(initialUserVote);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleVote(value: number) {
    // Clicking the selected option removes the user's vote.
    const nextVote = userVote === value ? null : value;
    const previousVote = userVote;
    const previousHelpfulFunnyCount = helpfulFunnyCount;
    const previousDoesntHitCount = doesntHitCount;

    if (previousVote === null) {
      if (nextVote === 1) {
        setHelpfulFunnyCount((count) => count + 1);
      } else if (nextVote === 0) {
        setDoesntHitCount((count) => count + 1);
      }
    } else if (previousVote === 1 && nextVote === 0) {
      setHelpfulFunnyCount((count) => count - 1);
      setDoesntHitCount((count) => count + 1);
    } else if (previousVote === 0 && nextVote === 1) {
      setDoesntHitCount((count) => count - 1);
      setHelpfulFunnyCount((count) => count + 1);
    } else if (previousVote === 1 && nextVote === null) {
      setHelpfulFunnyCount((count) => count - 1);
    } else if (previousVote === 0 && nextVote === null) {
      setDoesntHitCount((count) => count - 1);
    }

    setUserVote(nextVote);
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setHelpfulFunnyCount(previousHelpfulFunnyCount);
        setDoesntHitCount(previousDoesntHitCount);
        setUserVote(previousVote);
        setError("You must be logged in to vote.");
        return;
      }

      const { error: voteError } = nextVote === null
        ? await supabase
            .from("votes")
            .delete()
            .eq("user_id", user.id)
            .eq("post_id", postId)
        : await supabase
            .from("votes")
            .upsert(
              {
                user_id: user.id,
                post_id: postId,
                vote_value: nextVote,
              },
              {
                onConflict: "user_id,post_id",
              }
            );

      if (voteError) {
        throw voteError;
      }
    } catch (err) {
      console.error("Vote error:", err);
      setHelpfulFunnyCount(previousHelpfulFunnyCount);
      setDoesntHitCount(previousDoesntHitCount);
      setUserVote(previousVote);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit vote.");
      }
    } finally {
      setLoading(false);
    }
  }

  const baseClasses =
    "inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleVote(1)}
          disabled={loading}
          className={`${baseClasses} ${
            userVote === 1
              ? "reaction-pop border-[#174f82] bg-[#d6eafa] text-[#103b64] shadow-[0_5px_14px_rgba(23,79,130,0.15)]"
              : "border-[#174f82]/20 bg-white text-[#33465a] hover:border-[#75aadb] hover:bg-[#edf6fc]"
          }`}
        >
          😂 Helpful / Funny ({helpfulFunnyCount})
        </button>

        <button
          onClick={() => handleVote(0)}
          disabled={loading}
          className={`${baseClasses} ${
            userVote === 0
              ? "reaction-pop border-[#174f82] bg-[#174f82] text-white shadow-[0_5px_14px_rgba(23,79,130,0.2)]"
              : "border-[#174f82]/20 bg-white text-[#33465a] hover:border-[#75aadb] hover:bg-[#edf6fc]"
          }`}
        >
          😐 Doesn’t Hit ({doesntHitCount})
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-[#9f3f35]">{error}</p>}
    </div>
  );
}
