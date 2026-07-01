import type { Routine, Schedule, ScheduledActivity, TimeOfDay } from "./types";

const MINUTES_PER_DAY = 1440;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampMinutes(value: number): TimeOfDay {
  return clamp(value, 0, MINUTES_PER_DAY - 1);
}

/**
 * Normalizes a minute value into the 0-1439 range, correctly handling
 * negative values and values greater than a single day.
 */
export function normalizeMinutes(value: number): TimeOfDay {
  const wrapped = ((value % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return clampMinutes(wrapped);
}

function clampNonNegative(value: number): number {
  return Math.max(0, Math.round(value));
}

/**
 * Calculates the latest possible schedule for a routine working backwards
 * from the target arrival time.
 *
 * The algorithm is pure and deterministic:
 *   current = targetTime
 *   for each activity in reverse order:
 *     current -= activity.duration
 *     activity.startTime = current
 *     current -= activity.buffer
 */
export function calculateSchedule(routine: Routine): Schedule {
  const targetTime = clampMinutes(routine.target.timeMinutes);
  let current = targetTime;

  const scheduled: ScheduledActivity[] = [];

  for (let i = routine.activities.length - 1; i >= 0; i--) {
    const activity = routine.activities[i];
    const duration = clampNonNegative(activity.durationMinutes);
    const buffer = clampNonNegative(activity.bufferMinutes);

    current -= duration;

    const startAbsolute = current;
    const endAbsolute = current + duration;

    scheduled.unshift({
      ...activity,
      durationMinutes: duration,
      bufferMinutes: buffer,
      startMinutes: normalizeMinutes(startAbsolute),
      startAbsoluteMinutes: startAbsolute,
      endMinutes: normalizeMinutes(endAbsolute),
      endAbsoluteMinutes: endAbsolute,
    });

    current -= buffer;
  }

  const firstStartAbsoluteMinutes =
    scheduled.length > 0 ? scheduled[0].startAbsoluteMinutes : targetTime;

  return {
    routineId: routine.id,
    target: {
      ...routine.target,
      timeMinutes: targetTime,
    },
    items: scheduled,
    firstStartAbsoluteMinutes,
    totalDurationMinutes: targetTime - firstStartAbsoluteMinutes,
  };
}
