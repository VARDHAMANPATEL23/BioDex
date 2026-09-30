import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[var(--theme-border)] bg-[var(--theme-badge-bg)] text-[var(--theme-badge-text)] shadow-sm",
        secondary:
          "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-300",
        outline:
          "border-zinc-800 text-zinc-300",
        scientific:
          "border-[var(--theme-border)] bg-zinc-900/80 text-[var(--theme-primary)] font-mono text-[10px] uppercase tracking-widest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
