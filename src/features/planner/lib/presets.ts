import type { Activity, ActivityColor } from "../types";

export interface ActivityPreset {
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  color?: ActivityColor;
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  { name: "Alarm window", durationMinutes: 30, bufferMinutes: 0, color: "amber" },
  { name: "Shower", durationMinutes: 15, bufferMinutes: 0, color: "blue" },
  { name: "Breakfast", durationMinutes: 20, bufferMinutes: 0, color: "orange" },
  { name: "Coffee", durationMinutes: 10, bufferMinutes: 0, color: "amber" },
  { name: "Gym", durationMinutes: 60, bufferMinutes: 10, color: "red" },
  { name: "Commute", durationMinutes: 30, bufferMinutes: 5, color: "indigo" },
  { name: "Walk", durationMinutes: 20, bufferMinutes: 0, color: "green" },
  { name: "Study", durationMinutes: 45, bufferMinutes: 0, color: "purple" },
  { name: "Meeting", durationMinutes: 30, bufferMinutes: 0, color: "pink" },
];

export function createActivityFromPreset(
  preset: ActivityPreset,
  generateId: () => string
): Activity {
  return {
    id: generateId(),
    name: preset.name,
    durationMinutes: preset.durationMinutes,
    bufferMinutes: preset.bufferMinutes,
    color: preset.color,
  };
}
