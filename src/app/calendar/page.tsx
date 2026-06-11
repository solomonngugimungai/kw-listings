import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { SetupScreen } from "@/components/SetupScreen";
import { PageHeader } from "@/components/PageHeader";
import { CalendarGrid } from "@/components/CalendarGrid";
import { Listing, Task } from "@/lib/types";
import { Copy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  if (!supabaseConfigured()) return <SetupScreen />;
  const supabase = await createClient();
  const [{ data: tasks }, { data: listings }] = await Promise.all([
    supabase.from("tasks").select("*").not("due_at", "is", null),
    supabase.from("listings").select("id,nickname,address,stage,city"),
  ]);

  const ls = (listings ?? []) as Pick<Listing, "id" | "nickname" | "address" | "stage" | "city">[];
  const ts = (tasks ?? []) as Task[];

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Calendar"
        title="Every listing task, one calendar"
        subtitle="What got blocked on your calendar lives here too — and you can subscribe to it from Google Calendar."
        right={
          <a
            href="/api/ical/all"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--background)]"
          >
            <Copy className="h-3.5 w-3.5" />
            iCal feed
          </a>
        }
      />
      <div className="p-6">
        <CalendarGrid tasks={ts} listings={ls} />
      </div>
    </div>
  );
}
