import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { createEvents, EventAttributes } from "ics";
import { Listing, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ token: string }>;
}

// /api/ical/all → every task across all listings
// /api/ical/<listing-id> → tasks for one listing
export async function GET(_req: Request, { params }: Params) {
  if (!supabaseConfigured()) {
    return new Response("Supabase not configured", { status: 500 });
  }
  const { token } = await params;
  const supabase = await createClient();

  const listingsRes = await supabase
    .from("listings")
    .select("id,nickname,address,city,stage");
  const listings = (listingsRes.data ?? []) as Pick<
    Listing,
    "id" | "nickname" | "address" | "city" | "stage"
  >[];
  const listingMap = new Map(listings.map((l) => [l.id, l]));

  let tasksQuery = supabase
    .from("tasks")
    .select("*")
    .not("due_at", "is", null);
  if (token !== "all") tasksQuery = tasksQuery.eq("listing_id", token);

  const { data: tasks } = await tasksQuery;
  const ts = (tasks ?? []) as Task[];

  const events: EventAttributes[] = ts.map((t) => {
    const due = new Date(t.due_at!);
    const duration = t.duration_minutes ?? 60;
    const listing = listingMap.get(t.listing_id);
    const listingLabel = listing?.nickname ?? listing?.address ?? "Listing";

    return {
      title: `${listingLabel}: ${t.title}`,
      description: `${t.description ?? ""}\n\nListing: ${listing?.address ?? ""}, ${listing?.city ?? ""}`,
      location: `${listing?.address ?? ""}, ${listing?.city ?? ""}`,
      start: [
        due.getFullYear(),
        due.getMonth() + 1,
        due.getDate(),
        due.getHours(),
        due.getMinutes(),
      ],
      duration: { minutes: duration },
      uid: `${t.id}@kw-listings`,
      categories: t.category ? [t.category] : undefined,
      status: t.status === "done" ? "CONFIRMED" : "TENTATIVE",
      productId: "kw-listings/ics",
      calName: token === "all" ? "KW Listings" : `KW: ${listingLabel}`,
    };
  });

  const { error, value } = createEvents(events);
  if (error || !value) {
    return new Response(`iCal generation failed: ${error?.message}`, {
      status: 500,
    });
  }

  return new Response(value, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="kw-listings-${token}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
