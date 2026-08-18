import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full rounded-full border border-rule bg-sheet px-4 text-sm text-ink outline-none placeholder:text-mill focus:border-mark",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
