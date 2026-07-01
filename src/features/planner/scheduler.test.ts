import { describe, expect, it } from "vitest";
import { calculateSchedule } from "./scheduler";
import type { Routine } from "./types";

function makeRoutine(activities: Routine["activities"], targetMinutes = 900): Routine {
  return {
    id: "routine-1",
    name: "Test Routine",
    target: { name: "Arrive", timeMinutes: targetMinutes },
    activities,
  };
}

describe("calculateSchedule", () => {
  it("returns only the target for an empty routine", () => {
    const routine = makeRoutine([]);
    const schedule = calculateSchedule(routine);

    expect(schedule.items).toHaveLength(0);
    expect(schedule.totalDurationMinutes).toBe(0);
    expect(schedule.firstStartAbsoluteMinutes).toBe(900);
    expect(schedule.target.timeMinutes).toBe(900);
  });

  it("schedules a single activity", () => {
    const routine = makeRoutine([
      { id: "a1", name: "Commute", durationMinutes: 40, bufferMinutes: 0 },
    ]);
    const schedule = calculateSchedule(routine);

    expect(schedule.items).toHaveLength(1);
    expect(schedule.items[0].startMinutes).toBe(860); // 14:20
    expect(schedule.items[0].endMinutes).toBe(900); // 15:00
    expect(schedule.totalDurationMinutes).toBe(40);
  });

  it("schedules multiple activities working backwards", () => {
    const routine = makeRoutine([
      { id: "a3", name: "Alarm window", durationMinutes: 30, bufferMinutes: 0 },
      { id: "a2", name: "Shower", durationMinutes: 15, bufferMinutes: 0 },
      { id: "a1", name: "Commute", durationMinutes: 40, bufferMinutes: 0 },
    ]);
    const schedule = calculateSchedule(routine);

    expect(schedule.items.map((item) => ({ name: item.name, start: item.startMinutes, end: item.endMinutes })))
      .toEqual([
        { name: "Alarm window", start: 815, end: 845 }, // 13:35 - 14:05
        { name: "Shower", start: 845, end: 860 }, // 14:05 - 14:20
        { name: "Commute", start: 860, end: 900 }, // 14:20 - 15:00
      ]);

    expect(schedule.totalDurationMinutes).toBe(85);
  });

  it("applies buffers between activities", () => {
    const routine = makeRoutine([
      { id: "a1", name: "Commute", durationMinutes: 20, bufferMinutes: 0 },
      { id: "a2", name: "Get ready", durationMinutes: 20, bufferMinutes: 10 },
    ]);
    const schedule = calculateSchedule(routine);

    // Target 15:00
    // Commute ends at 15:00, starts at 14:40
    // Get ready ends at 14:40 - 10 buffer = 14:30, starts at 14:10
    expect(schedule.items[0].startMinutes).toBe(850); // 14:10
    expect(schedule.items[1].startMinutes).toBe(880); // 14:40
    expect(schedule.totalDurationMinutes).toBe(50);
  });

  it("handles midnight crossing", () => {
    // Target 01:00 (60) with a 90 minute activity
    const routine = makeRoutine(
      [{ id: "a1", name: "Sleep buffer", durationMinutes: 90, bufferMinutes: 0 }],
      60
    );
    const schedule = calculateSchedule(routine);

    expect(schedule.items[0].startMinutes).toBe(1410); // 23:30 previous day
    expect(schedule.items[0].endMinutes).toBe(60); // 01:00
    expect(schedule.items[0].startAbsoluteMinutes).toBe(-30);
    expect(schedule.totalDurationMinutes).toBe(90);
  });

  it("treats negative durations and buffers as zero", () => {
    const routine = makeRoutine([
      { id: "a2", name: "Shower", durationMinutes: 15, bufferMinutes: 0 },
      { id: "a1", name: "Commute", durationMinutes: -10, bufferMinutes: -5 },
    ]);
    const schedule = calculateSchedule(routine);

    expect(schedule.items[0].durationMinutes).toBe(15);
    expect(schedule.items[1].durationMinutes).toBe(0);
    expect(schedule.items[1].bufferMinutes).toBe(0);
  });

  it("preserves the chronological order of activities", () => {
    const routine = makeRoutine([
      { id: "a1", name: "First", durationMinutes: 10, bufferMinutes: 5 },
      { id: "a2", name: "Second", durationMinutes: 20, bufferMinutes: 0 },
      { id: "a3", name: "Third", durationMinutes: 30, bufferMinutes: 0 },
    ]);
    const schedule = calculateSchedule(routine);

    expect(schedule.items.map((item) => item.name)).toEqual(["First", "Second", "Third"]);
    expect(schedule.items[0].startAbsoluteMinutes).toBeLessThan(schedule.items[1].startAbsoluteMinutes);
    expect(schedule.items[1].startAbsoluteMinutes).toBeLessThan(schedule.items[2].startAbsoluteMinutes);
  });
});
