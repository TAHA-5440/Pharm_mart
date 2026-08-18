"use client";

import { useState } from "react";
import { PhotoFrame } from "@/components/photo-frame";

export function Gallery({
  photos,
  alt,
}: {
  photos: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const current = photos[index] ?? photos[0];
  if (!current) return null;

  return (
    <div className="space-y-3">
      <PhotoFrame
        src={current}
        alt={`${alt} — view ${index + 1}`}
        className="aspect-[16/10]"
        sizes="(max-width: 768px) 100vw, 58vw"
        priority
      />
      {photos.length > 1 ? (
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(0, 4).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`overflow-hidden rounded-2xl ring-2 ${i === index ? "ring-mark" : "ring-transparent"}`}
            >
              <PhotoFrame
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                className="aspect-square rounded-2xl"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
