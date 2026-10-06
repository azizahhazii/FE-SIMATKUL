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
 * Export Excel Ruang Murni dari Endpoint Backend
 */
export async function exportJadwalRuangExcel(
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

    const targetUrl = `${cleanBaseURL}/api/penjadwalan/export-excel/ruang/${encodeURIComponent(
      String(kurikulumId),
    )}`;

    console.log("[EXPORT EXCEL RUANG] URL:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("[EXPORT EXCEL RUANG] Status:", response.status);

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

      console.error("[EXPORT EXCEL RUANG] Response bukan XLSX:", {
        contentType: response.headers.get("content-type"),
        size: arrayBuffer.byteLength,
        preview,
      });

      throw new Error("Server tidak mengirim file Excel XLSX yang valid.");
    }

    let fileName = `Laporan_Jadwal_Ruang_${kurikulumId}.xlsx`;
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

    console.log("[EXPORT EXCEL RUANG] Berhasil:", {
      fileName,
      size: arrayBuffer.byteLength,
    });
  } catch (error: any) {
    console.error("Gagal export excel ruang dari BE:", error);
    alert(
      "Gagal mengunduh Excel dari Server: " +
        (error?.message || "Terjadi kesalahan jaringan/server"),
    );
  }
}