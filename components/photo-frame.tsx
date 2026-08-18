"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { resolvePhoto } from "@/lib/media";

export function PhotoFrame({
  src,
  alt,
  className,
  sizes = "100vw",
  priority = false,
  pan = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  pan?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = resolvePhoto(src);

  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-mill/15", className)}>
      {failed ? (
        <div className="mill-fallback absolute inset-0" aria-hidden />
      ) : (
        <Image
          src={resolved}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn("object-cover", pan && "animate-hero-pan")}
        />
      )}
    </div>
  );
}
