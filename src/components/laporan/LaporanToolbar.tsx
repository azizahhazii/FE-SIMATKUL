import type { ReactNode } from "react";

import FileDownload from "@solar-icons/react/files/FileDownload";

import { Button } from "assets-design-system";

import { SelectField, type SelectOption } from "../master-data/SelectField";

import { useAuth } from "../../context/AuthContext";

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

const ALL_VALUE = "ALL";

export function LaporanToolbar({
  defaultOptionLabel = "Semua data",
  options,
  selectedId,
  onSelectChange,
  onExportExcel,
  isExportDisabled = false,
  selectLeftIcon,
}: LaporanToolbarProps) {
  const { user } = useAuth();

  const isGuest = user?.role?.toLowerCase() === "guest";

  const exportDisabled = isGuest || isExportDisabled;

  const selectOptions: SelectOption[] = [
    {
      value: ALL_VALUE,
      label: defaultOptionLabel,
    },
    ...options.map((opt) => ({
      value: opt.id,
      label: opt.label,
    })),
  ];

  const handleChange = (value: string) => {
    onSelectChange(value === ALL_VALUE ? undefined : value);
  };

  const handleExport = () => {
    if (exportDisabled) return;

    onExportExcel();
  };

  return (
    <div className="flex flex-col gap-3 border-b border-neutral-600 bg-neutral-400 p-3 sm:flex-row sm:items-center sm:justify-between">
      {/* ================= FILTER ================= */}
      <div className="w-full sm:w-80">
        <SelectField
          options={selectOptions}
          value={selectedId ?? ALL_VALUE}
          onChange={handleChange}
          leftIcon={selectLeftIcon}
          className="!bg-white/60"
        />
      </div>

      {/* ================= EXPORT ================= */}
      {!isGuest && (
        <Button
          theme="primary"
          variant="solid"
          size="md"
          onClick={handleExport}
          disabled={exportDisabled}
          className={exportDisabled ? "!opacity-60" : ""}
          title={isGuest ? "Ekspor Excel hanya tersedia untuk Admin" : undefined}
        >
          <div className="flex items-center gap-2">
            <FileDownload weight="BoldDuotone" size={20} />

            <span>Ekspor ke Excel</span>
          </div>
        </Button>
      )}
    </div>
  );
}

export default LaporanToolbar;