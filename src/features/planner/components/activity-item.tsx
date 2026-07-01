"use client";

import { useRef } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ACTIVITY_COLORS, getActivityColorClasses } from "../lib/colors";
import type { Activity, ActivityColor } from "../types";

interface ActivityItemProps {
  activity: Activity;
  onChange: (updated: Activity) => void;
  onDelete: (id: string) => void;
  onAddNext?: () => void;
}

export function ActivityItem({ activity, onChange, onDelete, onAddNext }: ActivityItemProps) {
  const durationRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef<HTMLInputElement>(null);

  const setColor = (color: ActivityColor | undefined) => {
    onChange({ ...activity, color });
  };

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border bg-card p-3 shadow-sm",
        activity.color ? getActivityColorClasses(activity.color).border : "border-border"
      )}
      data-activity-id={activity.id}
    >
      <div
        className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing"
        data-drag-handle
        aria-label="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </div>

      <div className="grid flex-1 gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr,auto,auto]">
          <div className="space-y-1.5">
            <Label htmlFor={`activity-name-${activity.id}`} className="text-xs">
              Activity
            </Label>
            <Input
              id={`activity-name-${activity.id}`}
              value={activity.name}
              onChange={(e) => onChange({ ...activity, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  durationRef.current?.focus();
                }
              }}
              placeholder="e.g. Shower"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`activity-duration-${activity.id}`} className="text-xs">
              Duration (min)
            </Label>
            <Input
              id={`activity-duration-${activity.id}`}
              ref={durationRef}
              type="number"
              min={0}
              value={activity.durationMinutes}
              onChange={(e) =>
                onChange({ ...activity, durationMinutes: parseInt(e.target.value, 10) || 0 })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  bufferRef.current?.focus();
                }
              }}
              className="w-28"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`activity-buffer-${activity.id}`}
              className="text-xs"
              title="Time between this activity and the next one"
            >
              Buffer (min)
            </Label>
            <Input
              id={`activity-buffer-${activity.id}`}
              ref={bufferRef}
              type="number"
              min={0}
              value={activity.bufferMinutes}
              onChange={(e) =>
                onChange({ ...activity, bufferMinutes: parseInt(e.target.value, 10) || 0 })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddNext?.();
                }
              }}
              className="w-28"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Color:</span>
          <button
            type="button"
            onClick={() => setColor(undefined)}
            className={cn(
              "h-5 w-5 rounded-full border border-border bg-muted transition-transform hover:scale-110",
              !activity.color && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
            )}
            aria-label="No color"
          />
          {ACTIVITY_COLORS.map((color) => {
            const classes = getActivityColorClasses(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => setColor(color)}
                className={cn(
                  "h-5 w-5 rounded-full transition-transform hover:scale-110",
                  classes.bg,
                  activity.color === color && "ring-2 ring-foreground ring-offset-1 ring-offset-background"
                )}
                aria-label={`Set color ${color}`}
              />
            );
          })}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(activity.id)}
        aria-label="Delete activity"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
