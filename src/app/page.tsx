import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { SetupScreen } from "@/components/SetupScreen";
import { BoardClient } from "@/components/BoardClient";
import { PageHeader } from "@/components/PageHeader";
import { Listing, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!supabaseConfigured()) return <SetupScreen />;

  const supabase = await createClient();
  const [{ data: listings }, { data: tasks }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .order("updated_at", { ascending: false }),
    supabase.from("tasks").select("*"),
  ]);

  const ls = (listings ?? []) as Listing[];
  const ts = (tasks ?? []) as Task[];

  const activeListings = ls.filter((l) => l.stage !== "closed").length;
  const dueThisWeek = ts.filter((t) => {
    if (!t.due_at || t.status === "done") return false;
    const d = new Date(t.due_at);
    const now = new Date();
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    return d >= now && d <= in7;
  }).length;

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Listings board"
        title="Where every listing actually is"
        subtitle="Drag a listing to move it through the pipeline. Everyone on the team sees the change instantly."
        right={
          <div className="hidden sm:flex items-center gap-4 text-[12.5px]">
            <Stat label="Active" value={activeListings} />
            <Stat label="Due this week" value={dueThisWeek} />
          </div>
        }
      />
      <div className="pt-5">
        <BoardClient initialListings={ls} initialTasks={ts} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <div className="text-[18px] font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="text-[10.5px] uppercase tracking-wider text-[var(--foreground-subtle)]">
        {label}
      </div>
    </div>
  );
}
