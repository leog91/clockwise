import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RoutinesProvider } from "@/features/planner/hooks/use-routines";
import { Header } from "@/components/header";
import { ShareImporter } from "@/components/share-importer";

export const metadata: Metadata = {
  title: "Clockwise — Arrive on time",
  description: "Work backwards from your target arrival time.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <RoutinesProvider>
            <Header />
            <Suspense>
              <ShareImporter />
            </Suspense>
            {children}
          </RoutinesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
