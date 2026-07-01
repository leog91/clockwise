"use client";

import { redirect, useParams } from "next/navigation";
import { RoutineView } from "@/features/planner/components/routine-view";
import { useRoutines } from "@/features/planner/hooks/use-routines";

export default function RoutineDetailPage() {
  const params = useParams();
  const { isLoaded, getRoutine } = useRoutines();

  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const routine = getRoutine(id);

  if (isLoaded && !routine) {
    redirect("/");
  }

  if (!routine) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading routine…</p>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <RoutineView routine={routine} />
    </main>
  );
}
