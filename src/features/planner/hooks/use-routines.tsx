"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { duplicateRoutine as makeDuplicate } from "../lib/routine";
import { isRoutineArray } from "../lib/validation";
import type { Routine } from "../types";

const STORAGE_KEY = "clockwise-routines-v1";

function nowIso(): string {
  return new Date().toISOString();
}

interface RoutinesContextValue {
  routines: Routine[];
  activeRoutines: Routine[];
  deletedRoutines: Routine[];
  isLoaded: boolean;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  restoreRoutine: (id: string) => void;
  permanentlyDeleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  reorderActiveRoutines: (fromActiveIndex: number, toActiveIndex: number) => void;
  importRoutines: (routines: Routine[]) => void;
  getRoutine: (id: string) => Routine | undefined;
}

const RoutinesContext = createContext<RoutinesContextValue | undefined>(undefined);

function loadRoutines(): Routine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (isRoutineArray(parsed)) return parsed;
  } catch {
    // Ignore corrupt storage.
  }
  return [];
}

function saveRoutines(routines: Routine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
}

export function RoutinesProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const activeRoutines = useMemo(
    () => routines.filter((r) => !r.deletedAt),
    [routines]
  );
  const deletedRoutines = useMemo(
    () => routines.filter((r) => r.deletedAt),
    [routines]
  );

  // Load persisted routines once the component mounts on the client.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRoutines(loadRoutines());
    setIsLoaded(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!isLoaded) return;
    saveRoutines(routines);
  }, [routines, isLoaded]);

  const addRoutine = useCallback((routine: Routine) => {
    setRoutines((prev) => [routine, ...prev]);
  }, []);

  const updateRoutine = useCallback((routine: Routine) => {
    const withTimestamp = { ...routine, updatedAt: nowIso() };
    setRoutines((prev) => prev.map((r) => (r.id === withTimestamp.id ? withTimestamp : r)));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, deletedAt: nowIso() } : r))
    );
  }, []);

  const restoreRoutine = useCallback((id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, deletedAt: undefined } : r))
    );
  }, []);

  const permanentlyDeleteRoutine = useCallback((id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const duplicateRoutine = useCallback((id: string) => {
    setRoutines((prev) => {
      const original = prev.find((r) => r.id === id);
      if (!original) return prev;
      const copy = makeDuplicate(original);
      return [copy, ...prev];
    });
  }, []);

  const reorderActiveRoutines = useCallback((fromActiveIndex: number, toActiveIndex: number) => {
    if (fromActiveIndex === toActiveIndex) return;
    setRoutines((prev) => {
      const activeIndices = prev
        .map((r, i) => (!r.deletedAt ? i : -1))
        .filter((i) => i !== -1);
      const fromFull = activeIndices[fromActiveIndex];
      const toFull = activeIndices[toActiveIndex];
      if (fromFull === undefined || toFull === undefined) return prev;

      const next = [...prev];
      const [moved] = next.splice(fromFull, 1);
      next.splice(toFull, 0, moved);
      return next;
    });
  }, []);

  const importRoutines = useCallback((incoming: Routine[]) => {
    setRoutines((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const existingNames = new Set(prev.map((r) => r.name));
      const toAdd: Routine[] = [];

      for (const routine of incoming) {
        if (existingIds.has(routine.id)) continue;

        const flags = routine.flags ? [...routine.flags] : [];
        if (existingNames.has(routine.name)) {
          flags.push("duplicate-name");
        }

        toAdd.push({
          ...routine,
          createdAt: nowIso(),
          updatedAt: nowIso(),
          source: "shared",
          flags: flags.length > 0 ? flags : undefined,
          deletedAt: undefined,
        });
      }

      return [...prev, ...toAdd];
    });
  }, []);

  const getRoutine = useCallback(
    (id: string) => routines.find((r) => r.id === id),
    [routines]
  );

  return (
    <RoutinesContext.Provider
      value={{
        routines,
        activeRoutines,
        deletedRoutines,
        isLoaded,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        restoreRoutine,
        permanentlyDeleteRoutine,
        duplicateRoutine,
        reorderActiveRoutines,
        importRoutines,
        getRoutine,
      }}
    >
      {children}
    </RoutinesContext.Provider>
  );
}

export function useRoutines() {
  const context = useContext(RoutinesContext);
  if (!context) {
    throw new Error("useRoutines must be used within a RoutinesProvider");
  }
  return context;
}
