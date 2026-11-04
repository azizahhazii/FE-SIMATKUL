import { useId, useMemo, useState, type ReactNode } from "react";

import AltArrowDown from "@solar-icons/react/arrows/AltArrowDown";

import type { SelectOption } from "./SelectField";

export interface SearchableSelectFieldProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  leftIcon?: ReactNode;
  className?: string;
}

export function SearchableSelectField({
  label,
  placeholder = "Cari periode akademik...",
  options,
  value,
  onChange,
  disabled = false,
  leftIcon,
  className = "",
}: SearchableSelectFieldProps) {
  const inputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("id-ID");

    if (!keyword) return options;

    return options.filter((option) =>
      option.label.toLocaleLowerCase("id-ID").includes(keyword),
    );
  }, [options, query]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;

    onChange(option.value);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className={`flex w-full flex-col gap-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`text-b2 ${disabled ? "text-neutral-600" : "text-neutral-1000"}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={`relative flex items-center rounded-3 border-[1.5px] border-solid transition-colors focus-within:border-primary-400 ${
            disabled
              ? "border-neutral-400 bg-neutral-200"
              : "border-neutral-500 bg-neutral-100 hover:border-neutral-700"
          }`}
        >
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 flex size-6 items-center justify-center text-neutral-1000">
              {leftIcon}
            </span>
          )}

          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={`${inputId}-options`}
            aria-autocomplete="list"
            autoComplete="off"
            value={isOpen ? query : selectedOption?.label ?? ""}
            placeholder={
              isOpen
                ? placeholder
                : selectedOption?.label ?? placeholder
            }
            disabled={disabled}
            onFocus={() => {
              setQuery("");
              setIsOpen(true);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            className={`min-w-0 flex-1 bg-transparent py-3 pr-11 text-b2 text-neutral-1000 outline-none placeholder:text-neutral-700 disabled:cursor-not-allowed ${
              leftIcon ? "pl-11" : "pl-3"
            }`}
          />

          <AltArrowDown
            weight="LineDuotone"
            className={`pointer-events-none absolute right-3 size-6 shrink-0 text-neutral-700 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {isOpen && !disabled && (
          <div
            id={`${inputId}-options`}
            role="listbox"
            className="absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-300 bg-white py-1 shadow-lg"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  disabled={option.disabled}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                    value === option.value
                      ? "bg-primary-50 font-semibold text-primary-500"
                      : "text-neutral-1000"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-neutral-600">
                Periode akademik tidak ditemukan.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchableSelectField;
