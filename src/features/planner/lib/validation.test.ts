import { describe, expect, it } from "vitest";
import { isRoutine, isRoutineArray } from "./validation";
import type { Routine } from "../types";

const routine: Routine = {
  id: "routine-1",
  name: "Morning",
  target: { name: "Arrive", timeMinutes: 540 },
  activities: [
    {
      id: "activity-1",
      name: "Commute",
      durationMinutes: 30,
      bufferMinutes: 5,
      color: "blue",
    },
  ],
  createdAt: "2026-07-09T00:00:00.000Z",
  updatedAt: "2026-07-09T00:00:00.000Z",
  source: "created",
};

describe("routine validation", () => {
  it("accepts a valid routine", () => {
    expect(isRoutine(routine)).toBe(true);
    expect(isRoutineArray([routine])).toBe(true);
  });

  it("rejects routines with malformed activities", () => {
    expect(
      isRoutine({
        ...routine,
        activities: [{ id: "activity-1", name: "Commute" }],
      })
    ).toBe(false);
  });

  it("rejects invalid optional metadata", () => {
    expect(isRoutine({ ...routine, source: "external" })).toBe(false);
    expect(isRoutine({ ...routine, flags: ["duplicate-name", 42] })).toBe(false);
  });

  it("rejects non-finite time and duration values", () => {
    expect(
      isRoutine({
        ...routine,
        target: { name: "Arrive", timeMinutes: Number.NaN },
      })
    ).toBe(false);
    expect(
      isRoutine({
        ...routine,
        activities: [{ ...routine.activities[0], durationMinutes: Infinity }],
      })
    ).toBe(false);
  });
});
