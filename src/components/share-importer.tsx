"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoutines } from "@/features/planner/hooks/use-routines";
import { decodeRoutines } from "@/features/planner/lib/share";

export function ShareImporter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, importRoutines } = useRoutines();
  const [error, setError] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isLoaded) return;

    const raw = searchParams.get("state");
    if (!raw) return;

    const decoded = decodeRoutines(raw);
    if (!decoded || decoded.length === 0) {
      setError("The shared link is invalid or expired.");
      return;
    }

    importRoutines(decoded);
    router.replace("/");
  }, [isLoaded, searchParams, importRoutines, router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!error) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl items-start justify-between gap-3 px-4 py-3 text-sm text-destructive sm:px-6">
      <p>{error}</p>
      <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => setError(null)}>
        <X className="size-4" />
      </Button>
    </div>
  );
}
