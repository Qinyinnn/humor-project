"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: number;
  user_id: string;
  parent_comment_id: number | null;
  content: string;
  created_at: string;
  author: string;
};

type CommentReaction = {
  id: number;
  comment_id: number;
  user_id: string;
  emoji: string;
};

const QUICK_REACTIONS = ["❤️", "😂"];
const EMOJI_OPTIONS = [
  "😀", "😂", "🥰", "😍", "😎", "🤔", "😮", "😭", "😡", "🥺",
  "👍", "👎", "👏", "🙌", "🙏", "❤️", "💔", "🔥", "🎉", "💯",
  "✨", "💡", "👀", "🤝", "💪", "🚀", "☕", "🐶", "🌈", "🫶",
];

const supabase = createClient();

export default function CommentsSection({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<CommentReaction[]>([]);
  const [reactionBusy, setReactionBusy] = useState<string | null>(null);
  const [addingReactionTo, setAddingReactionTo] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadComments = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("comments")
      .select("id, user_id, parent_comment_id, content, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (loadError) {
      console.error("Comments query failed:", loadError);
      setError("Comments are unavailable right now.");
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    if (rows.length === 0) {
      setComments([]);
      setReactions([]);
      setError("");
      setLoading(false);
      return;
    }

    const authorIds = [...new Set(rows.map((row) => row.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", authorIds);
    const names = new Map((profiles ?? []).map((profile) => [
      profile.id,
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Columbia student",
    ]));

    const { data: reactionRows, error: reactionsError } = await supabase
      .from("comment_reactions")
      .select("id, comment_id, user_id, emoji")
      .in("comment_id", rows.map((row) => row.id));
    if (reactionsError) {
      console.error("Comment reactions query failed:", reactionsError);
      setReactions([]);
    } else {
      setReactions(reactionRows ?? []);
    }

    setComments(rows.map((row) => ({
      ...row,
      parent_comment_id: row.parent_comment_id ?? null,
      author: names.get(row.user_id) ?? "Columbia student",
    })));
    setError("");
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active) setUserId(user?.id ?? null);
    });
    loadComments();
    return () => { active = false; };
  }, [loadComments]);

  async function submitComment(event: React.FormEvent<HTMLFormElement>, parentCommentId: number | null) {
    event.preventDefault();
    const content = (parentCommentId === null ? draft : replyDraft).trim();
    if (!content || !userId) return;

    setSaving(true);
    setError("");
    setNotice("");
    const { error: insertError } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content,
      parent_comment_id: parentCommentId,
    });
    setSaving(false);
    if (insertError) {
      setError("Couldn’t post your comment. Please try again.");
      return;
    }
    if (parentCommentId === null) setDraft("");
    else {
      setReplyDraft("");
      setReplyingTo(null);
    }
    setNotice("Dispatch sent. The group chat appreciates you ✨");
    await loadComments();
  }

  async function deleteComment(comment: Comment) {
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", userId);
    if (deleteError) setError("Couldn’t delete your comment. Please try again.");
    else await loadComments();
  }

  async function toggleReaction(commentId: number, emoji: string) {
    if (!userId || reactionBusy) return;
    const busyKey = `${commentId}:${emoji}`;
    setReactionBusy(busyKey);
    const selected = reactions.some((reaction) =>
      reaction.comment_id === commentId && reaction.user_id === userId && reaction.emoji === emoji
    );
    const result = selected
      ? await supabase.from("comment_reactions").delete()
          .eq("comment_id", commentId).eq("user_id", userId).eq("emoji", emoji)
      : await supabase.from("comment_reactions").insert({
          comment_id: commentId,
          user_id: userId,
          emoji,
        });
    if (result.error) {
      console.error("Comment reaction update failed:", result.error);
      setError("Couldn’t update your reaction. Please try again.");
    } else {
      setReactions((current) => selected
        ? current.filter((reaction) => !(reaction.comment_id === commentId && reaction.user_id === userId && reaction.emoji === emoji))
        : [...current, { id: Date.now(), comment_id: commentId, user_id: userId, emoji }]);
      setError("");
    }
    setReactionBusy(null);
  }

  function renderComment(comment: Comment, depth = 0): React.ReactNode {
    const replies = comments.filter((item) => item.parent_comment_id === comment.id);
    return (
      <div key={comment.id} className={depth > 0 ? "ml-4 border-l-2 border-[#c6def2] pl-3 sm:ml-7 sm:pl-4" : ""}>
        <article className="rounded-xl bg-[#f4f8fb] px-3 py-2.5 transition-colors hover:bg-[#edf6fc]">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm leading-5 text-[#263f58]">
              <span className="mr-2 font-bold text-[#173b5d]">{comment.author}</span>{comment.content}
            </p>
            {userId === comment.user_id && <button type="button" onClick={() => deleteComment(comment)} className="shrink-0 text-xs leading-3 text-[#71849a] transition hover:text-[#9f3f35] focus:outline-none focus:underline">Delete</button>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5" aria-label="Reactions">
            {[...new Set([
              ...QUICK_REACTIONS,
              ...reactions.filter((reaction) => reaction.comment_id === comment.id).map((reaction) => reaction.emoji),
            ])].map((emoji) => {
              const emojiReactions = reactions.filter((reaction) => reaction.comment_id === comment.id && reaction.emoji === emoji);
              const selected = !!userId && emojiReactions.some((reaction) => reaction.user_id === userId);
              return (
                <button key={emoji} type="button" disabled={!userId || reactionBusy !== null}
                  onClick={() => toggleReaction(comment.id, emoji)} aria-label={`${emoji} reaction, ${emojiReactions.length}${selected ? ", selected by you" : ""}`}
                  aria-pressed={selected}
                  className={`inline-flex h-7 min-w-8 items-center justify-center gap-1 rounded-full border px-2 text-xs transition focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? "reaction-pop border-[#75aadb] bg-[#dceefa] text-[#103b64]" : "border-[#d9e4ed] bg-white/80 text-[#55718b] hover:border-[#9fc4e2] hover:bg-white"}`}>
                  <span>{emoji}</span><span className="font-semibold">{emojiReactions.length}</span>
                </button>
              );
            })}
            {userId && <div className="relative">
              <button type="button" disabled={reactionBusy !== null}
                onClick={() => setAddingReactionTo(addingReactionTo === comment.id ? null : comment.id)}
                aria-label="Add a reaction" title="Add a reaction"
                aria-expanded={addingReactionTo === comment.id}
                className="inline-flex h-7 items-center justify-center rounded-full border border-dashed border-[#b7cde0] bg-white/70 px-2 text-sm text-[#55718b] transition hover:border-[#75aadb] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:opacity-60">+</button>
              {addingReactionTo === comment.id && <div role="group" aria-label="Choose an emoji reaction"
                className="absolute left-0 top-full z-20 mt-1.5 grid w-52 grid-cols-6 gap-1 rounded-xl border border-[#d9e4ed] bg-white p-2 shadow-lg shadow-[#173b5d]/10">
                {EMOJI_OPTIONS.map((emoji) => <button key={emoji} type="button" disabled={reactionBusy !== null}
                  onClick={() => { void toggleReaction(comment.id, emoji); setAddingReactionTo(null); }}
                  aria-label={`${emoji} reaction`} title={emoji}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-base transition hover:bg-[#edf6fc] focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:opacity-50">{emoji}</button>)}
              </div>}
            </div>}
          </div>
          <div className="mt-2">
            <button type="button" disabled={!userId} onClick={() => {
              setReplyingTo(replyingTo === comment.id ? null : comment.id);
              setReplyDraft("");
            }} className="rounded px-0.5 py-0 text-[10px] leading-3 font-semibold text-[#174f82] transition hover:bg-white hover:underline focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:opacity-50">Reply</button>
          </div>
          {replyingTo === comment.id && (
            <form onSubmit={(event) => submitComment(event, comment.id)} className="mt-2 flex items-center gap-2">
              <input autoFocus value={replyDraft} onChange={(event) => setReplyDraft(event.target.value)} maxLength={1000} placeholder={`Reply to ${comment.author}…`} aria-label={`Reply to ${comment.author}`}
                className="min-w-0 flex-1 rounded-lg border border-[#d9e4ed] bg-white px-3 py-2 text-sm text-[#263f58] outline-none transition placeholder:text-[#91a0af] hover:border-[#b7cde0] focus:border-[#75aadb] focus:ring-2 focus:ring-[#75aadb]/20" />
              <button type="submit" disabled={saving || !replyDraft.trim()} className="rounded-lg bg-[#174f82] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#103b64] focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Sending…" : "Reply"}</button>
            </form>
          )}
        </article>
        {replies.length > 0 && <div className="mt-2 space-y-2">{replies.map((reply) => renderComment(reply, depth + 1))}</div>}
      </div>
    );
  }

  const topLevelComments = comments.filter((comment) => comment.parent_comment_id === null);

  return (
    <section className="mt-5 border-t border-[#174f82]/10 pt-4" aria-label="Comments">
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-bold text-[#174f82]">Conversation</h4>
        <span className="rounded-full bg-[#edf6fc] px-2 py-0.5 text-xs font-semibold text-[#55718b]">{comments.length}</span>
      </div>

      {loading ? <p className="inline-flex items-center gap-2 py-2 text-sm text-[#71849a]"><span className="animate-pulse">🦉</span> Checking the campus group chat…</p> : comments.length === 0 ? (
        <p className="rounded-xl bg-[#f4f8fb] px-3 py-2.5 text-sm text-[#71849a]">It’s quiet in here (for once). Drop the first thought or tip.</p>
      ) : <div className="space-y-2">{topLevelComments.map((comment) => renderComment(comment))}</div>}

      <form onSubmit={(event) => submitComment(event, null)} className="mt-3 flex items-center gap-2">
        <input value={draft} onChange={(event) => { setDraft(event.target.value); setNotice(""); }} maxLength={1000} disabled={!userId} placeholder={userId ? "Write a comment…" : "Sign in to join the conversation"} aria-label="Write a comment"
          className="min-w-0 flex-1 rounded-xl border border-[#d9e4ed] bg-white px-3 py-2.5 text-sm text-[#263f58] outline-none transition placeholder:text-[#91a0af] hover:border-[#b7cde0] focus:border-[#75aadb] focus:ring-2 focus:ring-[#75aadb]/20 disabled:bg-[#f4f8fb]" />
        <button type="submit" disabled={!userId || saving || !draft.trim()} className="rounded-xl bg-[#174f82] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#103b64] focus:outline-none focus:ring-2 focus:ring-[#75aadb]/60 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Sending…" : "Comment"}</button>
      </form>
      {notice && <p role="status" className="mt-2 text-xs font-semibold text-[#28724b]">{notice}</p>}
      {error && <p role="status" className="mt-2 text-xs text-[#9f3f35]">{error}</p>}
    </section>
  );
}
