"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { duplicateRoutine as makeDuplicate } from "../lib/routine";
import type { Routine } from "../types";

const STORAGE_KEY = "clockwise-routines-v1";

interface RoutinesContextValue {
  routines: Routine[];
  isLoaded: boolean;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (routine: Routine) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  reorderRoutines: (fromIndex: number, toIndex: number) => void;
  getRoutine: (id: string) => Routine | undefined;
}

const RoutinesContext = createContext<RoutinesContextValue | undefined>(undefined);

function loadRoutines(): Routine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as Routine[];
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
    setRoutines((prev) => prev.map((r) => (r.id === routine.id ? routine : r)));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
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

  const reorderRoutines = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setRoutines((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
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
        isLoaded,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        duplicateRoutine,
        reorderRoutines,
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
