"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRoutines } from "../hooks/use-routines";

export function TrashList() {
  const { deletedRoutines, restoreRoutine, permanentlyDeleteRoutine } = useRoutines();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trash</h1>
          <p className="text-muted-foreground">
            Deleted routines are kept here until you restore or permanently remove them.
          </p>
        </div>
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft className="mr-1 size-4" />
          Back
        </Link>
      </div>

      {deletedRoutines.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Trash is empty.</p>
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}>
              Go home
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {deletedRoutines.map((routine) => (
            <Card key={routine.id} className="bg-muted/30">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <h2 className="font-medium">{routine.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    Deleted {routine.deletedAt ? new Date(routine.deletedAt).toLocaleString() : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => restoreRoutine(routine.id)}>
                    <RotateCcw className="mr-1 size-4" />
                    Restore
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (confirm("Permanently delete this routine? This cannot be undone.")) {
                        permanentlyDeleteRoutine(routine.id);
                      }
                    }}
                    aria-label="Delete permanently"
                    title="Delete permanently"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
