import { useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";
import {
  getJadwalKelas,
  exportJadwalKelasExcel,
  type BackendKelasJadwal,
} from "../../services/laporan/jadwalKelasService";

import type {
  BarisLaporanJadwal,
  Hari,
  KelasRingkas,
  SelJadwal,
} from "../../types/laporan";

import { exportMatrixToExcel } from "../../utils/exportExcel";
import { JadwalMatrixTable } from "./JadwalMatrixTable";
import { LaporanToolbar } from "./LaporanToolbar";
import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

const HARI_KERJA: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/**
 * Mapper: Mengubah data BackendKelasJadwal[] dari API service
 * menjadi format BarisLaporanJadwal<KelasRingkas>[] yang dibutuhkan JadwalMatrixTable
 */
function mapBackendKelasToLaporan(
  kelasList: BackendKelasJadwal[] = [],
): BarisLaporanJadwal<KelasRingkas>[] {
  if (!Array.isArray(kelasList)) return [];

  const capitalizeHari = (h: string): Hari => {
    if (!h) return "Senin";
    const lower = String(h).toLowerCase();
    const cap = (lower.charAt(0).toUpperCase() + lower.slice(1)) as Hari;
    return HARI_KERJA.includes(cap) ? cap : "Senin";
  };

  return kelasList.map((kelas) => {
    const kodeKelas =
      kelas.kode_kelas || (kelas as any).nama || (kelas as any).kelas || `Kelas ${kelas.id}`;

    // Inisialisasi slot per sesi (1 - 12) sesuai tipe Hari
    const sesiMap: Record<number, Record<Hari, SelJadwal[]>> = {};
    for (let s = 1; s <= 5; s++) {
      sesiMap[s] = {
        Senin: [],
        Selasa: [],
        Rabu: [],
        Kamis: [],
        Jumat: [],
      };
    }

    const jadwalItems = Array.isArray(kelas.jadwal) ? kelas.jadwal : [];

    for (const item of jadwalItems) {
      if (!item) continue;
      const hari = capitalizeHari(item.hari);
      const sesiList = Array.isArray(item.sesi)
        ? item.sesi.map(Number).sort((a, b) => a - b)
        : item.sesi !== undefined && item.sesi !== null
          ? [Number(item.sesi)]
          : [];

      if (sesiList.length === 0) continue;

      const sesiAwal = sesiList[0];
      const sesiAkhir = sesiList[sesiList.length - 1];

      const ketParts = [item.nama_dosen, item.nama_ruang].filter(Boolean);
      const keterangan = ketParts.join(" - ");

      const cellData: SelJadwal = {
        entryId: `${kelas.id}-${item.nama_matkul}-${hari}-${sesiAwal}`,
        matkulNama: item.nama_matkul || "",
        keterangan: keterangan,
        sesiAwal: sesiAwal,
        sesiAkhir: sesiAkhir,
      };

      for (const s of sesiList) {
        if (sesiMap[s] && sesiMap[s][hari]) {
          sesiMap[s][hari].push(cellData);
        }
      }
    }

    const jadwalPerSesi = Object.keys(sesiMap)
      .map(Number)
      .sort((a, b) => a - b)
      .map((sesi) => ({
        sesi,
        perHari: sesiMap[sesi],
      }));

    return {
      info: {
        id: String(kelas.id ?? kodeKelas),
        nama: kodeKelas,
      } as KelasRingkas,
      jadwalPerSesi,
    };
  });
}

export function JadwalKelasView() {
  const context = useOutletContext<LaporanOutletContext>();
  const periodeId = context?.periodeId;

  // Validasi ketat pemilihan periode
  const isPeriodeSelected = Boolean(
    periodeId &&
      String(periodeId).trim() !== "" &&
      String(periodeId) !== "__NO_PERIODE__" &&
      String(periodeId) !== "undefined" &&
      String(periodeId) !== "null",
  );

  const periodeUntukFetch = isPeriodeSelected
    ? String(periodeId)
    : "__NO_PERIODE__";

  // Wrapper service untuk mengambil data API dan mengkonversinya ke format matriks
  const fetchMappedJadwalKelas = useCallback(
    async (pId: string | number) => {
      if (!pId || pId === "__NO_PERIODE__") return [];
      const rawData = await getJadwalKelas(pId);
      return mapBackendKelasToLaporan(rawData);
    },
    [],
  );

  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan<
    BarisLaporanJadwal<KelasRingkas>
  >({
    service: fetchMappedJadwalKelas,
    periodeAkademikId: periodeUntukFetch,
  });

  // Kosongkan data secara eksplisit jika belum pilih periode
  const safeData = useMemo(() => {
    if (!isPeriodeSelected) return [];
    return Array.isArray(data) ? data : [];
  }, [data, isPeriodeSelected]);

  // Buat opsi dropdown dari data API yang didapat
  const kelasOptions = useMemo(() => {
    if (!isPeriodeSelected) return [];
    return safeData
      .filter((item) => item && item.info)
      .map((item) => ({
        id: String(item.info.id),
        label: item.info.nama || "-",
      }));
  }, [safeData, isPeriodeSelected]);

  const handleExport = async () => {
    if (!isPeriodeSelected) return;
    try {
      await exportJadwalKelasExcel(periodeId);
    } catch {
      if (safeData.length > 0) {
        exportMatrixToExcel(safeData, `Laporan_Jadwal_Kelas_${periodeId}`);
      }
    }
  };

  const renderKelasInfo = (kelas?: KelasRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {kelas?.nama ?? "-"}
      </div>
    </div>
  );

  const emptyMessage = !isPeriodeSelected
    ? "Pilih periode akademik untuk melanjutkan"
    : loading
      ? "Memuat data jadwal kelas..."
      : "Belum ada data jadwal.";

  return (
    <div className="flex flex-col">
      {error && isPeriodeSelected && (
        <div className="mb-4 rounded-2 border border-red-100 bg-neutral-300 p-4 text-b3 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua kelas"
          options={kelasOptions}
          selectedId={entityId}
          onSelectChange={(val) => setEntityId(val || undefined)}
          onExportExcel={handleExport}
          isExportDisabled={
            !isPeriodeSelected || loading || safeData.length === 0
          }
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <JadwalMatrixTable<KelasRingkas>
          data={safeData}
          labelKolomInfo="Nama Kelas"
          renderInfo={renderKelasInfo}
          loading={isPeriodeSelected && loading}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
}

export default JadwalKelasView;