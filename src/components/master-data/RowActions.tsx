import Pen from "@solar-icons/react/messages/Pen";
import TrashBinMinimalistic from "@solar-icons/react/ui/TrashBinMinimalistic";

interface RowActionsProps {
  /** Dipakai untuk aria-label, mis. "Dosen" -> "Hapus Dosen" / "Edit Dosen". */
  entityLabel: string;
  onDelete: () => void;
  onEdit: () => void;
}

/**
 * Pasangan tombol aksi di kolom "Aksi" — di Figma selalu urutan yang sama
 * (hapus outline merah, lalu edit solid primary) dengan ukuran yang sama di
 * semua tabel Master Data.
 */
export function RowActions({ entityLabel, onDelete, onEdit }: RowActionsProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={`Hapus ${entityLabel}`}
        onClick={onDelete}
        className="flex size-8 items-center justify-center rounded-2 border border-red-100 bg-white text-red-100 transition hover:bg-red-100/10"
      >
        <TrashBinMinimalistic weight="BoldDuotone" className="size-4.5" />
      </button>
      <button
        type="button"
        aria-label={`Edit ${entityLabel}`}
        onClick={onEdit}
        className="flex size-8 items-center justify-center rounded-2 bg-primary-400 text-white transition hover:bg-primary-500"
      >
        <Pen weight="BoldDuotone" className="size-4.5" />
      </button>
    </div>
  );
}