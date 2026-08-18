"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Workaround for React 19 + next-themes issue where it warns about <script> tag
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("Encountered a script tag")) return;
    orig.apply(console, args);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="paper"
      forcedTheme="paper"
      enableSystem={false}
      themes={["paper"]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
