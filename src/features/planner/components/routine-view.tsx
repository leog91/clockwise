"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { calculateSchedule } from "../scheduler";
import { formatDuration, formatTime } from "../lib/time";
import { Timeline } from "./timeline";
import { NowIndicator } from "./now-indicator";
import type { Routine } from "../types";

interface RoutineViewProps {
  routine: Routine;
}

function buildScheduleText(routine: Routine): string {
  const schedule = calculateSchedule(routine);
  const lines: string[] = [];

  lines.push(routine.name);
  if (schedule.items.length > 0) {
    lines.push(`Start by ${formatTime(schedule.firstStartAbsoluteMinutes)}`);
  }
  lines.push(`${routine.target.name} at ${formatTime(routine.target.timeMinutes)}`);
  lines.push(`Total window: ${formatDuration(schedule.totalDurationMinutes)}`);
  lines.push("");

  schedule.items.forEach((item) => {
    lines.push(
      `Start ${item.name} at ${formatTime(item.startMinutes)} · Finish at ${formatTime(
        item.endMinutes
      )} · ${formatDuration(item.durationMinutes)}`
    );
  });

  return lines.join("\n");
}

export function RoutineView({ routine }: RoutineViewProps) {
  const router = useRouter();
  const schedule = calculateSchedule(routine);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildScheduleText(routine));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore copy failures.
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-1 size-4" />
        Back
      </Button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{routine.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {routine.target.name} at {formatTime(routine.target.timeMinutes)}
          </p>
          <p className="text-sm text-muted-foreground">
            {routine.activities.length} activities
            {schedule.totalDurationMinutes > 0 && (
              <>
                {" "}
                · {formatDuration(schedule.totalDurationMinutes)} window
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
            {copied ? "Copied" : "Copy schedule"}
          </Button>
          <Link
            href={`/routine/${routine.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="mr-1 size-4" />
            Edit
          </Link>
        </div>
      </div>

      <NowIndicator schedule={schedule} />
      <Timeline schedule={schedule} />
    </div>
  );
}
