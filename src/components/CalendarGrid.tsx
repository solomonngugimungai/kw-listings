"use client";

import { useMemo, useState } from "react";
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { Listing, ListingStage, STAGE_THEME, Task } from "@/lib/types";

interface Props {
  tasks: Task[];
  listings: Pick<Listing, "id" | "nickname" | "address" | "stage" | "city">[];
}

export function CalendarGrid({ tasks, listings }: Props) {
  const [cursor, setCursor] = useState(startOfMonth(new Date()));

  const listingMap = useMemo(() => {
    const m = new Map<string, Props["listings"][number]>();
    for (const l of listings) m.set(l.id, l);
    return m;
  }, [listings]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const tasksByDay = useMemo(() => {
    const m = new Map<string, Task[]>();
    for (const t of tasks) {
      if (!t.due_at) continue;
      const key = format(new Date(t.due_at), "yyyy-MM-dd");
      const arr = m.get(key) ?? [];
      arr.push(t);
      m.set(key, arr);
    }
    return m;
  }, [tasks]);

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)]">
        <div>
          <div className="text-[19px] font-semibold tracking-tight">
            {format(cursor, "MMMM yyyy")}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="px-2.5 py-1 rounded-md text-[12px] font-medium border border-[var(--border)] hover:bg-[var(--background)]"
          >
            Today
          </button>
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="h-7 w-7 grid place-items-center rounded-md hover:bg-[var(--background)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="h-7 w-7 grid place-items-center rounded-md hover:bg-[var(--background)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--border)] text-[10.5px] font-semibold uppercase tracking-wider text-[var(--foreground-subtle)]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-3 py-2 border-r border-[var(--border)] last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(120px,_1fr)]">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const items = tasksByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          const isLastCol = (i + 1) % 7 === 0;
          const isLastRow = i >= days.length - 7;
          return (
            <div
              key={key}
              className={clsx(
                "p-2 border-[var(--border)]",
                !isLastCol && "border-r",
                !isLastRow && "border-b",
                !inMonth && "bg-[var(--background)]/60"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={clsx(
                    "text-[11.5px] font-semibold tabular-nums",
                    today
                      ? "h-5 min-w-5 px-1.5 rounded-full bg-[var(--accent)] text-white grid place-items-center"
                      : inMonth
                        ? "text-[var(--foreground)]"
                        : "text-[var(--foreground-subtle)]"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1">
                {items.slice(0, 3).map((t) => {
                  const l = listingMap.get(t.listing_id);
                  const stage = (l?.stage ?? "pre_list") as ListingStage;
                  const theme = STAGE_THEME[stage];
                  return (
                    <Link
                      key={t.id}
                      href={`/listings/${t.listing_id}`}
                      className={clsx(
                        "flex items-center gap-1 px-1.5 py-1 rounded text-[11px] truncate ring-1",
                        theme.bg,
                        theme.fg,
                        theme.ring,
                        "hover:opacity-90"
                      )}
                    >
                      <span className={clsx("h-1 w-1 rounded-full shrink-0", theme.dot)} />
                      <span className="font-medium truncate">
                        {format(new Date(t.due_at!), "h:mma").toLowerCase()}
                      </span>
                      <span className="truncate opacity-80">
                        {l?.nickname ?? l?.address?.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </Link>
                  );
                })}
                {items.length > 3 && (
                  <div className="text-[10.5px] text-[var(--foreground-muted)] px-1.5">
                    +{items.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
