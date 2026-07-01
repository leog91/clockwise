import { generateId } from "@/lib/id";
import type { Activity, Routine } from "../types";

function duplicateActivity(activity: Activity): Activity {
  return {
    ...activity,
    id: generateId(),
  };
}

export function duplicateRoutine(routine: Routine): Routine {
  return {
    ...routine,
    id: generateId(),
    name: `${routine.name} (copy)`,
    activities: routine.activities.map(duplicateActivity),
  };
}
