import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label: string;
  leadingAdornment?: ReactNode;
};

function TextareaField({
  error,
  id,
  label,
  leadingAdornment,
  name,
  ...props
}: TextareaFieldProps) {
  const inputId = id ?? name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2.5">
      <label
        className="block text-sm font-semibold tracking-[-0.01em] text-foreground"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div
        className={cn(
          "group flex gap-3 rounded-xl border bg-card/80 px-4 py-3 shadow-sm transition-colors duration-200 ease-out",
          error
            ? "border-rose-300/80 ring-4 ring-rose-100"
            : "border-border focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/10 focus-within:shadow-accent"
        )}
      >
        {leadingAdornment ? (
          <span className="pt-1 text-muted-foreground transition-colors duration-200 group-focus-within:text-accent">
            {leadingAdornment}
          </span>
        ) : null}
        <textarea
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="min-h-[140px] w-full resize-y border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/55"
          id={inputId}
          name={name}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-sm text-rose-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default TextareaField;
