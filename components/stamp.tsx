import { cn } from "@/lib/utils";

export function Stamp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-paper px-2.5 py-0.5 text-[11px] font-medium text-steel",
        className,
      )}
    >
      {children}
    </span>
  );
}
