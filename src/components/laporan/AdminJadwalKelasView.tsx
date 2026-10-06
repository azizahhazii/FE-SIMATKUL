import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { HeatmapGrid } from "../penjadwalan/HeatmapGrid";
import { buildHeatmapRows } from "../../utils/penjadwalan";

import {
  getJadwalKelasApi,
  mapBackendKelasToJadwal,
  exportJadwalKelasExcel,
  type BackendKelasJadwal,
} from "../../services/laporan/jadwalKelasService";

import { LaporanToolbar } from "./LaporanToolbar";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function AdminJadwalKelasView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const [kelasData, setKelasData] = useState<BackendKelasJadwal[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hasPeriode = Boolean(periodeId);

  // 1. Fetch data dari API Backend saat periodeId berubah
  useEffect(() => {
    if (!periodeId) {
      setKelasData([]);
      return;
    }

    setIsLoading(true);
    getJadwalKelasApi(periodeId)
      .then((data) => {
        setKelasData(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Gagal mengambil data jadwal kelas:", err);
        setKelasData([]);
      })
      .finally(() => setIsLoading(false));
  }, [periodeId]);

  // Penjagaan agar kelasData selalu berupa array
  const safeKelasData = useMemo(() => {
    return Array.isArray(kelasData) ? kelasData : [];
  }, [kelasData]);

  // 2. Mapping data backend ke format Jadwal UI
  const allJadwal = useMemo(() => {
    return mapBackendKelasToJadwal(safeKelasData);
  }, [safeKelasData]);

  // 3. Buat Opsi Dropdown Kelas dari data backend
  const kelasOptions = useMemo(() => {
    return safeKelasData.map((item) => ({
      id: String(item.id),
      label: item.kode_kelas || (item as any).nama || `Kelas ${item.id}`,
    }));
  }, [safeKelasData]);

  // 4. Filter jadwal berdasarkan kelas yang dipilih di dropdown
  const visibleJadwal = useMemo(() => {
    if (!hasPeriode) return [];

    if (!selectedKelasId) {
      return allJadwal;
    }

    const selectedKelasObj = safeKelasData.find(
      (k) => String(k.id) === selectedKelasId,
    );

    if (!selectedKelasObj) return allJadwal;

    const targetKode =
      selectedKelasObj.kode_kelas || (selectedKelasObj as any).nama || "";

    return allJadwal.filter((item) => item.kelas === targetKode);
  }, [hasPeriode, selectedKelasId, allJadwal, safeKelasData]);

  // 5. Daftar nama/kode kelas untuk HeatmapGrid
  const activeOpsiKelas = useMemo(() => {
    if (!hasPeriode) return [];

    if (selectedKelasId) {
      const selectedObj = safeKelasData.find(
        (k) => String(k.id) === selectedKelasId,
      );
      if (selectedObj) {
        return [selectedObj.kode_kelas || (selectedObj as any).nama || ""];
      }
      return [];
    }

    return safeKelasData.map(
      (k) => k.kode_kelas || (k as any).nama || `Kelas ${k.id}`,
    );
  }, [hasPeriode, selectedKelasId, safeKelasData]);

  const kelasRows = useMemo(() => {
    return buildHeatmapRows(visibleJadwal, "kelas", activeOpsiKelas);
  }, [visibleJadwal, activeOpsiKelas]);

  const handleExport = async () => {
    if (!periodeId) return;
    try {
      await exportJadwalKelasExcel(periodeId);
    } catch (err) {
      console.error(err);
      alert("Gagal mengunduh file Excel");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua kelas"
          options={kelasOptions}
          selectedId={selectedKelasId}
          onSelectChange={setSelectedKelasId}
          onExportExcel={handleExport}
          isExportDisabled={!hasPeriode || kelasRows.length === 0 || isLoading}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <HeatmapGrid
          rows={kelasRows}
          searchPlaceholder="Cari nama kelas"
          emptyMessage={
            isLoading
              ? "Memuat data jadwal kelas..."
              : hasPeriode
                ? "Belum ada kelas terjadwal."
                : "Pilih periode akademik untuk melanjutkan"
          }
          maxHeight="max-h-[520px]"
        />
      </div>
    </div>
  );
}

export default AdminJadwalKelasView;