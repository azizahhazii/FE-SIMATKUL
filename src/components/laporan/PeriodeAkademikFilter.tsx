import Calendar from "@solar-icons/react/time/Calendar";

import { SearchableSelectField } from "../master-data/SearchableSelectField";
import type { SelectOption } from "../master-data/SelectField";

export interface PeriodeAkademikFilterProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PeriodeAkademikFilter({
  options,
  value,
  onChange,
  disabled = false,
}: PeriodeAkademikFilterProps) {
  return (
    <div className="w-full sm:w-72">
      <SearchableSelectField
        label="Periode Akademik"
        placeholder="Cari periode akademik..."
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled}
        leftIcon={<Calendar weight="BoldDuotone" size={24} />}
      />
    </div>
  );
}

export default PeriodeAkademikFilter;
