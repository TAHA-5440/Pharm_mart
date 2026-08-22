"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function SellerFileInput({
  name,
  accept,
  required,
  hint,
  multiple,
}: {
  name: string;
  accept: string;
  required?: boolean;
  hint: string;
  multiple?: boolean;
}) {
  const [label, setLabel] = useState<string | null>(null);

  return (
    <label className="block cursor-pointer text-sm">
      <span
        className={cn(
          "mt-1 flex items-center gap-3 rounded-xl border border-dashed border-rule bg-paper px-3 py-2.5 transition hover:border-mark hover:bg-sage",
        )}
      >
        <input
          name={name}
          type="file"
          accept={accept}
          required={required}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            const files = e.target.files;
            if (!files?.length) setLabel(null);
            else if (files.length === 1) setLabel(files[0].name);
            else setLabel(`${files.length} files`);
          }}
        />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mark text-white">
          <FileUp className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{label ?? hint}</span>
          <span className="block text-xs text-ink-soft">{label ? "Click to replace" : "PDF or image"}</span>
        </span>
        <span className="shrink-0 rounded-full bg-mark px-3 py-1.5 text-xs font-semibold text-white">
          {label ? "Replace" : "Browse"}
        </span>
      </span>
    </label>
  );
}
