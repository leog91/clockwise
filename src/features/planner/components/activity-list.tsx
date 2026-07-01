"use client";

import { useState } from "react";
import { ActivityItem } from "./activity-item";
import type { Activity } from "../types";

interface ActivityListProps {
  activities: Activity[];
  onChange: (activities: Activity[]) => void;
  onAddActivity?: () => void;
}

export function ActivityList({ activities, onChange, onAddActivity }: ActivityListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    const target = e.target as HTMLElement;
    if (!target.closest("[data-drag-handle]")) {
      e.preventDefault();
      return;
    }

    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox.
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const moveActivity = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    const fromIndex = activities.findIndex((a) => a.id === draggedId);
    const toIndex = activities.findIndex((a) => a.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...activities];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onChange(next);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggingId;
    if (draggedId) moveActivity(draggedId, targetId);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  return (
    <div className="grid gap-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          draggable
          onDragStart={(e) => handleDragStart(e, activity.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, activity.id)}
          onDragEnd={handleDragEnd}
          className={
            draggingId === activity.id ? "opacity-40" : "opacity-100"
          }
        >
          <ActivityItem
            activity={activity}
            onChange={(updated) =>
              onChange(activities.map((a) => (a.id === updated.id ? updated : a)))
            }
            onDelete={(id) => onChange(activities.filter((a) => a.id !== id))}
            onAddNext={onAddActivity}
          />
        </div>
      ))}
    </div>
  );
}
