import { clsx } from "clsx";
import { ListingStage, STAGE_LABELS, STAGE_THEME } from "@/lib/types";

export function StageBadge({
  stage,
  size = "md",
}: {
  stage: ListingStage;
  size?: "sm" | "md";
}) {
  const t = STAGE_THEME[stage];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 font-medium rounded-full ring-1",
        t.fg,
        t.bg,
        t.ring,
        size === "sm" ? "text-[10.5px] px-1.5 py-0.5" : "text-[11.5px] px-2 py-0.5"
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", t.dot)} />
      {STAGE_LABELS[stage]}
    </span>
  );
}
