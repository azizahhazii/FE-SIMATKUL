import { useMemo, useState } from "react";
import AltArrowUp from "@solar-icons/react/arrows/AltArrowUp";
import AltArrowDown from "@solar-icons/react/arrows/AltArrowDown";

import { HeatmapGrid } from "./HeatmapGrid";
import { buildHeatmapRows } from "../../utils/penjadwalan";
import type { Jadwal } from "../../types/penjadwalan";

interface PreviewPenjadwalanProps {
  jadwal: Jadwal[];

  /** Kalau periode belum dipilih, isi kartu diganti pesan arahan. */
  hasPeriode: boolean;

  /** Semua resource master data agar slot kosong tetap terlihat. */
  opsiRuang: string[];
  opsiKelas: string[];
  opsiDosen: string[];
}

/**
 * Preview Penjadwalan:
 * - Ruang
 * - Kelas
 * - Dosen
 *
 * Setiap bagian mempunyai scroll vertical sendiri.
 * Header masing-masing tetap terlihat dan tidak ikut scroll.
 *
 * Slot kosong tidak clickable.
 * Slot terisi bisa di-hover untuk melihat detail jadwal.
 */
export function PreviewPenjadwalan({
  jadwal,
  hasPeriode,
  opsiRuang,
  opsiKelas,
  opsiDosen,
}: PreviewPenjadwalanProps) {
  const [isOpen, setIsOpen] = useState(true);

  const rowsRuang = useMemo(
    () => buildHeatmapRows(jadwal, "ruang", opsiRuang),
    [jadwal, opsiRuang],
  );

  const rowsKelas = useMemo(
    () => buildHeatmapRows(jadwal, "kelas", opsiKelas),
    [jadwal, opsiKelas],
  );

  const rowsDosen = useMemo(
    () => buildHeatmapRows(jadwal, "dosen", opsiDosen),
    [jadwal, opsiDosen],
  );

  const ChevronIcon = isOpen ? AltArrowUp : AltArrowDown;

  return (
    <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
      {/* Header Preview */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between bg-neutral-400 px-4 py-3 text-left transition hover:bg-neutral-500"
      >
        <span className="text-b3 font-bold text-neutral-1000">
          Preview Penjadwalan
        </span>

        <ChevronIcon weight="Bold" className="size-5 text-primary-400" />
      </button>

      {isOpen &&
        (hasPeriode ? (
          <div className="flex flex-col">
            {/* =================================================
                RUANG
                Scroll sendiri
            ================================================= */}
            <HeatmapGrid
              rows={rowsRuang}
              searchPlaceholder="Cari nama ruang"
              emptyMessage="Belum ada ruang terpakai."
              maxHeight="max-h-[244px]"
            />

            {/* =================================================
                KELAS
                Scroll sendiri
            ================================================= */}
            <HeatmapGrid
              rows={rowsKelas}
              searchPlaceholder="Cari nama kelas"
              emptyMessage="Belum ada kelas terjadwal."
              maxHeight="max-h-[244px]"
            />

            {/* =================================================
                DOSEN
                Scroll sendiri
            ================================================= */}
            <HeatmapGrid
              rows={rowsDosen}
              searchPlaceholder="Cari nama dosen"
              emptyMessage="Belum ada dosen terjadwal."
              maxHeight="max-h-[244px]"
            />
          </div>
        ) : (
          <div className="p-8 text-center text-b4 text-neutral-700">
            Pilih periode akademik untuk melanjutkan
          </div>
        ))}
    </div>
  );
}
