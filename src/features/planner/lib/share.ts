import type { Routine } from "../types";

const SHARE_VERSION = 1;

interface SharePayload {
  v: number;
  routines: Routine[];
}

function isRoutine(value: unknown): value is Routine {
  if (typeof value !== "object" || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.target === "object" &&
    r.target !== null &&
    typeof (r.target as Record<string, unknown>).name === "string" &&
    typeof (r.target as Record<string, unknown>).timeMinutes === "number" &&
    Array.isArray(r.activities)
  );
}

function isSharePayload(value: unknown): value is SharePayload {
  if (typeof value !== "object" || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    p.v === SHARE_VERSION &&
    Array.isArray(p.routines) &&
    p.routines.every(isRoutine)
  );
}

/**
 * Encodes one or more routines into a URL-safe base64 string.
 */
export function encodeRoutines(routines: Routine[]): string {
  const payload: SharePayload = { v: SHARE_VERSION, routines };
  const json = JSON.stringify(payload);
  if (typeof window === "undefined") return "";
  const base64 = window.btoa(json);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodes a URL-safe base64 string back into an array of routines.
 * Returns null if the input is corrupt or invalid.
 */
export function decodeRoutines(input: string): Routine[] | null {
  if (typeof window === "undefined") return null;
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = window.atob(padded);
    const parsed = JSON.parse(json) as unknown;
    if (!isSharePayload(parsed)) return null;
    return parsed.routines;
  } catch {
    return null;
  }
}
