import { ACTIVITY_COLORS } from "./colors";
import type { Activity, ActivityColor, Routine } from "../types";

const SOURCES = ["created", "shared"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isOptionalActivityColor(value: unknown): value is ActivityColor | undefined {
  return value === undefined || (typeof value === "string" && ACTIVITY_COLORS.includes(value as ActivityColor));
}

function isOptionalSource(value: unknown): value is Routine["source"] {
  return value === undefined || (typeof value === "string" && SOURCES.includes(value as NonNullable<Routine["source"]>));
}

function isActivity(value: unknown): value is Activity {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isFiniteNumber(value.durationMinutes) &&
    isFiniteNumber(value.bufferMinutes) &&
    isOptionalActivityColor(value.color)
  );
}

export function isRoutine(value: unknown): value is Routine {
  if (!isRecord(value) || !isRecord(value.target)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.target.name === "string" &&
    isFiniteNumber(value.target.timeMinutes) &&
    Array.isArray(value.activities) &&
    value.activities.every(isActivity) &&
    isOptionalString(value.createdAt) &&
    isOptionalString(value.updatedAt) &&
    isOptionalSource(value.source) &&
    (value.flags === undefined ||
      (Array.isArray(value.flags) && value.flags.every((flag) => typeof flag === "string"))) &&
    isOptionalString(value.deletedAt)
  );
}

export function isRoutineArray(value: unknown): value is Routine[] {
  return Array.isArray(value) && value.every(isRoutine);
}
