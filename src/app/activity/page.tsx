import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { SetupScreen } from "@/components/SetupScreen";
import { PageHeader } from "@/components/PageHeader";
import { ActivityFeed } from "@/components/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  if (!supabaseConfigured()) return <SetupScreen />;
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity")
    .select(
      "*, listing:listings(id,address,nickname), actor:profiles(id,full_name,email,role,avatar_color)"
    )
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Activity"
        title="What just happened"
        subtitle="Every move Marie or anyone else makes shows up here live. Subscribe to a listing to filter to just yours."
      />
      <div className="p-6 max-w-3xl">
        <ActivityFeed initial={(data ?? []) as Parameters<typeof ActivityFeed>[0]["initial"]} />
      </div>
    </div>
  );
}
