import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--theme-primary)] text-black font-semibold hover:bg-[var(--theme-primary-hover)] shadow-sm hover:shadow-[0_0_15px_var(--theme-primary-glow)]",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50",
        outline:
          "border border-white/10 bg-transparent text-zinc-300 hover:bg-white/5 hover:text-white hover:border-[var(--theme-border)]",
        ghost:
          "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
        themeGhost:
          "text-[var(--theme-primary)] hover:bg-[var(--theme-primary-dim)] hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-[11px]",
        lg: "h-11 rounded-lg px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
