import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "default" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  trailingIcon?: ReactNode;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-[#3565e8] bg-[#3565e8] text-white shadow-[0_10px_24px_rgba(53,101,232,0.18)] hover:bg-[#2f5dd7] hover:border-[#2f5dd7]",
  outline:
    "border border-border bg-transparent text-foreground shadow-sm hover:border-accent/30 hover:bg-muted/60",
  ghost:
    "border border-transparent bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-14 px-5 text-sm",
  sm: "h-11 px-4 text-sm",
};

function Button({
  children,
  className,
  size = "default",
  trailingIcon,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-[-0.01em] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {trailingIcon ? (
        <span>{trailingIcon}</span>
      ) : null}
    </button>
  );
}

export default Button;
