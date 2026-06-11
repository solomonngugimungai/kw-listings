export type ListingStage =
  | "pre_list"
  | "photos"
  | "staging"
  | "mls"
  | "marketing"
  | "live"
  | "pending"
  | "closed";

export type TaskStatus = "todo" | "doing" | "done" | "blocked";

export type ActivityKind =
  | "listing_created"
  | "stage_changed"
  | "task_created"
  | "task_completed"
  | "task_due_changed"
  | "comment_added"
  | "subscribed"
  | "unsubscribed";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_color: string;
}

export interface Listing {
  id: string;
  address: string;
  nickname: string | null;
  city: string;
  state: string;
  zip: string | null;
  price_cents: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  stage: ListingStage;
  list_date: string | null;
  target_live_date: string | null;
  seller_name: string | null;
  cover_image_url: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  listing_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_at: string | null;
  duration_minutes: number | null;
  assignee_id: string | null;
  category: string | null;
  created_by: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  listing_id: string;
  task_id: string | null;
  author_id: string | null;
  body: string;
  created_at: string;
  author?: Profile | null;
}

export interface Subscription {
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface Activity {
  id: number;
  listing_id: string | null;
  actor_id: string | null;
  kind: ActivityKind;
  payload: Record<string, unknown>;
  created_at: string;
  listing?: Pick<Listing, "id" | "address" | "nickname"> | null;
  actor?: Profile | null;
}

export const STAGE_ORDER: ListingStage[] = [
  "pre_list",
  "photos",
  "staging",
  "mls",
  "marketing",
  "live",
  "pending",
  "closed",
];

export const STAGE_LABELS: Record<ListingStage, string> = {
  pre_list: "Pre-listing",
  photos: "Photos",
  staging: "Staging",
  mls: "MLS",
  marketing: "Marketing",
  live: "Live",
  pending: "Pending",
  closed: "Closed",
};

// Visual identity per stage — used by chips, kanban headers, calendar dots.
// Each entry: [foreground text, background, ring/border]
export const STAGE_THEME: Record<
  ListingStage,
  { fg: string; bg: string; ring: string; dot: string }
> = {
  pre_list:  { fg: "text-slate-700",   bg: "bg-slate-100",   ring: "ring-slate-200",   dot: "bg-slate-500" },
  photos:    { fg: "text-amber-800",   bg: "bg-amber-100",   ring: "ring-amber-200",   dot: "bg-amber-500" },
  staging:   { fg: "text-violet-800",  bg: "bg-violet-100",  ring: "ring-violet-200",  dot: "bg-violet-500" },
  mls:       { fg: "text-sky-800",     bg: "bg-sky-100",     ring: "ring-sky-200",     dot: "bg-sky-500" },
  marketing: { fg: "text-rose-800",    bg: "bg-rose-100",    ring: "ring-rose-200",    dot: "bg-rose-500" },
  live:      { fg: "text-emerald-800", bg: "bg-emerald-100", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  pending:   { fg: "text-orange-800",  bg: "bg-orange-100",  ring: "ring-orange-200",  dot: "bg-orange-500" },
  closed:    { fg: "text-zinc-700",    bg: "bg-zinc-100",    ring: "ring-zinc-200",    dot: "bg-zinc-500" },
};
