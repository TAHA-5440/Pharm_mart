"use client";

import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: ReactNode }) {
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
