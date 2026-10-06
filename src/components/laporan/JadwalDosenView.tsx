import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";
import { getJadwalDosen } from "../../services/laporan/jadwalDosenService";

import type {
  BarisLaporanJadwal,
  DosenRingkas,
  Hari,
} from "../../types/laporan";

import type {
  HeatmapRow,
  Jadwal as HeatmapJadwal,
  Sesi,
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
 * Ubah data jadwal laporan ke HeatmapRow untuk Admin dengan membaca barisSesi.perHari
 */
function buildDosenHeatmapRows(
  laporanData: BarisLaporanJadwal<DosenRingkas>[] = [],
  selectedDosenId?: string,
): HeatmapRow[] {
  if (!Array.isArray(laporanData)) return [];

  const filtered = selectedDosenId
    ? laporanData.filter(
        (item) => item?.info && String(item.info.id) === selectedDosenId,
      )
    : laporanData;

  return filtered
    .filter((row) => row && row.info)
    .map((row) => {
      const slots: Record<string, number> = {};
      const slotJadwal: Record<string, HeatmapJadwal[]> = {};

      for (const hari of HARI_LIST) {
        for (const sesi of SESI_LIST) {
          const key = slotKey(hari, sesi);
          slots[key] = 0;
          slotJadwal[key] = [];
        }
      }

      const barisSesiList = Array.isArray(row.jadwalPerSesi)
        ? row.jadwalPerSesi
        : [];

      for (const barisSesi of barisSesiList) {
        if (!barisSesi || !barisSesi.perHari) continue;
        const sesiNum = barisSesi.sesi;

        for (const hari of HARI_LIST) {
          const hariTyped = hari as Hari;
          const selList = barisSesi.perHari[hariTyped] || [];

          for (const sel of selList) {
            if (!sel) continue;
            const startSesi = sel.sesiAwal || sesiNum;
            const endSesi = sel.sesiAkhir || sesiNum;

            const ketParts = (sel.keterangan || "").split(" - ");
            const kelasNama = ketParts[0] || "";
            const ruangNama = ketParts[1] || "";

            for (let s = startSesi; s <= endSesi; s++) {
              const key = slotKey(hari, s as Sesi);
              if (key in slots) {
                slots[key] = (slots[key] || 0) + 1;
                slotJadwal[key].push({
                  id: `${sel.entryId}-${s}`,
                  prodi: "TRPL" as HeatmapJadwal["prodi"],
                  kodeMK: "",
                  namaMataKuliah: sel.matkulNama || "",
                  dosen: row.info.nama || "",
                  kelas: kelasNama,
                  hari: hari as Hari,
                  sesi: s as Sesi,
                  ruang: ruangNama,
                  sks: endSesi - startSesi + 1,
                });
              }
            }
          }
        }
      }

      return {
        id: String(row.info.id ?? ""),
        label: row.info.nama || "-",
        sublabel: `Beban Dosen ${row.info.bebanSks ?? 0} SKS`,
        slots,
        slotJadwal,
        adaBentrok: Object.values(slots).some((jumlah) => jumlah > 1),
      };
    });
}

export function JadwalDosenView() {
  const context = useOutletContext<LaporanOutletContext>();
  const periodeId = context?.periodeId;

  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Cek apakah periode belum dipilih
  const belumPilihPeriode = !periodeId || String(periodeId).trim() === "";
  const periodeUntukFetch = belumPilihPeriode ? "__NO_PERIODE__" : String(periodeId);

  // Panggil service getJadwalDosen langsung tanpa wrapper
  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan<
    BarisLaporanJadwal<DosenRingkas>
  >({
    service: getJadwalDosen,
    periodeAkademikId: periodeUntukFetch,
  });

  // Kosongkan data secara eksplisit jika belum pilih periode
  const safeData = useMemo(() => {
    if (belumPilihPeriode) return [];
    return Array.isArray(data) ? data : [];
  }, [data, belumPilihPeriode]);

  const dosenOptions = useMemo(() => {
    if (belumPilihPeriode) return [];
    return safeData
      .filter((item) => item && item.info)
      .map((item) => ({
        id: String(item.info.id),
        label: item.info.nama || "-",
      }));
  }, [safeData, belumPilihPeriode]);

  const adminHeatmapRows = useMemo(() => {
    if (belumPilihPeriode) return [];
    return buildDosenHeatmapRows(safeData, entityId);
  }, [safeData, entityId, belumPilihPeriode]);

  const handleExport = () => {
    if (!isAdmin || belumPilihPeriode || safeData.length === 0) return;
    exportMatrixToExcel(safeData, `Laporan_Jadwal_Dosen_${periodeId}`);
  };

  const renderDosenInfo = (dosen?: DosenRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {dosen?.nama ?? "-"}
      </div>
      <div className="mt-1 text-xs leading-tight text-neutral-1000">
        Beban Dosen: {dosen?.bebanSks ?? 0} SKS
      </div>
    </div>
  );

  // Pesan saat kondisi kosong / memuat data
  const emptyMessage = belumPilihPeriode
    ? "Pilih periode akademik untuk melanjutkan"
    : loading
      ? "Memuat data jadwal dosen..."
      : "Belum ada data jadwal.";

  return (
    <div className="flex flex-col">
      {error && !belumPilihPeriode && (
        <div className="mb-4 rounded-2 border border-red-100 bg-neutral-300 p-4 text-b3 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua dosen"
          options={dosenOptions}
          selectedId={entityId}
          onSelectChange={(val) => setEntityId(val || undefined)}
          onExportExcel={handleExport}
          isExportDisabled={
            !isAdmin || belumPilihPeriode || loading || safeData.length === 0
          }
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        {isAdmin ? (
          <HeatmapGrid
            rows={adminHeatmapRows}
            searchPlaceholder="Cari nama dosen"
            emptyMessage={emptyMessage}
            maxHeight="max-h-[520px]"
          />
        ) : (
          <JadwalMatrixTable<DosenRingkas>
            data={safeData}
            labelKolomInfo="Nama Dosen"
            renderInfo={renderDosenInfo}
            loading={!belumPilihPeriode && loading}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}

export default JadwalDosenView;