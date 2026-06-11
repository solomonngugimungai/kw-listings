"use client";

import { useDroppable } from "@dnd-kit/core";
import { clsx } from "clsx";
import { ListingStage, STAGE_LABELS, STAGE_THEME } from "@/lib/types";

interface Props {
  stage: ListingStage;
  count: number;
  children: React.ReactNode;
}

export function StageColumn({ stage, count, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const t = STAGE_THEME[stage];

  return (
    <div className="flex flex-col w-[300px] shrink-0">
      <div className="flex items-center justify-between px-1 pb-2.5">
        <div className="inline-flex items-center gap-2">
          <span className={clsx("h-2 w-2 rounded-full", t.dot)} />
          <span className="text-[12px] font-semibold tracking-wide uppercase">
            {STAGE_LABELS[stage]}
          </span>
          <span className="text-[11px] text-[var(--foreground-subtle)] tabular-nums">
            {count}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          "flex-1 rounded-xl border border-dashed transition-colors p-2 space-y-2.5 min-h-[200px]",
          isOver
            ? "border-[var(--accent)] bg-[var(--accent-soft)]/40"
            : "border-[var(--border)] bg-[var(--surface)]/40"
        )}
      >
        {children}
        {count === 0 && !isOver && (
          <div className="h-32 grid place-items-center text-[11.5px] text-[var(--foreground-subtle)]">
            Drop listings here
          </div>
        )}
      </div>
    </div>
  );
}
