import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-mark disabled:pointer-events-none disabled:opacity-50 min-h-11 px-5 py-2.5",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper",
        mark: "bg-mark text-mark-ink",
        outline: "border border-rule bg-sheet text-ink",
        ghost: "text-ink-soft",
        steel: "bg-steel text-paper",
        hairline: "border border-rule bg-sheet text-ink",
      },
      size: {
        default: "min-h-11 px-5 py-2.5",
        sm: "min-h-9 px-4 py-2 text-sm",
        lg: "min-h-12 px-6",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
