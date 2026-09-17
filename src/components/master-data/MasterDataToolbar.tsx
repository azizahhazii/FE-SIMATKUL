import { Input, Button } from "assets-design-system";
import Magnifer from "@solar-icons/react/search/Magnifer";
import Filter from "@solar-icons/react/ui/Filter";
import { AddCircleIcon } from "../icons/AddCircleIcon";

interface MasterDataToolbarProps {
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  /** Label tombol aksi utama, mis. "Tambah Dosen". */
  actionLabel: string;
  onAction: () => void;
  /** Tombol filter hanya ada di Kurikulum dan Kelas pada Figma. */
  showFilter?: boolean;
  onFilter?: () => void;
}

/**
 * Baris pencarian + tombol aksi di atas setiap tabel Master Data. Di Figma
 * barisnya identik di semua halaman (field cari di kiri, tombol di kanan,
 * latar neutral-400), jadi ditulis sekali di sini.
 */
export function MasterDataToolbar({
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  actionLabel,
  onAction,
  showFilter = false,
  onFilter,
}: MasterDataToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-600 bg-neutral-400 p-3">
      <div className="w-80">
        <Input
          placeholder={searchPlaceholder}
          leftIcon={<Magnifer weight="LineDuotone" />}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          size="md"
        />
      </div>

      <div className="flex items-center gap-2">
        {showFilter && (
          <Button
            theme="primary"
            variant="outline"
            size="sm"
            aria-label="Filter"
            iconLeft={<Filter weight="BoldDuotone" />}
            onClick={onFilter}
          />
        )}
        <Button
          theme="primary"
          variant="solid"
          size="sm"
          iconLeft={<AddCircleIcon />}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}