import type { ProdiId } from "../components/master-data/ProdiFilterCards";

export const HARI_LIST = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] as const;
export type Hari = (typeof HARI_LIST)[number];

/** Nomor sesi yang dipakai grid preview. Selaras dengan Master Data > Sesi. */
export const SESI_LIST = [1, 2, 3, 4, 5] as const;
export type Sesi = (typeof SESI_LIST)[number];

/** Total slot per baris = 5 hari x 5 sesi. Dipakai untuk hitung okupansi. */
export const TOTAL_SLOT = HARI_LIST.length * SESI_LIST.length;

export interface Jadwal {
  id: string;
  prodi: ProdiId;
  kodeMK: string;
  namaMataKuliah: string;
  dosen: string;
  kelas: string;
  hari: Hari;
  sesi: Sesi;
  ruang: string;
  sks: number;
}

/** Satu baris di grid preview (satu ruang / satu kelas / satu dosen). */
export interface HeatmapRow {
  id: string;
  label: string;
  sublabel: string;

  /** Jumlah jadwal per slot, key `${hari}-${sesi}`. */
  slots: Record<string, number>;

  /** Data jadwal asli pada setiap slot untuk kebutuhan hover. */
  slotJadwal: Record<string, Jadwal[]>;

  /** True kalau ada minimal satu slot dengan lebih dari satu jadwal. */
  adaBentrok: boolean;
}

export type PreviewMode = "ruang" | "kelas" | "dosen";
