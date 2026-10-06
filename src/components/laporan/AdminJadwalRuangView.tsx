import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { HeatmapGrid } from "../penjadwalan/HeatmapGrid";
import { buildHeatmapRows } from "../../utils/penjadwalan";

import {
  getJadwalRuangApi,
  mapBackendRuangToJadwal,
  exportJadwalRuangExcel,
  type BackendRuangJadwal,
} from "../../services/laporan/jadwalRuangService";

import { LaporanToolbar } from "./LaporanToolbar";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function AdminJadwalRuangView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const [ruangData, setRuangData] = useState<BackendRuangJadwal[]>([]);
  const [selectedRuangId, setSelectedRuangId] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hasPeriode = Boolean(periodeId);

  // 1. Fetch data dari API Backend saat periodeId berubah
  useEffect(() => {
    if (!periodeId) {
      setRuangData([]);
      return;
    }

    setIsLoading(true);
    getJadwalRuangApi(periodeId)
      .then((data) => {
        setRuangData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Gagal mengambil data jadwal ruang:", err);
        setRuangData([]);
      })
      .finally(() => setIsLoading(false));
  }, [periodeId]);

  // Penjagaan agar ruangData selalu berupa array
  const safeRuangData = useMemo(() => {
    return Array.isArray(ruangData) ? ruangData : [];
  }, [ruangData]);

  // 2. Mapping data backend ke format Jadwal UI
  const allJadwal = useMemo(() => {
    return mapBackendRuangToJadwal(safeRuangData);
  }, [safeRuangData]);

  // 3. Buat Opsi Dropdown Ruang dari data backend
  const ruangOptions = useMemo(() => {
    return safeRuangData.map((item) => ({
      id: String(item.id),
      label: item.nama_ruang || (item as any).nama || `Ruang ${item.id}`,
    }));
  }, [safeRuangData]);

  // 4. Filter jadwal berdasarkan ruang yang dipilih di dropdown
  const visibleJadwal = useMemo(() => {
    if (!hasPeriode) return [];

    if (!selectedRuangId) {
      return allJadwal;
    }

    const selectedRuangObj = safeRuangData.find(
      (r) => String(r.id) === selectedRuangId,
    );

    if (!selectedRuangObj) return allJadwal;

    const targetNama =
      selectedRuangObj.nama_ruang || (selectedRuangObj as any).nama || "";

    return allJadwal.filter((item) => item.ruang === targetNama);
  }, [hasPeriode, selectedRuangId, allJadwal, safeRuangData]);

  // 5. Daftar nama ruang untuk HeatmapGrid
  const activeOpsiRuang = useMemo(() => {
    if (!hasPeriode) return [];

    if (selectedRuangId) {
      const selectedObj = safeRuangData.find(
        (r) => String(r.id) === selectedRuangId,
      );
      if (selectedObj) {
        return [selectedObj.nama_ruang || (selectedObj as any).nama || ""];
      }
      return [];
    }

    return safeRuangData.map(
      (r) => r.nama_ruang || (r as any).nama || `Ruang ${r.id}`,
    );
  }, [hasPeriode, selectedRuangId, safeRuangData]);

  const ruangRows = useMemo(() => {
    return buildHeatmapRows(visibleJadwal, "ruang", activeOpsiRuang);
  }, [visibleJadwal, activeOpsiRuang]);

  const handleExport = async () => {
    if (!periodeId) return;
    try {
      await exportJadwalRuangExcel(periodeId);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh file Excel");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua ruang"
          options={ruangOptions}
          selectedId={selectedRuangId}
          onSelectChange={setSelectedRuangId}
          onExportExcel={handleExport}
          isExportDisabled={!hasPeriode || ruangRows.length === 0 || isLoading}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <HeatmapGrid
          rows={ruangRows}
          searchPlaceholder="Cari nama ruang"
          emptyMessage={
            isLoading
              ? "Memuat data jadwal ruang..."
              : hasPeriode
                ? "Belum ada ruang terjadwal."
                : "Pilih periode akademik untuk melanjutkan"
          }
          maxHeight="max-h-[520px]"
        />
      </div>
    </div>
  );
}

export default AdminJadwalRuangView;