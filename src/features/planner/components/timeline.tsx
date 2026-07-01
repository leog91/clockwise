"use client";

import { Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getActivityColorClasses } from "../lib/colors";
import { formatDuration, formatTime } from "../lib/time";
import type { Schedule } from "../types";

interface TimelineProps {
  schedule: Schedule;
}

export function Timeline({ schedule }: TimelineProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">Calculated schedule</h3>

      <div className="relative">
        <div className="absolute bottom-2 top-2 left-[15px] w-px bg-border" />

        <div className="space-y-3">
          {schedule.items.map((item) => {
            const color = getActivityColorClasses(item.color);
            return (
              <div key={item.id} className="relative flex items-start gap-3">
                <div className="relative z-10 flex w-8 shrink-0 justify-center pt-2">
                  <div className={cn("h-2 w-2 rounded-full", color.bg)} />
                </div>
                <div
                  className={cn(
                    "flex flex-1 flex-col rounded-lg border-l-4 bg-muted/50 px-3 py-2",
                    color.border
                  )}
                >
                  <p className="font-medium">
                    Start {item.name} at {formatTime(item.startMinutes)} · Finish at{" "}
                    {formatTime(item.endMinutes)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(item.durationMinutes)}
                    {item.bufferMinutes > 0 && ` + ${formatDuration(item.bufferMinutes)} buffer`}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="relative flex items-start gap-3">
            <div className="relative z-10 flex w-8 shrink-0 justify-center pt-1">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground">
                <Flag className="size-2.5 text-background" />
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-lg bg-primary px-3 py-2 text-primary-foreground">
              <p className="font-medium">{schedule.target.name}</p>
              <p className="text-sm font-medium">{formatTime(schedule.target.timeMinutes)}</p>
            </div>
          </div>
        </div>
      </div>

      {schedule.totalDurationMinutes > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Total window: {formatDuration(schedule.totalDurationMinutes)}
        </p>
      )}
    </div>
  );
}
