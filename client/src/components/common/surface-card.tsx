import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type SurfaceCardVariant = "default" | "dark" | "featured";

type SurfaceCardProps = HTMLAttributes<HTMLDivElement> & {
  contentClassName?: string;
  variant?: SurfaceCardVariant;
};

function SurfaceCard({
  children,
  className,
  contentClassName,
  variant = "default",
  ...props
}: SurfaceCardProps) {
  if (variant === "featured") {
    return (
      <div
        className={cn(
          "rounded-[2rem] bg-gradient-to-br from-accent via-accent to-accent-secondary p-px shadow-accent-lg",
          className
        )}
      >
        <div
          className={cn(
            "h-full rounded-[calc(2rem-1px)] border border-accent/10 bg-card/95 backdrop-blur-xl",
            contentClassName
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === "dark"
          ? "rounded-[2rem] border border-white/12 bg-white/[0.08] text-white backdrop-blur-md"
          : "rounded-[2rem] border border-border/80 bg-card/92 text-foreground shadow-diffuse backdrop-blur-md",
        className,
        contentClassName
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default SurfaceCard;
