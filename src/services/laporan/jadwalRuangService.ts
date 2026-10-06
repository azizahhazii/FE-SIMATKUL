import { apiRequest } from "../../lib/axios";
import type { Jadwal } from "../../types/penjadwalan";

export interface BackendRuangJadwalItem {
  hari: string;
  sesi: number[];
  nama_matkul: string;
  kode_kelas: string;
  nama_dosen: string;
}

export interface BackendRuangJadwal {
  id: number;
  nama_ruang: string;
  kapasitas?: number;
  jadwal: BackendRuangJadwalItem[];
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

/**
 * Helper: Mengelompokkan data ruang berdasarkan nama ruang agar tidak terduplikasi
 */
function groupBackendRuangList(list: BackendRuangJadwal[]): BackendRuangJadwal[] {
  if (!Array.isArray(list)) return [];
  const map = new Map<string, BackendRuangJadwal>();

  for (const item of list) {
    if (!item) continue;
    const namaRuang =
      item.nama_ruang || (item as any).nama || (item as any).ruang || "";
    const key = String(namaRuang || item.id || "").trim().toLowerCase();

    if (!map.has(key)) {
      map.set(key, {
        ...item,
        nama_ruang: namaRuang || item.nama_ruang || "-",
        jadwal: Array.isArray(item.jadwal) ? [...item.jadwal] : [],
      });
    } else {
      const existing = map.get(key)!;
      if (Array.isArray(item.jadwal)) {
        existing.jadwal.push(...item.jadwal);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Fetch data Jadwal Ruang dari Endpoint BE
 * GET /api/penjadwalan/ruang/:kurikulumId
 */
export async function getJadwalRuangApi(
  kurikulumId: string | number,
): Promise<BackendRuangJadwal[]> {
  try {
    const response = await apiRequest<ApiResponse<BackendRuangJadwal[]>>(
      `/api/penjadwalan/ruang/${kurikulumId}`,
      { method: "GET" },
    );

    if (Array.isArray(response?.data)) {
      return groupBackendRuangList(response.data);
    }
    return [];
  } catch (error) {
    console.warn("Gagal mengambil data jadwal ruang dari BE:", error);
    return [];
  }
}

export async function getJadwalRuang(
  kurikulumId: string | number,
): Promise<BackendRuangJadwal[]> {
  return getJadwalRuangApi(kurikulumId);
}

/**
 * Mapper: Mengubah format BE ke format Jadwal UI
 */
export function mapBackendRuangToJadwal(
  ruangList: BackendRuangJadwal[] = [],
): Jadwal[] {
  const result: Jadwal[] = [];

  if (!Array.isArray(ruangList)) return result;

  const groupedList = groupBackendRuangList(ruangList);

  const capitalizeHari = (h: string) => {
    if (!h) return "Senin";
    const lower = String(h).toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  for (const ruang of groupedList) {
    if (!ruang) continue;
    const namaRuang =
      ruang.nama_ruang || (ruang as any).nama || (ruang as any).ruang || "";
    const jadwalItems = Array.isArray(ruang.jadwal) ? ruang.jadwal : [];

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
          id: `${ruang.id ?? Math.random()}-${item.nama_matkul ?? ""}-${item.hari ?? ""}-${s}`,
          ruang: namaRuang,
          dosen: item.nama_dosen ?? "",
          kelas: item.kode_kelas ?? "",
          matkul: item.nama_matkul ?? "",
          hari: capitalizeHari(item.hari),
          sesi: Number(s),
          sks: 1,
        } as unknown as Jadwal);
      }
    }
  }

  return result;
}

/**
 * Export Excel Ruang
 */
export async function exportJadwalRuangExcel(
  kurikulumId: string | number,
): Promise<void> {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    `/api/penjadwalan/export-excel/ruang/${kurikulumId}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Gagal mengunduh file Excel Jadwal Ruang");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Laporan_Jadwal_Ruang_${kurikulumId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}