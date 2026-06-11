import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bed, Bath, Ruler, MapPin, User, CalendarRange } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { SetupScreen } from "@/components/SetupScreen";
import { StageBadge } from "@/components/StageBadge";
import { SubscribeButton } from "@/components/SubscribeButton";
import { TaskTimeline } from "@/components/TaskTimeline";
import { CommentThread } from "@/components/CommentThread";
import { LiveIndicator } from "@/components/LiveIndicator";
import { Comment, Listing, Task } from "@/lib/types";
import { formatBedsBaths, formatDateOnly, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: Params) {
  if (!supabaseConfigured()) return <SetupScreen />;
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: listing }, { data: tasks }, { data: comments }] =
    await Promise.all([
      supabase.from("listings").select("*").eq("id", id).maybeSingle(),
      supabase.from("tasks").select("*").eq("listing_id", id),
      supabase
        .from("comments")
        .select("*, author:profiles(id,full_name,email,role,avatar_color)")
        .eq("listing_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (!listing) notFound();

  const l = listing as Listing;
  const ts = (tasks ?? []) as Task[];
  const cs = (comments ?? []) as Comment[];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative">
        <div className="h-64 sm:h-80 bg-[var(--background)] relative overflow-hidden">
          {l.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={l.cover_image_url}
              alt={l.address}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 dotted-bg" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        </div>
        <div className="absolute top-4 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12.5px] font-medium bg-white/90 backdrop-blur-sm hover:bg-white text-[var(--foreground)] border border-white/40 shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Board
          </Link>
        </div>
        <div className="absolute top-4 right-6 flex items-center gap-3">
          <LiveIndicator />
          <SubscribeButton listingId={l.id} />
        </div>
        <div className="absolute left-6 right-6 bottom-5 text-white">
          <div className="flex items-center gap-2 mb-1.5">
            <StageBadge stage={l.stage} />
            <span className="text-[12px] text-white/80">
              Updated {formatDateOnly(l.updated_at)}
            </span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-tight leading-none drop-shadow-sm">
            {l.nickname ?? l.address}
          </h1>
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] text-white/85">
            <MapPin className="h-3.5 w-3.5" />
            {l.address} · {l.city}, {l.state} {l.zip}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 px-6 py-7 max-w-[1400px]">
        {/* MAIN */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatTile icon={null} label="Price" value={formatPrice(l.price_cents)} />
            <StatTile
              icon={Bed}
              label="Beds / Baths"
              value={formatBedsBaths(l.beds, l.baths)}
            />
            <StatTile
              icon={Ruler}
              label="Square feet"
              value={l.sqft ? l.sqft.toLocaleString() : "—"}
            />
            <StatTile
              icon={CalendarRange}
              label="Target live"
              value={formatDateOnly(l.target_live_date)}
            />
          </div>

          {l.seller_name && (
            <div className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--foreground-muted)]">
              <User className="h-3.5 w-3.5" />
              Seller: <span className="text-[var(--foreground)] font-medium">{l.seller_name}</span>
            </div>
          )}

          {/* Timeline */}
          <section>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight">
                  Listing timeline
                </h2>
                <p className="text-[12.5px] text-[var(--foreground-muted)] mt-0.5">
                  Every dated task that gets a calendar block today.
                </p>
              </div>
            </div>
            <TaskTimeline listingId={l.id} initial={ts} />
          </section>

          {/* Comments */}
          <section>
            <h2 className="text-[18px] font-semibold tracking-tight mb-3">
              Discussion
            </h2>
            <CommentThread listingId={l.id} initial={cs} />
          </section>
        </div>

        {/* RIGHT RAIL */}
        <aside className="col-span-12 lg:col-span-4 space-y-5">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
              Subscribe to this listing
            </h3>
            <p className="text-[13px] leading-relaxed text-[var(--foreground-muted)]">
              Get notified the moment Marie moves a stage, completes a task, or
              comments here. No more checking Trello and the sheet and the
              calendar.
            </p>
            <div className="mt-4">
              <SubscribeButton listingId={l.id} />
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-3">
              Calendar feed
            </h3>
            <p className="text-[13px] leading-relaxed text-[var(--foreground-muted)]">
              Subscribe in Google Calendar to see every task as an event. No
              more individual calendar blocks.
            </p>
            <Link
              href={`/api/ical/all`}
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--accent)] hover:underline"
            >
              Get iCal URL →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bed | null;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider text-[var(--foreground-subtle)] font-semibold">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold tracking-tight tabular-nums">
        {value}
      </div>
    </div>
  );
}
