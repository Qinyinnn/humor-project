"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DeletePostButtonProps = {
  postId: number;
};

export default function DeletePostButton({
  postId,
}: DeletePostButtonProps) {
  const supabase = createClient();
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("survival_posts")
        .delete()
        .eq("id", postId);

      if (deleteError) {
        throw deleteError;
      }

      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete post.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-full border border-[#174f82]/20 bg-white px-4 py-2 text-sm font-semibold text-[#405b73] transition hover:border-[#174f82]/40 hover:bg-[#edf6fc] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

      {error && <p className="mt-3 text-sm text-[#9f3f35]">{error}</p>}
    </div>
  );
}
