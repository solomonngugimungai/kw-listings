"use client";

import { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  CirclePlus,
  MessageSquare,
  Bell,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Activity, ActivityKind, Listing, Profile, STAGE_LABELS } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { clsx } from "clsx";

interface Props {
  initial: (Activity & {
    listing?: Pick<Listing, "id" | "address" | "nickname"> | null;
    actor?: Profile | null;
  })[];
}

const KIND_META: Record<
  ActivityKind,
  { icon: typeof CalendarClock; verb: string; color: string }
> = {
  listing_created: { icon: CirclePlus, verb: "added", color: "text-emerald-600" },
  stage_changed: { icon: ArrowRightLeft, verb: "moved", color: "text-sky-600" },
  task_created: { icon: CalendarClock, verb: "scheduled", color: "text-amber-600" },
  task_completed: { icon: CheckCircle2, verb: "completed", color: "text-emerald-600" },
  task_due_changed: { icon: CalendarClock, verb: "rescheduled", color: "text-orange-600" },
  comment_added: { icon: MessageSquare, verb: "commented on", color: "text-violet-600" },
  subscribed: { icon: Bell, verb: "subscribed to", color: "text-[var(--accent)]" },
  unsubscribed: { icon: BellOff, verb: "unsubscribed from", color: "text-zinc-500" },
};

export function ActivityFeed({ initial }: Props) {
  const [items, setItems] = useState(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity" },
        async (payload) => {
          const a = payload.new as Activity;
          // Re-fetch with joins for nicer display
          const { data } = await supabase
            .from("activity")
            .select(
              "*, listing:listings(id,address,nickname), actor:profiles(id,full_name,email,role,avatar_color)"
            )
            .eq("id", a.id)
            .maybeSingle();
          if (data) {
            setItems((prev) => [data as Props["initial"][number], ...prev]);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[13px] text-[var(--foreground-muted)]">
        Nothing yet — the feed lights up as Marie works.
      </div>
    );
  }

  return (
    <ol className="relative">
      <div className="absolute left-[19px] top-3 bottom-3 w-px bg-[var(--border)]" />
      {items.map((a) => {
        const meta = KIND_META[a.kind];
        const Icon = meta.icon;
        const listingLabel =
          a.listing?.nickname ?? a.listing?.address ?? "a listing";
        return (
          <li key={a.id} className="relative pl-12 pr-2 py-2.5">
            <div
              className={clsx(
                "absolute left-2 top-3 h-8 w-8 rounded-full grid place-items-center bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]",
                meta.color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-[13.5px] leading-snug min-w-0">
                <span className="font-semibold">
                  {a.actor?.full_name ?? "Someone"}
                </span>{" "}
                <span className="text-[var(--foreground-muted)]">{meta.verb}</span>{" "}
                {a.listing ? (
                  <Link
                    href={`/listings/${a.listing.id}`}
                    className="font-semibold hover:underline"
                  >
                    {listingLabel}
                  </Link>
                ) : (
                  <span className="font-semibold">{listingLabel}</span>
                )}
                <ActivityPayload kind={a.kind} payload={a.payload} />
              </div>
              <span className="text-[11px] text-[var(--foreground-subtle)] shrink-0 tabular-nums">
                {timeAgo(a.created_at)}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ActivityPayload({
  kind,
  payload,
}: {
  kind: ActivityKind;
  payload: Record<string, unknown>;
}) {
  if (kind === "stage_changed") {
    const from = STAGE_LABELS[payload.from as keyof typeof STAGE_LABELS];
    const to = STAGE_LABELS[payload.to as keyof typeof STAGE_LABELS];
    return (
      <span className="text-[var(--foreground-muted)]">
        : {from} → <span className="font-medium text-[var(--foreground)]">{to}</span>
      </span>
    );
  }
  if (kind === "task_created" || kind === "task_completed") {
    return (
      <span className="text-[var(--foreground-muted)]">
        : <span className="text-[var(--foreground)]">{String(payload.title ?? "")}</span>
      </span>
    );
  }
  if (kind === "comment_added") {
    return (
      <span className="text-[var(--foreground-muted)]">
        : <em>“{String(payload.snippet ?? "")}”</em>
      </span>
    );
  }
  return null;
}
