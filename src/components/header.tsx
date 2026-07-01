"use client";

import Link from "next/link";
import { Moon, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoutines } from "@/features/planner/hooks/use-routines";
import { useTheme } from "./theme-provider";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { deletedRoutines } = useRoutines();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            C
          </span>
          Clockwise
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/trash"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Trash"
            title="Trash"
          >
            <Trash2 className="size-4" />
            {deletedRoutines.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-border bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                {deletedRoutines.length}
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
