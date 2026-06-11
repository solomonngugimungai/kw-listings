"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import {
  Listing,
  ListingStage,
  STAGE_LABELS,
  STAGE_ORDER,
  Task,
} from "@/lib/types";
import { ListingCard } from "./ListingCard";
import { StageColumn } from "./StageColumn";

interface Props {
  initialListings: Listing[];
  initialTasks: Task[];
}

export function BoardClient({ initialListings, initialTasks }: Props) {
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const supabase = useMemo(() => createClient(), []);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Realtime: listen for any change to listings and merge into local state
  useEffect(() => {
    const channel = supabase
      .channel("board-listings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setListings((prev) => {
              if (prev.find((l) => l.id === (payload.new as Listing).id))
                return prev;
              return [payload.new as Listing, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setListings((prev) =>
              prev.map((l) =>
                l.id === (payload.new as Listing).id
                  ? (payload.new as Listing)
                  : l
              )
            );
          } else if (payload.eventType === "DELETE") {
            setListings((prev) =>
              prev.filter((l) => l.id !== (payload.old as Listing).id)
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Realtime for tasks (updates card progress bar live)
  useEffect(() => {
    const channel = supabase
      .channel("board-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => [...prev, payload.new as Task]);
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === (payload.new as Task).id ? (payload.new as Task) : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) =>
              prev.filter((t) => t.id !== (payload.old as Task).id)
            );
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const newStage = over.id as ListingStage;
    const listing = listings.find((l) => l.id === active.id);
    if (!listing || listing.stage === newStage) return;

    // Optimistic update
    setListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, stage: newStage } : l))
    );

    const { error } = await supabase
      .from("listings")
      .update({ stage: newStage })
      .eq("id", listing.id);

    if (error) {
      // Roll back
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, stage: listing.stage } : l
        )
      );
      toast.error(`Couldn't move listing: ${error.message}`);
    } else {
      toast.success(
        `Moved ${listing.nickname ?? listing.address} → ${STAGE_LABELS[newStage]}`
      );
    }
  }

  const tasksByListing = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) {
      const arr = map.get(t.listing_id) ?? [];
      arr.push(t);
      map.set(t.listing_id, arr);
    }
    return map;
  }, [tasks]);

  const byStage = useMemo(() => {
    const map = new Map<ListingStage, Listing[]>();
    for (const stage of STAGE_ORDER) map.set(stage, []);
    for (const l of listings) map.get(l.stage)?.push(l);
    return map;
  }, [listings]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto no-scrollbar pb-6">
        <div className="flex gap-4 px-6 min-w-max">
          {STAGE_ORDER.map((stage) => {
            const items = byStage.get(stage) ?? [];
            return (
              <StageColumn key={stage} stage={stage} count={items.length}>
                {items.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    tasks={tasksByListing.get(l.id) ?? []}
                  />
                ))}
              </StageColumn>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
