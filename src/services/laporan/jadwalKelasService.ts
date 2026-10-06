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
 * Export Excel Kelas Murni dari Endpoint Backend
 */
export async function exportJadwalKelasExcel(
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

    const targetUrl = `${cleanBaseURL}/api/penjadwalan/export-excel/kelas/${encodeURIComponent(
      String(kurikulumId),
    )}`;

    console.log("[EXPORT EXCEL KELAS] URL:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log("[EXPORT EXCEL KELAS] Status:", response.status);

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

      console.error("[EXPORT EXCEL KELAS] Response bukan XLSX:", {
        contentType: response.headers.get("content-type"),
        size: arrayBuffer.byteLength,
        preview,
      });

      throw new Error("Server tidak mengirim file Excel XLSX yang valid.");
    }

    let fileName = `Laporan_Jadwal_Kelas_${kurikulumId}.xlsx`;
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

    console.log("[EXPORT EXCEL KELAS] Berhasil:", {
      fileName,
      size: arrayBuffer.byteLength,
    });
  } catch (error: any) {
    console.error("Gagal export excel kelas dari BE:", error);
    alert(
      "Gagal mengunduh Excel dari Server: " +
        (error?.message || "Terjadi kesalahan jaringan/server"),
    );
  }
}