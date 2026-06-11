"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LiveIndicator() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("presence-ping")
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--foreground-muted)]">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          connected ? "bg-emerald-500 live-pulse" : "bg-zinc-300"
        }`}
      />
      {connected ? "Live" : "Connecting…"}
    </div>
  );
}
