import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { HeatmapGrid } from "../penjadwalan/HeatmapGrid";
import { buildHeatmapRows } from "../../utils/penjadwalan";

import {
  getJadwalDosenApi,
  mapBackendDosenToJadwal,
  exportJadwalDosenExcelApi,
  type BackendDosenJadwal,
} from "../../services/laporan/jadwalDosenService";

import { LaporanToolbar } from "./LaporanToolbar";
import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function AdminJadwalDosenView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const [dosenData, setDosenData] = useState<BackendDosenJadwal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDosenId, setSelectedDosenId] = useState<string | undefined>(
    undefined,
  );

  const hasPeriode = Boolean(periodeId);

  // 1. Fetch Data dari Backend saat periodeId berubah
  useEffect(() => {
    if (!periodeId) {
      setDosenData([]);
      return;
    }

    setIsLoading(true);
    getJadwalDosenApi(periodeId)
      .then((data) => setDosenData(data))
      .catch((err) => console.error("Gagal mengambil data dosen:", err))
      .finally(() => setIsLoading(false));
  }, [periodeId]);

  // 2. Filter berdasarkan Dropdown "Semua Dosen"
  const filteredData = useMemo(() => {
    if (!selectedDosenId) return dosenData;
    return dosenData.filter((item) => String(item.id) === selectedDosenId);
  }, [dosenData, selectedDosenId]);

  // 3. Transformasi data Backend ke format HeatmapGrid
  const dosenRows = useMemo(() => {
    const mappedJadwal = mapBackendDosenToJadwal(filteredData);
    const resourceLabels = dosenData.map((d) => d.nama);

    return buildHeatmapRows(mappedJadwal, "dosen", resourceLabels);
  }, [filteredData, dosenData]);

  // 4. Buat Opsi Dropdown Dosen
  const dosenOptions = useMemo(() => {
    return dosenData.map((dosen) => ({
      id: String(dosen.id),
      label: `${dosen.nama} (${dosen.beban_sks} SKS)`,
    }));
  }, [dosenData]);

  // 5. Download Excel
  const handleExport = async () => {
    if (!periodeId) return;
    try {
      await exportJadwalDosenExcelApi(periodeId);
    } catch (error) {
      console.error("Gagal export excel:", error);
    }
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
          isExportDisabled={!hasPeriode || dosenData.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <HeatmapGrid
          rows={dosenRows}
          searchPlaceholder="Cari nama dosen"
          emptyMessage={
            isLoading
              ? "Memuat data jadwal..."
              : hasPeriode
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