import { format, formatDistanceToNowStrict, isSameDay, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatPrice(cents: number | null | undefined): string {
  if (cents == null) return "—";
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(2)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(0)}K`;
  return `$${dollars.toLocaleString()}`;
}

export function formatSqft(sqft: number | null | undefined): string {
  if (sqft == null) return "—";
  return `${sqft.toLocaleString()} sqft`;
}

export function formatBedsBaths(beds: number | null, baths: number | null): string {
  const parts: string[] = [];
  if (beds != null) parts.push(`${beds} bd`);
  if (baths != null) parts.push(`${baths} ba`);
  return parts.join(" · ") || "—";
}

export function formatDateRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isToday(d)) return `Today · ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow · ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday · ${format(d, "h:mm a")}`;
  return format(d, "EEE MMM d · h:mm a");
}

export function formatTimeOnly(iso: string | null | undefined): string {
  if (!iso) return "";
  return format(new Date(iso), "h:mm a");
}

export function formatDateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(new Date(iso), "MMM d, yyyy");
}

export function formatDayKey(iso: string): string {
  return format(new Date(iso), "yyyy-MM-dd");
}

export function timeAgo(iso: string): string {
  return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
}

export { isSameDay };
