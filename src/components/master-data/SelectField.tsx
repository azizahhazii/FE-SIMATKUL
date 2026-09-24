import { useId, type ReactNode } from "react";
import AltArrowDown from "@solar-icons/react/arrows/AltArrowDown";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  disabled?: boolean;
  id?: string;
  leftIcon?: ReactNode;
  className?: string;
}

export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  helperText,
  disabled = false,
  id,
  leftIcon,
  className = "",
}: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label
          htmlFor={selectId}
          className={`text-b2 ${disabled ? "text-neutral-900" : "text-neutral-1000"}`}
        >
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-3 border-[1.5px] border-solid transition-colors
          focus-within:border-primary-400
          ${
            disabled
              ? "border-neutral-400 bg-neutral-200"
              : "border-neutral-500 bg-neutral-100 hover:border-neutral-700"
          } ${className}`}
      >
        {leftIcon && (
          <span
            className={`pointer-events-none absolute left-3 flex size-6 shrink-0 items-center justify-center ${
              disabled ? "text-neutral-600" : "text-neutral-1000"
            }`}
          >
            {leftIcon}
          </span>
        )}

        <select
          id={selectId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`min-w-0 flex-1 appearance-none bg-transparent pr-11 text-b2 outline-none
            ${leftIcon ? "py-3 pl-11" : "p-3"}
            ${
              disabled
                ? "text-neutral-600"
                : value === ""
                  ? "text-neutral-700"
                  : "text-neutral-1000"
            }`}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <AltArrowDown
          weight="LineDuotone"
          className="pointer-events-none absolute right-3 size-6 shrink-0 text-neutral-700"
        />
      </div>

      {helperText && (
        <p
          className={`text-b3 ${disabled ? "text-neutral-600" : "text-neutral-700"}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}