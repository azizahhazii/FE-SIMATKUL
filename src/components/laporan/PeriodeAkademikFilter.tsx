import Calendar from '@solar-icons/react/time/Calendar';
import { SelectField, type SelectOption } from '../master-data/SelectField';

export interface PeriodeAkademikFilterProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
}

export function PeriodeAkademikFilter({ options, value, onChange }: PeriodeAkademikFilterProps) {
  return (
    <div className="w-full sm:w-72">
      <SelectField
        label="Periode Akademik"
        placeholder="Pilih periode akademik"
        options={options}
        value={value}
        onChange={onChange}
        leftIcon={<Calendar weight="BoldDuotone" size={24} />}
      />
    </div>
  );
}