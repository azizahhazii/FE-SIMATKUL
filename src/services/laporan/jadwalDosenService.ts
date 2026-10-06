import { apiRequest } from "../../lib/axios";
import type {
  BarisLaporanJadwal,
  BarisSesiJadwal,
  DosenRingkas,
  Hari,
  SelJadwal,
} from "../../types/laporan";
import type { Jadwal } from "../../types/penjadwalan";

export interface BackendJadwalItem {
  hari: string;
  sesi: number[];
  nama_matkul: string;
  kode_kelas: string;
  nama_ruang: string;
}

export interface BackendDosenJadwal {
  id: number;
  nama: string;
  beban_sks: number;
  jadwal: BackendJadwalItem[];
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

/**
 * Fetch data mentah dari endpoint Backend
 * GET /api/penjadwalan/dosen/:kurikulumId
 */
export async function getJadwalDosenApi(
  kurikulumId: string | number,
): Promise<BackendDosenJadwal[]> {
  try {
    if (!kurikulumId || kurikulumId === "__NO_PERIODE__") return [];
    const response = await apiRequest<ApiResponse<BackendDosenJadwal[]>>(
      `/api/penjadwalan/dosen/${kurikulumId}`,
      { method: "GET" },
    );

    return Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.warn("Gagal mengambil data dari API dosen:", error);
    return [];
  }
}

/**
 * Mapper: Mengubah BackendDosenJadwal[] menjadi BarisLaporanJadwal<DosenRingkas>[]
 * Mengelompokkan berdasarkan nama dosen agar tidak terjadi duplikasi baris
 */
export function mapBackendDosenToBarisLaporan(
  dosenList: BackendDosenJadwal[] = [],
): BarisLaporanJadwal<DosenRingkas>[] {
  if (!Array.isArray(dosenList)) return [];

  const DAFTAR_HARI: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const SESI_LIST = [1, 2, 3, 4, 5];

  const normalizeHari = (h: string): Hari | null => {
    if (!h) return null;
    const lower = String(h).toLowerCase().trim();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    if (DAFTAR_HARI.includes(capitalized as Hari)) {
      return capitalized as Hari;
    }
    return null;
  };

  // Grouping berdasarkan nama/identitas dosen
  const mapDosen = new Map<string, BackendDosenJadwal>();

  for (const item of dosenList) {
    if (!item) continue;

    const namaDosen =
      (item as any).nama_dosen ||
      (item as any).nama_lengkap ||
      item.nama ||
      "";

    const key = String(namaDosen || item.id || "unknown")
      .trim()
      .toLowerCase();

    if (!mapDosen.has(key)) {
      mapDosen.set(key, {
        id: item.id,
        nama: namaDosen || item.nama || "-",
        beban_sks: Number(item.beban_sks ?? 0),
        jadwal: Array.isArray(item.jadwal) ? [...item.jadwal] : [],
      });
    } else {
      const existing = mapDosen.get(key)!;
      existing.beban_sks += Number(item.beban_sks ?? 0);
      if (Array.isArray(item.jadwal)) {
        existing.jadwal.push(...item.jadwal);
      }
    }
  }

  return Array.from(mapDosen.values()).map((dosen) => {
    const info: DosenRingkas = {
      id: String(dosen?.id ?? dosen?.nama ?? ""),
      nama: dosen?.nama || "-",
      bebanSks: Number(dosen?.beban_sks ?? 0),
    };

    const barisSesiList: BarisSesiJadwal[] = SESI_LIST.map((sesi) => ({
      sesi,
      perHari: {
        Senin: [],
        Selasa: [],
        Rabu: [],
        Kamis: [],
        Jumat: [],
      },
    }));

    const items = Array.isArray(dosen?.jadwal) ? dosen.jadwal : [];

    for (const item of items) {
      if (!item) continue;
      const hari = normalizeHari(item.hari);
      if (!hari) continue;

      let sesiNums: number[] = [];
      if (Array.isArray(item.sesi)) {
        sesiNums = item.sesi
          .map((s) => Number(s))
          .filter((s) => !isNaN(s) && s >= 1 && s <= 5);
      } else if (item.sesi !== undefined && item.sesi !== null) {
        const s = Number(item.sesi);
        if (!isNaN(s) && s >= 1 && s <= 5) sesiNums = [s];
      }

      if (sesiNums.length === 0) continue;

      const sesiAwal = Math.min(...sesiNums);
      const sesiAkhir = Math.max(...sesiNums);

      const sel: SelJadwal = {
        entryId: `${dosen?.id ?? ""}-${item.nama_matkul || ""}-${hari}-${sesiAwal}`,
        matkulNama: item.nama_matkul || "-",
        keterangan: `${item.kode_kelas || "-"} - ${item.nama_ruang || "-"}`,
        sesiAwal,
        sesiAkhir,
      };

      if (sesiAwal >= 1 && sesiAwal <= 5) {
        const barisTarget = barisSesiList[sesiAwal - 1];
        if (barisTarget && barisTarget.perHari && barisTarget.perHari[hari]) {
          const isDuplicateCell = barisTarget.perHari[hari]!.some(
            (s) =>
              s.matkulNama === sel.matkulNama &&
              s.keterangan === sel.keterangan &&
              s.sesiAwal === sel.sesiAwal,
          );

          if (!isDuplicateCell) {
            barisTarget.perHari[hari]!.push(sel);
          }
        }
      }
    }

    return {
      info,
      jadwalPerSesi: barisSesiList,
    };
  });
}

/**
 * Service utama yang dipanggil oleh useJadwalLaporan
 */
export async function getJadwalDosen(
  kurikulumId: string | number,
  dosenId?: string,
): Promise<BarisLaporanJadwal<DosenRingkas>[]> {
  try {
    const rawData = await getJadwalDosenApi(kurikulumId);
    const mappedData = mapBackendDosenToBarisLaporan(rawData);

    if (dosenId) {
      return mappedData.filter((item) => item?.info?.id === dosenId);
    }

    return mappedData;
  } catch (error) {
    console.warn("Gagal mengambil data jadwal dosen dari BE:", error);
    return [];
  }
}

/**
 * Mapper opsional ke Jadwal[]
 */
export function mapBackendDosenToJadwal(
  dosenList: BackendDosenJadwal[] = [],
): Jadwal[] {
  const result: Jadwal[] = [];

  if (!Array.isArray(dosenList)) return result;

  for (const dosen of dosenList) {
    if (!dosen) continue;
    const jadwalItems = Array.isArray(dosen.jadwal) ? dosen.jadwal : [];

    for (const item of jadwalItems) {
      if (!item) continue;
      const sesiList = Array.isArray(item.sesi)
        ? item.sesi
        : item.sesi !== undefined && item.sesi !== null
          ? [item.sesi]
          : [];

      for (const s of sesiList) {
        if (s === undefined || s === null) continue;
        result.push({
          id: `${dosen.id}-${item.nama_matkul}-${item.hari}-${s}`,
          dosen: dosen.nama || "-",
          ruang: item.nama_ruang || "-",
          kelas: item.kode_kelas || "-",
          matkul: item.nama_matkul || "-",
          hari: item.hari || "Senin",
          sesi: Number(s),
          sks: 1,
        } as unknown as Jadwal);
      }
    }
  }

  return result;
}

/**
 * Export Excel via Endpoint Backend dengan penanganan error dan validasi Blob/JSON
 */
export async function exportJadwalDosenExcelApi(
  kurikulumId: string | number,
): Promise<void> {
  if (!kurikulumId || kurikulumId === "__NO_PERIODE__") {
    alert("Pilih periode akademik terlebih dahulu!");
    return;
  }

  try {
    const response: any = await apiRequest(
      `/api/penjadwalan/export-excel/dosen/${kurikulumId}`,
      {
        method: "GET",
        responseType: "blob",
      } as any,
    );

    const rawBlob: Blob =
      response?.data instanceof Blob
        ? response.data
        : response instanceof Blob
          ? response
          : new Blob([response]);

    const textContent = await rawBlob.text();

    if (
      textContent.trim().startsWith("{") ||
      textContent.trim().startsWith("<")
    ) {
      try {
        const json = JSON.parse(textContent);
        alert(
          "Gagal dari Backend: " +
            (json.message || json.error || "Terjadi kesalahan di server"),
        );
      } catch {
        alert(
          "Gagal mengunduh Excel: Server backend mengalami error saat generate data.",
        );
      }
      return;
    }

    const blob = new Blob([rawBlob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_Jadwal_Dosen_${kurikulumId}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Gagal export excel dosen:", error);

    if (error?.response?.data instanceof Blob) {
      const errorText = await error.response.data.text();
      try {
        const errorJson = JSON.parse(errorText);
        alert(
          "Gagal dari Backend: " +
            (errorJson.message || errorJson.error || errorText),
        );
      } catch {
        alert("Gagal dari Backend: " + errorText);
      }
    } else {
      alert(
        "Gagal mengunduh Excel: " +
          (error?.response?.data?.message ||
            error?.message ||
            "Terjadi kesalahan server"),
      );
    }
  }
}

export const exportJadwalDosenExcel = exportJadwalDosenExcelApi;

export default getJadwalDosen;