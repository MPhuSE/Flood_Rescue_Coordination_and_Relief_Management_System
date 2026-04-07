import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  action?: ReactNode;
  error?: string;
  inputClassName?: string;
  label: string;
  leadingAdornment?: ReactNode;
};

function InputField({
  action,
  error,
  id,
  inputClassName,
  label,
  leadingAdornment,
  name,
  ...props
}: InputFieldProps) {
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
          "group flex h-14 items-center gap-3 rounded-xl border bg-card/80 px-4 shadow-sm transition-colors duration-200 ease-out",
          error
            ? "border-rose-300/80 ring-4 ring-rose-100"
            : "border-border focus-within:border-accent/30 focus-within:ring-4 focus-within:ring-accent/10 focus-within:shadow-accent"
        )}
      >
        {leadingAdornment ? (
          <span className="shrink-0 text-muted-foreground transition-colors duration-200 group-focus-within:text-accent">
            {leadingAdornment}
          </span>
        ) : null}
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-full w-full border-0 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/55",
            inputClassName
          )}
          id={inputId}
          name={name}
          {...props}
        />
        {action ? <span className="shrink-0">{action}</span> : null}
      </div>
      {error ? (
        <p className="text-sm text-rose-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default InputField;
