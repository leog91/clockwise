"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import type { Schedule } from "../types";
import { formatDuration, formatTime } from "../lib/time";

function getNow() {
  const date = new Date();
  return {
    minutes: date.getHours() * 60 + date.getMinutes(),
    label: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

interface NowIndicatorProps {
  schedule: Schedule;
}

export function NowIndicator({ schedule }: NowIndicatorProps) {
  const [now, setNow] = useState(getNow);

  useEffect(() => {
    const interval = setInterval(() => setNow(getNow()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const status = useMemo(() => {
    const target = schedule.target.timeMinutes;

    if (schedule.items.length === 0) {
      return { label: `Target is at ${formatTime(target)}`, sublabel: null };
    }

    const firstStart = schedule.firstStartAbsoluteMinutes;

    if (now.minutes < firstStart) {
      return {
        label: `Starts in ${formatDuration(firstStart - now.minutes)}`,
        sublabel: `First activity begins at ${formatTime(firstStart)}`,
      };
    }

    if (now.minutes >= target) {
      return {
        label: "Finished",
        sublabel: `Target was at ${formatTime(target)}`,
      };
    }

    const current = schedule.items.find(
      (item) => now.minutes >= item.startAbsoluteMinutes && now.minutes < item.endAbsoluteMinutes
    );

    if (current) {
      return {
        label: `Current: ${current.name}`,
        sublabel: `Until ${formatTime(current.endMinutes)}`,
      };
    }

    const next = schedule.items.find((item) => now.minutes < item.startAbsoluteMinutes);
    if (next) {
      return {
        label: `Next: ${next.name}`,
        sublabel: `Starts at ${formatTime(next.startMinutes)}`,
      };
    }

    return { label: `Target is at ${formatTime(target)}`, sublabel: null };
  }, [now, schedule]);

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Clock className="size-4" />
        </div>
        <div>
          <p className="font-medium">{status.label}</p>
          {status.sublabel && (
            <p className="text-xs text-muted-foreground">{status.sublabel}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Now</p>
        <p className="font-medium tabular-nums">{now.label}</p>
      </div>
    </div>
  );
}
