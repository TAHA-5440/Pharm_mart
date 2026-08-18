import Link from "next/link";
import { PhotoFrame } from "@/components/photo-frame";
import { Stamp } from "@/components/stamp";

export function ListingCard({
  href,
  photo,
  alt,
  stamps,
  title,
  meta,
  price,
}: {
  href: string;
  photo: string;
  alt: string;
  stamps: string[];
  title: string;
  meta: string;
  price: string;
}) {
  return (
    <Link href={href} className="group block">
      <PhotoFrame src={photo} alt={alt} className="aspect-[4/3]" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {stamps.map((s) => (
          <Stamp key={s}>{s}</Stamp>
        ))}
      </div>
      <p className="mt-2 font-medium text-ink group-hover:text-steel">{title}</p>
      <p className="text-sm text-ink-soft">{meta}</p>
      <p className="mt-1 text-sm font-medium">{price}</p>
    </Link>
  );
}
