import { cn } from "../../lib/cn";

type SectionLabelProps = {
  className?: string;
  inverse?: boolean;
  label: string;
  live?: boolean;
};

function SectionLabel({
  className,
  inverse = false,
  label,
  live = true,
}: SectionLabelProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border px-4 py-2",
        inverse
          ? "border-white/15 bg-white/5 text-white"
          : "border-accent/20 bg-accent/5 text-accent",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 rounded-full",
          inverse ? "bg-accent-secondary" : "bg-accent",
          live ? "opacity-100" : "opacity-70"
        )}
      />
      <span
        className={cn(
          "font-mono text-[0.72rem] uppercase leading-none tracking-[0.24em]",
          inverse ? "text-white/82" : "text-accent"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default SectionLabel;
