/**
 * Time is stored as the number of minutes since midnight.
 * 0 = 00:00, 540 = 09:00, 1439 = 23:59
 */
export type TimeOfDay = number;

export type ActivityColor =
  | "slate"
  | "red"
  | "orange"
  | "amber"
  | "green"
  | "emerald"
  | "teal"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "rose";

export interface Activity {
  id: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  color?: ActivityColor;
}

export interface TargetEvent {
  name: string;
  timeMinutes: TimeOfDay;
}

export interface Routine {
  id: string;
  name: string;
  target: TargetEvent;
  activities: Activity[];
}

export interface ScheduledActivity extends Activity {
  /** Start time normalized to a 24-hour clock value (0-1439). */
  startMinutes: TimeOfDay;
  /** Absolute minutes from the plan's origin, may be negative when crossing midnight. */
  startAbsoluteMinutes: number;
  /** End time normalized to a 24-hour clock value (0-1439). */
  endMinutes: TimeOfDay;
  /** Absolute end minutes from the plan's origin. */
  endAbsoluteMinutes: number;
}

export interface Schedule {
  routineId: string;
  target: TargetEvent;
  items: ScheduledActivity[];
  /** Absolute minute value of the first activity start (may be negative). */
  firstStartAbsoluteMinutes: number;
  /** Total span from first start to target arrival, in minutes. */
  totalDurationMinutes: number;
}
