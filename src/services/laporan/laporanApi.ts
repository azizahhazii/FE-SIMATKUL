import type {
  BarisJadwalDosen,
  BarisJadwalKelas,
  BarisJadwalRuang,
} from "../../types/laporan";

/**
 * Placeholder API layer untuk modul Laporan.
 *
 * Saat ini endpoint backend laporan belum diimplementasikan,
 * jadi fungsi-fungsi ini masih menjadi placeholder.
 */

export async function fetchJadwalDosen(
  periodeId: string,
  dosenId?: string,
): Promise<BarisJadwalDosen[]> {
  // Supaya TypeScript tidak menganggap parameter tidak dipakai.
  void periodeId;
  void dosenId;

  throw new Error("API belum diimplementasikan");
}

export async function fetchJadwalKelas(
  periodeId: string,
  kelasId?: string,
): Promise<BarisJadwalKelas[]> {
  void periodeId;
  void kelasId;

  throw new Error("API belum diimplementasikan");
}

export async function fetchJadwalRuang(
  periodeId: string,
  ruangId?: string,
): Promise<BarisJadwalRuang[]> {
  void periodeId;
  void ruangId;

  throw new Error("API belum diimplementasikan");
}
