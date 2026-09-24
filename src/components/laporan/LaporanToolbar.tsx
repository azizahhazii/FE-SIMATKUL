import type { ReactNode } from 'react';
import FileDownload from '@solar-icons/react/files/FileDownload';
import { Button } from 'assets-design-system';
import { SelectField, type SelectOption } from '../master-data/SelectField';

export interface OptionEntitas {
  id: string;
  label: string;
}

export interface LaporanToolbarProps {
  defaultOptionLabel?: string;
  options: OptionEntitas[];
  selectedId: string | undefined;
  onSelectChange: (value: string | undefined) => void;
  onExportExcel: () => void;
  isExportDisabled?: boolean;
  selectLeftIcon?: ReactNode;
}

const ALL_VALUE = 'ALL';

export function LaporanToolbar({
  defaultOptionLabel = 'Semua data',
  options,
  selectedId,
  onSelectChange,
  onExportExcel,
  isExportDisabled = false,
  selectLeftIcon,
}: LaporanToolbarProps) {

  const selectOptions: SelectOption[] = [
    { value: ALL_VALUE, label: defaultOptionLabel },
    ...options.map((opt) => ({
      value: opt.id,
      label: opt.label,
    })),
  ];

  const handleChange = (value: string) => {

    onSelectChange(value === ALL_VALUE ? undefined : value);
  };

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-600 bg-neutral-400 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:w-80">
        <SelectField
          options={selectOptions}
          value={selectedId ?? ALL_VALUE}
          onChange={handleChange}
          leftIcon={selectLeftIcon}
          className="!bg-white/60"
        />
      </div>

      <Button
        theme="primary"
        variant="solid"
        size="md"
        onClick={onExportExcel}
        disabled={isExportDisabled}
      >
        <div className="flex items-center gap-2">
          <FileDownload weight="BoldDuotone" size={20} />
          <span>Ekspor to Excel</span>
        </div>
      </Button>
    </div>
  );
}