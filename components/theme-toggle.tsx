"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "paper", label: "Cloud", swatch: "#F7F9FC" },
  { id: "mill", label: "Navy", swatch: "#08172F" },
  { id: "foundry", label: "Soft blue", swatch: "#E8F4FC" },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("flex items-center gap-1.5", className)}
    >
      {THEMES.map((item) => {
        const active = mounted && theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={item.label}
            title={item.label}
            onClick={() => setTheme(item.id)}
            className={cn(
              "size-4 rounded-full border",
              active ? "border-ink ring-2 ring-ink" : "border-rule",
            )}
            style={{ background: item.swatch }}
          />
        );
      })}
    </div>
  );
}
