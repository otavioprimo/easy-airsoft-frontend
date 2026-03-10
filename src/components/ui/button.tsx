import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-semibold tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-[0_8px_20px_rgba(10,31,68,0.18)] hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-[0_10px_24px_rgba(10,31,68,0.24)]",
        outline:
          "border border-primary/25 bg-white text-primary hover:border-primary/40 hover:bg-primary/5",
        ghost: "text-primary hover:bg-primary/10",
        accent: "bg-accent text-primary shadow-[0_8px_20px_rgba(37,207,99,0.22)] hover:-translate-y-0.5 hover:bg-accent/90",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-7 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
