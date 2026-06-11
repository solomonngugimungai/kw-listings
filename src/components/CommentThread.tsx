"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Comment, Profile } from "@/lib/types";
import { timeAgo } from "@/lib/format";

interface Props {
  listingId: string;
  initial: (Comment & { author?: Profile | null })[];
}

export function CommentThread({ listingId, initial }: Props) {
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`comments-${listingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          const c = payload.new as Comment;
          setComments((prev) =>
            prev.find((x) => x.id === c.id) ? prev : [...prev, c]
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Sign in to comment (Supabase Auth → add user)");
      setSending(false);
      return;
    }
    const { error } = await supabase.from("comments").insert({
      listing_id: listingId,
      author_id: user.id,
      body: trimmed,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setBody("");
  }

  return (
    <div>
      <ul className="space-y-3 mb-4">
        {comments.length === 0 && (
          <li className="text-[13px] text-[var(--foreground-muted)] py-3">
            No comments yet. Start the thread.
          </li>
        )}
        {comments.map((c) => {
          const initials =
            c.author?.full_name
              ?.split(" ")
              .map((s) => s[0])
              .slice(0, 2)
              .join("") ?? "?";
          return (
            <li key={c.id} className="flex gap-3">
              <div
                className="h-8 w-8 rounded-full grid place-items-center text-[11.5px] font-semibold text-white shrink-0"
                style={{ background: c.author?.avatar_color ?? "#999" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold">
                    {c.author?.full_name ?? "Someone"}
                  </span>
                  <span className="text-[11px] text-[var(--foreground-subtle)]">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <div className="text-[13.5px] mt-0.5 whitespace-pre-wrap">
                  {c.body}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg pl-3 pr-1.5 py-1.5 focus-within:border-[var(--border-strong)]"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-[var(--foreground-subtle)]"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="h-7 w-7 grid place-items-center rounded-md bg-[var(--foreground)] text-[var(--surface)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--accent)] transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
