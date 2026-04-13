import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: string;
  label: string;
  leadingAdornment?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
};

function SelectField({
  error,
  id,
  label,
  leadingAdornment,
  name,
  options,
  placeholder,
  ...props
}: SelectFieldProps) {
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
          "group relative flex h-14 items-center gap-3 rounded-xl border bg-card/80 px-4 shadow-sm transition-colors duration-200 ease-out",
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
        <select
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="h-full w-full appearance-none border-0 bg-transparent pr-8 text-[15px] text-foreground outline-none"
          id={inputId}
          name={name}
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 text-muted-foreground">
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="m7 10 5 5 5-5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
      </div>
      {error ? (
        <p className="text-sm text-rose-600" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export type { SelectOption };
export default SelectField;
