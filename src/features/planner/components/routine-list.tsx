"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  GripVertical,
  Route,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRoutines } from "../hooks/use-routines";
import { calculateSchedule } from "../scheduler";
import { getActivityColorClasses } from "../lib/colors";
import { formatDuration, formatTime } from "../lib/time";

export function RoutineList() {
  const { routines, duplicateRoutine, reorderRoutines } = useRoutines();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const moveRoutine = (draggedId: string, targetId: string) => {
    const fromIndex = routines.findIndex((r) => r.id === draggedId);
    const toIndex = routines.findIndex((r) => r.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    reorderRoutines(fromIndex, toIndex);
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) return;

    e.preventDefault();
    setDraggingId(id);
    setDropTargetId(null);

    const handleMove = (ev: PointerEvent) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      const card = el?.closest<HTMLElement>("[data-routine-id]");
      setDropTargetId(card?.dataset.routineId ?? null);
    };

    const handleUp = () => {
      setDropTargetId((currentDropId) => {
        if (id && currentDropId && id !== currentDropId) {
          moveRoutine(id, currentDropId);
        }
        return null;
      });
      setDraggingId(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Routines</h1>
          <p className="text-muted-foreground">
            Plans that work backwards from when you need to arrive.
          </p>
        </div>
        <Link href="/routine/new" className={buttonVariants()}>
          New routine
        </Link>
      </div>

      {routines.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Route className="size-6 text-muted-foreground" />
            </div>
            <h2 className="mb-1 text-lg font-medium">No routines yet</h2>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Create your first routine to find out when you need to start each activity.
            </p>
            <Link href="/routine/new" className={cn(buttonVariants(), "mt-6")}>
              Create routine
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {routines.map((routine, index) => {
            const schedule = calculateSchedule(routine);
            const total = Math.max(schedule.totalDurationMinutes, 1);
            const isDragging = draggingId === routine.id;
            const isDropTarget = dropTargetId === routine.id && !isDragging;
            const isExpanded = expandedId === routine.id;

            return (
              <div
                key={routine.id}
                data-routine-id={routine.id}
                onPointerDown={(e) => handlePointerDown(e, routine.id)}
                className={cn(
                  "rounded-xl border bg-card shadow-sm transition-all",
                  isDragging && "opacity-40",
                  isDropTarget && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <div
                    className="cursor-grab text-muted-foreground active:cursor-grabbing"
                    data-drag-handle
                    aria-label="Drag to reorder routine"
                    title="Drag to reorder"
                  >
                    <GripVertical className="size-4" />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpanded(routine.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <h2 className="truncate font-medium">{routine.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        Start {schedule.items.length > 0 ? `by ${formatTime(schedule.firstStartAbsoluteMinutes)}` : "—"}
                      </span>
                      <span>•</span>
                      <span>Finish by {formatTime(routine.target.timeMinutes)}</span>
                      <span>•</span>
                      <span>{routine.activities.length} activities</span>
                      {schedule.totalDurationMinutes > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(schedule.totalDurationMinutes)} window</span>
                        </>
                      )}
                    </div>

                    {routine.activities.length > 0 && schedule.totalDurationMinutes > 0 && (
                      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-muted">
                        {schedule.items.map((item) => {
                          const color = getActivityColorClasses(item.color);
                          return (
                            <div
                              key={item.id}
                              className={cn("h-full", color.bg)}
                              style={{ width: `${(item.durationMinutes / total) * 100}%` }}
                              title={`${item.name} (${formatDuration(item.durationMinutes)})`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </button>

                  <div className="flex shrink-0 flex-col items-center gap-0.5 sm:flex-row sm:gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => reorderRoutines(index, index - 1)}
                      aria-label="Move up"
                      title="Move up"
                    >
                      <ChevronUp className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={index === routines.length - 1}
                      onClick={() => reorderRoutines(index, index + 1)}
                      aria-label="Move down"
                      title="Move down"
                    >
                      <ChevronDown className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        duplicateRoutine(routine.id);
                      }}
                      aria-label="Duplicate routine"
                      title="Duplicate routine"
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Link
                      href={`/routine/${routine.id}`}
                      className="hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
                      aria-label="View schedule"
                      title="View schedule"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </CardContent>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <CardContent className="border-t border-border bg-muted/30 px-6 py-4">
                    {schedule.items.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No activities yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {schedule.items.map((item) => {
                          const color = getActivityColorClasses(item.color);
                          return (
                            <li key={item.id} className="flex items-center gap-2 text-sm">
                              <span className={cn("h-2 w-2 rounded-full", color.bg)} />
                              <span className="font-medium">{item.name}</span>
                              <span className="text-muted-foreground">
                                {formatTime(item.startMinutes)}–{formatTime(item.endMinutes)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({formatDuration(item.durationMinutes)})
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Link
                        href={`/routine/${routine.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        View full schedule
                        <ArrowRight className="ml-1 size-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
