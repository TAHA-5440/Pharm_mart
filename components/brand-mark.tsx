import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  height = 28,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  const width = Math.round(height * (2172 / 724));
  return (
    <Image
      src="/brand/procurex-logo-primary.png"
      alt="ProcureX"
      width={width}
      height={height}
      className={cn("w-auto", className)}
      style={{ height, width: "auto" }}
      priority={priority}
    />
  );
}

export function BrandX({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/procurex-x-mark.png"
      alt="ProcureX"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
    />
  );
}
