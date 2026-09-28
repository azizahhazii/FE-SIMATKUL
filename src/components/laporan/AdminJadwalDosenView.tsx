import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { HeatmapGrid } from "../penjadwalan/HeatmapGrid";
import { buildHeatmapRows } from "../../utils/penjadwalan";

import { dummyJadwal, dummyOpsiDosen } from "../../data/penjadwalan";

import { getJadwalDosen } from "../../services/laporan/jadwalDosenService";

import { exportMatrixToExcel } from "../../utils/exportExcel";

import { LaporanToolbar } from "./LaporanToolbar";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function AdminJadwalDosenView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const [selectedDosenId, setSelectedDosenId] = useState<string | undefined>(
    undefined,
  );

  const hasPeriode = Boolean(periodeId);

  const visibleJadwal = useMemo(() => {
    if (!hasPeriode) {
      return [];
    }

    if (!selectedDosenId) {
      return dummyJadwal;
    }

    const selectedDosen = dummyOpsiDosen[Number(selectedDosenId)];

    if (!selectedDosen) {
      return dummyJadwal;
    }

    return dummyJadwal.filter((item) => item.dosen === selectedDosen);
  }, [hasPeriode, selectedDosenId]);

  const dosenRows = useMemo(() => {
    return buildHeatmapRows(
      visibleJadwal,
      "dosen",
      hasPeriode
        ? selectedDosenId
          ? [dummyOpsiDosen[Number(selectedDosenId)]]
          : dummyOpsiDosen
        : [],
    );
  }, [visibleJadwal, hasPeriode, selectedDosenId]);

  const dosenOptions = dummyOpsiDosen.map((dosen, index) => ({
    id: String(index),
    label: dosen,
  }));

  const handleExport = async () => {
    if (!hasPeriode) return;

    const data = await getJadwalDosen("GNJ-2025-2026", undefined);

    exportMatrixToExcel(data, `Laporan_Jadwal_Dosen_${periodeId}`);
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua dosen"
          options={dosenOptions}
          selectedId={selectedDosenId}
          onSelectChange={setSelectedDosenId}
          onExportExcel={handleExport}
          isExportDisabled={!hasPeriode || dosenRows.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <HeatmapGrid
          rows={dosenRows}
          searchPlaceholder="Cari nama dosen"
          emptyMessage={
            hasPeriode
              ? "Belum ada dosen terjadwal."
              : "Pilih periode akademik untuk melanjutkan"
          }
          maxHeight="max-h-[520px]"
        />
      </div>
    </div>
  );
}

export default AdminJadwalDosenView;
