"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { clsx } from "clsx";

interface Props {
  listingId: string;
}

export function SubscribeButton({ listingId }: Props) {
  const [subscribed, setSubscribed] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      setSignedIn(true);
      const { data } = await supabase
        .from("subscriptions")
        .select("listing_id")
        .eq("listing_id", listingId)
        .eq("user_id", user.id)
        .maybeSingle();
      setSubscribed(!!data);
      setLoading(false);
    })();
  }, [listingId]);

  async function toggle() {
    if (!signedIn) {
      toast.error("Sign in to subscribe (Supabase Auth → add user)");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (subscribed) {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("listing_id", listingId)
        .eq("user_id", user.id);
      if (error) return toast.error(error.message);
      setSubscribed(false);
      toast.success("Unsubscribed");
    } else {
      const { error } = await supabase
        .from("subscriptions")
        .insert({ listing_id: listingId, user_id: user.id });
      if (error) return toast.error(error.message);
      setSubscribed(true);
      toast.success("Subscribed — you'll see updates here and in /activity");
    }
  }

  if (loading) {
    return (
      <div className="h-9 w-32 rounded-md bg-[var(--background)] animate-pulse" />
    );
  }

  return (
    <button
      onClick={toggle}
      className={clsx(
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[13px] font-medium border transition-colors",
        subscribed
          ? "bg-[var(--accent-soft)] border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent-soft)]/70"
          : "bg-[var(--surface)] border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--background)]"
      )}
    >
      {subscribed ? (
        <>
          <BellRing className="h-4 w-4" />
          Subscribed
        </>
      ) : signedIn ? (
        <>
          <Bell className="h-4 w-4" />
          Subscribe
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Sign in to subscribe
        </>
      )}
    </button>
  );
}
