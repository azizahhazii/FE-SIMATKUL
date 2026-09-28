import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import {
  mockDosenList,
  mockJadwalEntries,
  PERIODE_AKADEMIK_DEFAULT_ID,
} from "../../data/laporan";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";

import { getJadwalDosen } from "../../services/laporan/jadwalDosenService";

import type { DosenRingkas } from "../../types/laporan";

import type {
  HeatmapRow,
  Jadwal as HeatmapJadwal,
} from "../../types/penjadwalan";

import { HARI_LIST, SESI_LIST } from "../../types/penjadwalan";

import { slotKey } from "../../utils/penjadwalan";

import { exportMatrixToExcel } from "../../utils/exportExcel";

import { JadwalMatrixTable } from "./JadwalMatrixTable";

import { LaporanToolbar } from "./LaporanToolbar";

import { HeatmapGrid } from "../penjadwalan/HeatmapGrid";

import { useAuth } from "../../context/AuthContext";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

/**
 * Ubah data jadwal laporan ke format yang dibutuhkan HeatmapGrid.
 *
 * HeatmapGrid menggunakan satu slot = satu sesi.
 * Karena JadwalEntry bisa memiliki sesiAwal sampai sesiAkhir,
 * satu entry akan diperluas ke setiap sesi yang dipakainya.
 */
function buildDosenHeatmapRows(selectedDosenId?: string): HeatmapRow[] {
  const daftarDosen = selectedDosenId
    ? mockDosenList.filter((dosen) => dosen.id === selectedDosenId)
    : mockDosenList;

  return daftarDosen.map((dosen) => {
    const entriesDosen = mockJadwalEntries.filter(
      (entry) => entry.dosenId === dosen.id,
    );

    const slots: Record<string, number> = {};
    const slotJadwal: Record<string, HeatmapJadwal[]> = {};

    // Buat seluruh slot Senin-Jumat x Sesi 1-5.
    for (const hari of HARI_LIST) {
      for (const sesi of SESI_LIST) {
        const key = slotKey(hari, sesi);

        slots[key] = 0;
        slotJadwal[key] = [];
      }
    }

    // Masukkan setiap jadwal ke slot masing-masing.
    for (const entry of entriesDosen) {
      for (let sesi = entry.sesiAwal; sesi <= entry.sesiAkhir; sesi += 1) {
        const key = slotKey(entry.hari, sesi);

        const jadwal: HeatmapJadwal = {
          id: `${entry.id}-${sesi}`,
          prodi: "TRPL",
          kodeMK: entry.matkulId,
          namaMataKuliah: entry.matkulNama,
          dosen: entry.dosenNama,
          kelas: entry.kelasNama,
          hari: entry.hari,
          sesi: sesi as HeatmapJadwal["sesi"],
          ruang: entry.ruangNama,
          sks: 0,
        };

        slots[key] += 1;
        slotJadwal[key].push(jadwal);
      }
    }

    return {
      id: dosen.id,
      label: dosen.nama,
      sublabel: `Beban Dosen ${dosen.bebanSks} SKS`,
      slots,
      slotJadwal,
      adaBentrok: Object.values(slots).some((jumlah) => jumlah > 1),
    };
  });
}

export function JadwalDosenView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

  /**
   * Belum pilih periode:
   * gunakan ID dummy yang tidak mungkin cocok,
   * supaya service mengembalikan data kosong.
   *
   * Sudah pilih periode:
   * gunakan periode dummy yang memang dipakai
   * oleh data laporan saat ini.
   */
  const periodeUntukFetch = periodeId
    ? PERIODE_AKADEMIK_DEFAULT_ID
    : "__NO_PERIODE__";

  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan({
    service: getJadwalDosen,
    periodeAkademikId: periodeUntukFetch,
  });

  const dosenOptions = mockDosenList.map((dosen) => ({
    id: dosen.id,
    label: dosen.nama,
  }));

  /**
   * Data heatmap khusus Admin.
   *
   * Guest tidak memakai data ini.
   */
  const adminHeatmapRows = useMemo(
    () => buildDosenHeatmapRows(entityId),
    [entityId],
  );

  const handleExport = () => {
    if (!isAdmin) return;
    if (!periodeId) return;
    if (data.length === 0) return;

    exportMatrixToExcel(
      data,
      `Laporan_Jadwal_Dosen_${PERIODE_AKADEMIK_DEFAULT_ID}`,
    );
  };

  const renderDosenInfo = (dosen: DosenRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {dosen.nama}
      </div>

      <div className="mt-1 text-xs leading-tight text-neutral-1000">
        Beban Dosen: {dosen.bebanSks} SKS
      </div>
    </div>
  );

  const belumPilihPeriode = periodeId === "";

  return (
    <div className="flex flex-col">
      {/* ================= ERROR ================= */}
      {error && !belumPilihPeriode && (
        <div className="mb-4 rounded-2 border border-red-100 bg-neutral-300 p-4 text-b3 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        {/* ================= TOOLBAR ================= */}
        <LaporanToolbar
          defaultOptionLabel="Semua dosen"
          options={dosenOptions}
          selectedId={entityId}
          onSelectChange={setEntityId}
          onExportExcel={handleExport}
          isExportDisabled={
            !isAdmin || belumPilihPeriode || loading || data.length === 0
          }
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        {/* =====================================================
            ADMIN
            Desain baru:
            Heatmap seperti Preview Penjadwalan
        ===================================================== */}
        {isAdmin ? (
          <HeatmapGrid
            rows={belumPilihPeriode ? [] : adminHeatmapRows}
            searchPlaceholder="Cari nama dosen"
            emptyMessage={
              belumPilihPeriode
                ? "Pilih periode akademik untuk melanjutkan"
                : "Belum ada data jadwal."
            }
            maxHeight="max-h-[520px]"
          />
        ) : (
          /* ===================================================
             GUEST
             Desain lama:
             Matrix table seperti PDF Guest
          =================================================== */
          <JadwalMatrixTable<DosenRingkas>
            data={belumPilihPeriode ? [] : data}
            labelKolomInfo="Nama Dosen"
            renderInfo={renderDosenInfo}
            loading={!belumPilihPeriode && loading}
            emptyMessage={
              belumPilihPeriode
                ? "Pilih periode akademik untuk melanjutkan"
                : "Belum ada data jadwal untuk filter ini."
            }
          />
        )}
      </div>
    </div>
  );
}

export default JadwalDosenView;
