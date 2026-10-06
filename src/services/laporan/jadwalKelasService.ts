import { apiRequest } from "../../lib/axios";
import type { Jadwal } from "../../types/penjadwalan";

export interface BackendKelasJadwalItem {
  hari: string;
  sesi: number[];
  nama_matkul: string;
  nama_dosen: string;
  nama_ruang: string;
}

export interface BackendKelasJadwal {
  id: number;
  kode_kelas: string;
  jadwal: BackendKelasJadwalItem[];
}

export interface ApiResponse<T> {
  message?: string;
  data: T;
}

/**
 * Fetch data Jadwal Kelas dari Endpoint BE
 * GET /api/penjadwalan/kelas/:kurikulumId
 */
export async function getJadwalKelasApi(
  kurikulumId: string | number,
): Promise<BackendKelasJadwal[]> {
  try {
    const response = await apiRequest<ApiResponse<BackendKelasJadwal[]>>(
      `/api/penjadwalan/kelas/${kurikulumId}`,
      { method: "GET" },
    );

    if (Array.isArray(response?.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.warn("Gagal mengambil data jadwal kelas dari BE:", error);
    return [];
  }
}

export async function getJadwalKelas(
  kurikulumId: string | number,
): Promise<BackendKelasJadwal[]> {
  return getJadwalKelasApi(kurikulumId);
}

/**
 * Mapper: Mengubah format BE ke format Jadwal UI
 */
export function mapBackendKelasToJadwal(
  kelasList: BackendKelasJadwal[] = [],
): Jadwal[] {
  const result: Jadwal[] = [];

  if (!Array.isArray(kelasList)) return result;

  const capitalizeHari = (h: string) => {
    if (!h) return "Senin";
    const lower = String(h).toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  for (const kelas of kelasList) {
    if (!kelas) continue;
    const kodeKelas =
      kelas.kode_kelas || (kelas as any).nama || (kelas as any).kelas || "";
    const jadwalItems = Array.isArray(kelas.jadwal) ? kelas.jadwal : [];

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
          id: `${kelas.id ?? Math.random()}-${item.nama_matkul ?? ""}-${item.hari ?? ""}-${s}`,
          kelas: kodeKelas,
          dosen: item.nama_dosen ?? "",
          ruang: item.nama_ruang ?? "",
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
 * Export Excel Kelas
 */
export async function exportJadwalKelasExcel(
  kurikulumId: string | number,
): Promise<void> {
  const token = localStorage.getItem("token") || "";

  const response = await fetch(
    `/api/penjadwalan/export-excel/kelas/${kurikulumId}`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Gagal mengunduh file Excel Jadwal Kelas");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Laporan_Jadwal_Kelas_${kurikulumId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}