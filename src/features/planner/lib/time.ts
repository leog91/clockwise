import type { TimeOfDay } from "../types";

const MINUTES_PER_DAY = 1440;

/**
 * Formats a minute value as a 24-hour "HH:mm" string.
 * Values outside the 0-1439 range are normalized to a time of day,
 * which is useful when a schedule crosses midnight.
 */
export function formatTime(minutes: number): string {
  const normalized = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Converts a 24-hour "HH:mm" string into minutes since midnight.
 * Returns 0 for malformed input.
 */
export function parseTime(value: string): TimeOfDay {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 0;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0;

  return hours * 60 + minutes;
}

/**
 * Formats a duration in minutes as a human-readable string.
 * Examples: 30 -> "30m", 90 -> "1h 30m", 60 -> "1h"
 */
export function formatDuration(totalMinutes: number): string {
  const minutes = Math.abs(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining}m`;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}
