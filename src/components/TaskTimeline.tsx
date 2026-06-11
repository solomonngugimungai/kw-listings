"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Circle, Clock, MoreHorizontal } from "lucide-react";
import { clsx } from "clsx";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { Task } from "@/lib/types";
import { formatDayKey, formatTimeOnly } from "@/lib/format";

interface Props {
  listingId: string;
  initial: Task[];
}

export function TaskTimeline({ listingId, initial }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initial);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tasks-${listingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `listing_id=eq.${listingId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((p) => [...p, payload.new as Task]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((p) =>
              p.map((t) =>
                t.id === (payload.new as Task).id ? (payload.new as Task) : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((p) =>
              p.filter((t) => t.id !== (payload.old as Task).id)
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);

  const grouped = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const ad = a.due_at ? new Date(a.due_at).getTime() : Infinity;
      const bd = b.due_at ? new Date(b.due_at).getTime() : Infinity;
      return ad - bd;
    });
    const map = new Map<string, Task[]>();
    for (const t of sorted) {
      const key = t.due_at ? formatDayKey(t.due_at) : "no-date";
      const arr = map.get(key) ?? [];
      arr.push(t);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [tasks]);

  async function toggleTask(t: Task) {
    const supabase = createClient();
    const newStatus = t.status === "done" ? "todo" : "done";
    setTasks((p) =>
      p.map((x) =>
        x.id === t.id
          ? {
              ...x,
              status: newStatus,
              completed_at:
                newStatus === "done" ? new Date().toISOString() : null,
            }
          : x
      )
    );
    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at:
          newStatus === "done" ? new Date().toISOString() : null,
      })
      .eq("id", t.id);
    if (error) {
      toast.error(error.message);
      setTasks((p) => p.map((x) => (x.id === t.id ? t : x)));
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-[13px] text-[var(--foreground-muted)]">
        No tasks yet — add the listing flow to start the timeline.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {grouped.map(([dayKey, items]) => {
        const dayLabel =
          dayKey === "no-date"
            ? "No date"
            : format(new Date(dayKey), "EEEE · MMM d");
        return (
          <div key={dayKey}>
            <div className="flex items-baseline gap-3 mb-2.5">
              <h3 className="text-[12.5px] font-semibold uppercase tracking-[0.08em]">
                {dayLabel}
              </h3>
              <span className="text-[11px] text-[var(--foreground-subtle)]">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <ul className="space-y-1.5">
              {items.map((t) => (
                <li key={t.id}>
                  <div
                    className={clsx(
                      "group relative flex items-start gap-3 px-3.5 py-3 rounded-lg border bg-[var(--surface)] transition-colors",
                      t.status === "done"
                        ? "border-[var(--border)] opacity-65"
                        : "border-[var(--border)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    <button
                      onClick={() => toggleTask(t)}
                      className={clsx(
                        "mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center border-2 transition-colors",
                        t.status === "done"
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-[var(--border-strong)] hover:border-[var(--accent)]"
                      )}
                    >
                      {t.status === "done" && <Check className="h-3 w-3" strokeWidth={3} />}
                      {t.status === "doing" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div
                        className={clsx(
                          "text-[14px] font-medium leading-snug",
                          t.status === "done" && "line-through text-[var(--foreground-muted)]"
                        )}
                      >
                        {t.title}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11.5px] text-[var(--foreground-muted)]">
                        {t.due_at && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeOnly(t.due_at)}
                            {t.duration_minutes ? ` · ${t.duration_minutes}m` : ""}
                          </span>
                        )}
                        {t.category && (
                          <span className="inline-flex items-center gap-1">
                            <Circle className="h-2 w-2 fill-current" />
                            {t.category}
                          </span>
                        )}
                        {t.status === "doing" && (
                          <span className="text-amber-700 font-medium">
                            In progress
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--foreground-subtle)] hover:text-[var(--foreground)]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
