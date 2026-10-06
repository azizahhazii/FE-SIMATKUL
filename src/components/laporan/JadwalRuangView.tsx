import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";
import {
  getJadwalRuang,
  type BackendRuangJadwal,
} from "../../services/laporan/jadwalRuangService";

import type {
  BarisLaporanJadwal,
  Hari,
  RuangRingkas,
  SelJadwal,
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

const HARI_KERJA: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

/**
 * Mapper: Mengubah data BackendRuangJadwal[] dari API service
 * menjadi format BarisLaporanJadwal<RuangRingkas>[]
 */
function mapBackendRuangToLaporan(
  ruangList: BackendRuangJadwal[] = [],
): BarisLaporanJadwal<RuangRingkas>[] {
  if (!Array.isArray(ruangList)) return [];

  const capitalizeHari = (h: string): Hari => {
    if (!h) return "Senin";
    const lower = String(h).toLowerCase();
    const cap = (lower.charAt(0).toUpperCase() + lower.slice(1)) as Hari;
    return HARI_KERJA.includes(cap) ? cap : "Senin";
  };

  return ruangList.map((ruang) => {
    const namaRuang =
      ruang.nama_ruang || (ruang as any).nama || `Ruang ${ruang.id}`;

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

    const jadwalItems = Array.isArray(ruang.jadwal) ? ruang.jadwal : [];

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

      const ketParts = [item.nama_dosen, item.kode_kelas].filter(Boolean);
      const keterangan = ketParts.join(" - ");

      const cellData: SelJadwal = {
        entryId: `${ruang.id}-${item.nama_matkul}-${hari}-${sesiAwal}`,
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

    const rawOkupansi = (ruang as any).okupansi ?? ruang.kapasitas ?? 0;
    const cleanOkupansi =
      typeof rawOkupansi === "number"
        ? rawOkupansi
        : Number(String(rawOkupansi).replace(/%/g, "")) || 0;

    return {
      info: {
        id: String(ruang.id ?? namaRuang),
        nama: namaRuang,
        okupansi: cleanOkupansi,
      } as RuangRingkas,
      jadwalPerSesi,
    };
  });
}

/**
 * Service adapter khusus untuk Laporan Ruang
 * Didefinisikan di LUAR komponen agar referensinya tidak berubah saat re-render
 */
export async function getJadwalRuangLaporan(
  periodeId: string | number,
): Promise<BarisLaporanJadwal<RuangRingkas>[]> {
  if (!periodeId || periodeId === "__NO_PERIODE__") return [];
  const rawData = await getJadwalRuang(periodeId);
  return mapBackendRuangToLaporan(rawData);
}

/**
 * Ubah data jadwal laporan ke HeatmapRow untuk Admin
 */
function buildRuangHeatmapRows(
  laporanData: BarisLaporanJadwal<RuangRingkas>[] = [],
  selectedRuangId?: string,
): HeatmapRow[] {
  if (!Array.isArray(laporanData)) return [];

  const filtered = selectedRuangId
    ? laporanData.filter(
        (item) => item?.info && String(item.info.id) === selectedRuangId,
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
            const dosenNama = ketParts[0] || "";
            const kelasNama = ketParts[1] || "";

            for (let s = startSesi; s <= endSesi; s++) {
              const key = slotKey(hari, s as Sesi);
              if (key in slots) {
                slots[key] = (slots[key] || 0) + 1;
                slotJadwal[key].push({
                  id: `${sel.entryId}-${s}`,
                  prodi: "TRPL" as HeatmapJadwal["prodi"],
                  kodeMK: "",
                  namaMataKuliah: sel.matkulNama || "",
                  dosen: dosenNama,
                  kelas: kelasNama,
                  hari: hari as Hari,
                  sesi: s as Sesi,
                  ruang: row.info.nama || "",
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
        sublabel: `Okupansi: ${row.info.okupansi ?? 0}%`,
        slots,
        slotJadwal,
        adaBentrok: Object.values(slots).some((jumlah) => jumlah > 1),
      };
    });
}

export function JadwalRuangView() {
  const context = useOutletContext<LaporanOutletContext>();
  const periodeId = context?.periodeId;

  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Cek apakah periode belum dipilih
  const belumPilihPeriode = !periodeId || String(periodeId).trim() === "";
  const periodeUntukFetch = belumPilihPeriode
    ? "__NO_PERIODE__"
    : String(periodeId);

  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan<
    BarisLaporanJadwal<RuangRingkas>
  >({
    service: getJadwalRuangLaporan,
    periodeAkademikId: periodeUntukFetch,
  });

  // Kosongkan data secara eksplisit jika belum pilih periode
  const safeData = useMemo(() => {
    if (belumPilihPeriode) return [];
    return Array.isArray(data) ? data : [];
  }, [data, belumPilihPeriode]);

  const ruangOptions = useMemo(() => {
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
    return buildRuangHeatmapRows(safeData, entityId);
  }, [safeData, entityId, belumPilihPeriode]);

  const handleExport = () => {
    if (!isAdmin || belumPilihPeriode || safeData.length === 0) return;
    exportMatrixToExcel(safeData, `Laporan_Jadwal_Ruang_${periodeId}`);
  };

  const renderRuangInfo = (ruang?: RuangRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {ruang?.nama ?? "-"}
      </div>
      <div className="mt-1 text-xs leading-tight text-neutral-1000">
        Okupansi: {ruang?.okupansi ?? 0}%
      </div>
    </div>
  );

  // Pesan saat kondisi kosong / memuat data
  const emptyMessage = belumPilihPeriode
    ? "Pilih periode akademik untuk melanjutkan"
    : loading
      ? "Memuat data jadwal ruang..."
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
          defaultOptionLabel="Semua ruang"
          options={ruangOptions}
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
            searchPlaceholder="Cari nama ruang"
            emptyMessage={emptyMessage}
            maxHeight="max-h-[520px]"
          />
        ) : (
          <JadwalMatrixTable<RuangRingkas>
            data={safeData}
            labelKolomInfo="Nama Ruang"
            renderInfo={renderRuangInfo}
            loading={!belumPilihPeriode && loading}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}

export default JadwalRuangView;