import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MarkButton({
  href,
  children,
  className,
  type,
  name,
  value,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  name?: string;
  value?: string;
}) {
  if (href) {
    return (
      <Button asChild variant="mark" className={className}>
        <Link href={href}>{children}</Link>
      </Button>
    );
  }
  return (
    <Button
      type={type ?? "button"}
      variant="mark"
      className={cn(className)}
      name={name}
      value={value}
    >
      {children}
    </Button>
  );
}
