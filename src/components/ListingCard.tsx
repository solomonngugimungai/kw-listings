"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Bed, Bath, Ruler, CalendarClock, ListChecks } from "lucide-react";
import { clsx } from "clsx";
import { Listing, Task } from "@/lib/types";
import { formatPrice, formatDateRelative } from "@/lib/format";

interface Props {
  listing: Listing;
  tasks?: Task[];
}

export function ListingCard({ listing, tasks = [] }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: listing.id });

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const nextTask = tasks
    .filter((t) => t.status !== "done" && t.due_at)
    .sort(
      (a, b) =>
        new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime()
    )[0];

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: 50,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden card-lift",
        isDragging && "shadow-[var(--shadow-lg)] rotate-[0.6deg]"
      )}
    >
      {/* Cover */}
      <div
        {...listeners}
        {...attributes}
        className="relative aspect-[16/9] bg-[var(--background)] cursor-grab active:cursor-grabbing select-none"
      >
        {listing.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_image_url}
            alt={listing.address}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 dotted-bg" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-2.5 bottom-2.5 right-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-white text-[15.5px] font-semibold leading-tight tracking-tight drop-shadow-sm truncate">
              {listing.nickname ?? listing.address}
            </div>
            <div className="text-white/85 text-[11.5px] truncate">
              {listing.address} · {listing.city}
            </div>
          </div>
          <div className="text-white font-semibold text-[14px] drop-shadow-sm shrink-0">
            {formatPrice(listing.price_cents)}
          </div>
        </div>
      </div>

      <Link href={`/listings/${listing.id}`} className="block px-3.5 py-3">
        <div className="flex items-center gap-3 text-[12px] text-[var(--foreground-muted)]">
          {listing.beds != null && (
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" /> {listing.beds}
            </span>
          )}
          {listing.baths != null && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {listing.baths}
            </span>
          )}
          {listing.sqft != null && (
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {listing.sqft.toLocaleString()}
            </span>
          )}
        </div>

        {totalTasks > 0 && (
          <>
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-[var(--foreground-muted)]">
              <span className="inline-flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" />
                {doneTasks}/{totalTasks} tasks
              </span>
              <span>
                {Math.round((doneTasks / totalTasks) * 100)}%
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full bg-[var(--background)] overflow-hidden">
              <div
                className="h-full bg-[var(--foreground)] rounded-full transition-[width] duration-300"
                style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
              />
            </div>
          </>
        )}

        {nextTask && (
          <div className="mt-3 -mx-3.5 -mb-3 px-3.5 py-2 bg-[var(--background)] border-t border-[var(--border)] flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-medium truncate">
                {nextTask.title}
              </div>
              <div className="text-[10.5px] text-[var(--foreground-subtle)]">
                {formatDateRelative(nextTask.due_at)}
              </div>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
}
