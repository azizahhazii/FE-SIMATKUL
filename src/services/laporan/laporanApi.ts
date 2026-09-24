import type {
  BarisJadwalDosen,
  BarisJadwalMahasiswa,
  BarisJadwalRuang,
} from '../../types/laporan';

/**
 * Placeholder API layer untuk modul Laporan.
 *
 * Semua fungsi di file ini SENGAJA belum diimplementasikan (throw Error).
 * Nanti kalau backend API sudah siap, isi masing-masing fungsi dengan
 * pemanggilan ke services/api.ts (mis. `apiClient.get(...)`), tanpa perlu
 * mengubah service (jadwalDosenService.ts, dst.) maupun komponen/hook yang
 * memanggilnya — karena signature fungsi di sini sudah dibuat final.
 */

export async function fetchJadwalDosen(
  periodeId: string,
  dosenId?: string,
): Promise<BarisJadwalDosen[]> {
  // TODO: ganti dengan panggilan ke services/api.ts kalau API sudah siap
  throw new Error('API belum diimplementasikan');
}

export async function fetchJadwalMahasiswa(
  periodeId: string,
  mahasiswaId?: string,
): Promise<BarisJadwalMahasiswa[]> {
  // TODO: ganti dengan panggilan ke services/api.ts kalau API sudah siap
  throw new Error('API belum diimplementasikan');
}

export async function fetchJadwalRuang(
  periodeId: string,
  ruangId?: string,
): Promise<BarisJadwalRuang[]> {
  // TODO: ganti dengan panggilan ke services/api.ts kalau API sudah siap
  throw new Error('API belum diimplementasikan');
}