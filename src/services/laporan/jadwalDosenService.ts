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
 * Mapper ke BarisLaporanJadwal
 */
export function mapBackendDosenToBarisLaporan(
  dosenList: BackendDosenJadwal[] = [],
): BarisLaporanJadwal<DosenRingkas>[] {
  if (!Array.isArray(dosenList)) return [];

  const DAFTAR_HARI: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const normalizeHari = (h: string): Hari | null => {
    if (!h) return null;
    const lower = String(h).toLowerCase().trim();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    if (DAFTAR_HARI.includes(capitalized as Hari)) {
      return capitalized as Hari;
    }
    return null;
  };

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

    const barisSesiList: BarisSesiJadwal[] = [1, 2, 3, 4, 5].map((sesi) => ({
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
        if (barisTarget?.perHari?.[hari]) {
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
 * Service utama
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
 * Mapper khusus ke Jadwal[] untuk HeatmapGrid
 */
export function mapBackendDosenToJadwal(
  dosenList: BackendDosenJadwal[] = [],
): Jadwal[] {
  const result: Jadwal[] = [];

  if (!Array.isArray(dosenList)) return result;

  const DAFTAR_HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const normalizeHari = (h: string): string => {
    if (!h) return "Senin";
    const lower = String(h).toLowerCase().trim();
    const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
    return DAFTAR_HARI.includes(capitalized) ? capitalized : "Senin";
  };

  for (const dosen of dosenList) {
    if (!dosen) continue;

    const namaDosen =
      (dosen as any).nama_dosen ||
      (dosen as any).nama_lengkap ||
      dosen.nama ||
      "-";

    const jadwalItems = Array.isArray(dosen.jadwal) ? dosen.jadwal : [];

    let totalSlotTerisi = 0;
    for (const item of jadwalItems) {
      if (!item) continue;
      if (Array.isArray(item.sesi)) {
        totalSlotTerisi += item.sesi.length;
      } else if (item.sesi !== undefined && item.sesi !== null) {
        totalSlotTerisi += 1;
      }
    }

    const totalBebanDosen = Number(dosen.beban_sks ?? 0);

    for (const item of jadwalItems) {
      if (!item) continue;
      const sesiList = Array.isArray(item.sesi)
        ? item.sesi
        : item.sesi !== undefined && item.sesi !== null
          ? [item.sesi]
          : [];

      const itemSks = Number((item as any).sks || (item as any).sks_matkul || 0);

      let sksPerSlot = 1;
      if (itemSks > 0) {
        sksPerSlot = sesiList.length > 0 ? itemSks / sesiList.length : itemSks;
      } else if (totalBebanDosen > 0 && totalSlotTerisi > 0) {
        sksPerSlot = totalBebanDosen / totalSlotTerisi;
      }

      for (const s of sesiList) {
        if (s === undefined || s === null) continue;

        result.push({
          id: `${dosen.id}-${item.nama_matkul}-${item.hari}-${s}`,
          dosen: namaDosen,
          ruang: item.nama_ruang || "-",
          kelas: item.kode_kelas || "-",
          matkul: item.nama_matkul || "-",
          namaMataKuliah: item.nama_matkul || "-",
          hari: normalizeHari(item.hari),
          sesi: Number(s),
          sks: sksPerSlot,
        } as unknown as Jadwal);
      }
    }
  }

  return result;
}

/**
 * Export Excel Murni dari Endpoint Backend
 */
export async function exportJadwalDosenExcelApi(
  kurikulumId: string | number,
): Promise<void> {
  if (!kurikulumId || kurikulumId === "__NO_PERIODE__") {
    alert("Pilih periode akademik terlebih dahulu!");
    return;
  }

  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    const rawBaseURL =
      import.meta.env.VITE_API_BASE_URL || "https://simatkul-be.vercel.app";

    const cleanBaseURL = rawBaseURL.replace(/\/+$/, "");

    const targetUrl = `${cleanBaseURL}/api/penjadwalan/export-excel/dosen/${encodeURIComponent(
      String(kurikulumId),
    )}`;

    console.log("[EXPORT EXCEL] URL:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("[EXPORT EXCEL] Status:", response.status);
    console.log(
      "[EXPORT EXCEL] Content-Type:",
      response.headers.get("content-type"),
    );

    if (!response.ok) {
      const errText = await response.text();
      let message = `Server Error (${response.status})`;

      try {
        const json = JSON.parse(errText);
        message = json?.message || json?.error || message;
      } catch {
        if (errText) {
          message += `: ${errText.slice(0, 300)}`;
        }
      }

      throw new Error(message);
    }

    const arrayBuffer = await response.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("Server mengirim file Excel kosong.");
    }

    const bytes = new Uint8Array(arrayBuffer);

    const isZip =
      bytes.length >= 4 &&
      bytes[0] === 0x50 &&
      bytes[1] === 0x4b &&
      (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
      (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08);

    if (!isZip) {
      const previewBytes = bytes.slice(0, Math.min(bytes.length, 1000));
      const decoder = new TextDecoder("utf-8");
      const preview = decoder.decode(previewBytes).replace(/\s+/g, " ").trim();

      console.error("[EXPORT EXCEL] Response bukan XLSX:", {
        contentType: response.headers.get("content-type"),
        size: arrayBuffer.byteLength,
        preview,
      });

      throw new Error("Server tidak mengirim file Excel XLSX yang valid.");
    }

    let fileName = `Laporan_Jadwal_Dosen_${kurikulumId}.xlsx`;
    const contentDisposition = response.headers.get("content-disposition");

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/i,
      );
      const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

      if (utf8Match?.[1]) {
        try {
          fileName = decodeURIComponent(utf8Match[1]);
        } catch {
          fileName = utf8Match[1];
        }
      } else if (normalMatch?.[1]) {
        fileName = normalMatch[1];
      }

      if (!fileName.toLowerCase().endsWith(".xlsx")) {
        fileName += ".xlsx";
      }
    }

    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    console.log("[EXPORT EXCEL] Berhasil:", {
      fileName,
      size: arrayBuffer.byteLength,
      contentType: response.headers.get("content-type"),
    });
  } catch (error: any) {
    console.error("Gagal export excel dosen dari BE:", error);
    alert(
      "Gagal mengunduh Excel dari Server: " +
        (error?.message || "Terjadi kesalahan jaringan/server"),
    );
  }
}

export const exportJadwalDosenExcel = exportJadwalDosenExcelApi;

export default getJadwalDosen;