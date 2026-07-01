"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Link2, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { calculateSchedule } from "../scheduler";
import { encodeRoutines } from "../lib/share";
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

function buildShareUrl(routines: Routine[]): string {
  if (typeof window === "undefined") return "";
  const encoded = encodeRoutines(routines);
  return `${window.location.origin}/?state=${encoded}`;
}

export function RoutineView({ routine }: RoutineViewProps) {
  const router = useRouter();
  const schedule = calculateSchedule(routine);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = useMemo(() => buildShareUrl([routine]), [routine]);
  const urlTooLong = shareUrl.length > 4096;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildScheduleText(routine));
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // Ignore copy failures.
    }
  };

  const handleCopyLink = async () => {
    if (urlTooLong) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyText}>
            {copiedText ? <Check className="mr-1 size-4" /> : <Copy className="mr-1 size-4" />}
            {copiedText ? "Copied text" : "Copy text"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            disabled={urlTooLong}
            title={urlTooLong ? "Link is too long to share reliably" : "Copy share link"}
          >
            {copiedLink ? <Check className="mr-1 size-4" /> : <Link2 className="mr-1 size-4" />}
            {copiedLink ? "Copied link" : "Copy link"}
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

      {urlTooLong && (
        <p className="mb-4 text-xs text-destructive">
          This routine is too large to share as a link. Try copying the text instead.
        </p>
      )}

      <NowIndicator schedule={schedule} />
      <Timeline schedule={schedule} />
    </div>
  );
}
