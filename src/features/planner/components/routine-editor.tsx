"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { generateId } from "@/lib/id";
import { useRoutines } from "../hooks/use-routines";
import { calculateSchedule } from "../scheduler";
import { createActivityFromPreset, ACTIVITY_PRESETS } from "../lib/presets";
import { formatTime, parseTime } from "../lib/time";
import { ActivityList } from "./activity-list";
import { Timeline } from "./timeline";
import type { Activity, Routine } from "../types";

interface RoutineEditorProps {
  routine?: Routine;
}

function createEmptyActivity(): Activity {
  return {
    id: generateId(),
    name: "",
    durationMinutes: 0,
    bufferMinutes: 0,
  };
}

function createEmptyRoutine(): Routine {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: "",
    target: { name: "Arrive", timeMinutes: 540 },
    activities: [],
    createdAt: now,
    updatedAt: now,
    source: "created",
  };
}

export function RoutineEditor({ routine: existingRoutine }: RoutineEditorProps) {
  const router = useRouter();
  const { addRoutine, updateRoutine, deleteRoutine } = useRoutines();
  const isEditing = Boolean(existingRoutine);

  const [routine, setRoutine] = useState<Routine>(existingRoutine ?? createEmptyRoutine());

  const schedule = useMemo(() => calculateSchedule(routine), [routine]);

  const updateField = <K extends keyof Routine>(field: K, value: Routine[K]) => {
    setRoutine((prev) => ({ ...prev, [field]: value }));
  };

  const addActivity = (activity?: Activity) => {
    setRoutine((prev) => ({
      ...prev,
      activities: [...prev.activities, activity ?? createEmptyActivity()],
    }));
  };

  const addPreset = (preset: (typeof ACTIVITY_PRESETS)[number]) => {
    addActivity(createActivityFromPreset(preset, generateId));
  };

  const handleSave = useCallback(() => {
    if (!routine.name.trim()) return;

    if (isEditing) {
      updateRoutine(routine);
    } else {
      addRoutine(routine);
    }

    router.push(`/routine/${routine.id}`);
  }, [isEditing, routine, addRoutine, updateRoutine, router]);

  const handleCancel = () => {
    router.push(isEditing ? `/routine/${routine.id}` : "/");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={handleCancel}>
        <ArrowLeft className="mr-1 size-4" />
        Back
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isEditing ? "Edit routine" : "Create routine"}
        </h1>
        <p className="text-muted-foreground">
          Add activities in the order you do them. We will work backwards from your arrival time.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Routine details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="routine-name">Routine name</Label>
                <Input
                  id="routine-name"
                  value={routine.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. Work morning"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="target-name">Target event</Label>
                  <Input
                    id="target-name"
                    value={routine.target.name}
                    onChange={(e) =>
                      updateField("target", { ...routine.target, name: e.target.value })
                    }
                    placeholder="e.g. Arrive at work"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="target-time">Arrival time</Label>
                  <Input
                    id="target-time"
                    type="time"
                    value={formatTime(routine.target.timeMinutes)}
                    onChange={(e) =>
                      updateField("target", {
                        ...routine.target,
                        timeMinutes: parseTime(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">Activities</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Buffer is the gap before the next activity starts.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => addActivity()}>
                <Plus className="mr-1 size-4" />
                Add activity
              </Button>
            </CardHeader>
            <CardContent>
              {routine.activities.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No activities yet. Add the first thing you do.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {ACTIVITY_PRESETS.slice(0, 5).map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => addPreset(preset)}
                      >
                        <Plus className="mr-1 size-3" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {ACTIVITY_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="secondary"
                        size="sm"
                        onClick={() => addPreset(preset)}
                      >
                        <Plus className="mr-1 size-3" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  <ActivityList
                    activities={routine.activities}
                    onChange={(activities) => updateField("activities", activities)}
                    onAddActivity={() => addActivity()}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => addActivity()}
                  >
                    <Plus className="mr-1 size-4" />
                    Add activity
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-between gap-3">
            {isEditing ? (
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this routine?")) {
                    deleteRoutine(routine.id);
                    router.push("/");
                  }
                }}
              >
                <Trash2 className="mr-1 size-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!routine.name.trim()}>
                {isEditing ? "Save changes" : "Create routine"}
                <span className="ml-2 hidden text-[10px] opacity-60 sm:inline">
                  ⌘/Ctrl + Enter
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Timeline schedule={schedule} />
        </div>
      </div>
    </div>
  );
}
