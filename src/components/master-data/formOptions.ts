import type { SelectOption } from "./SelectField";

/**
 * Isi dropdown yang dipakai lebih dari satu modal.
 */

/**
 * Semester mata kuliah:
 * value yang dikirim ke API berupa angka string ("1" - "8"),
 * sedangkan label yang ditampilkan ke user adalah "Semester 1" - "Semester 8".
 */
export const SEMESTER_OPTIONS: SelectOption[] = Array.from(
  { length: 8 },
  (_, index) => ({
    value: String(index + 1),
    label: `Semester ${index + 1}`,
  }),
);

export const JUMLAH_KELAS_OPTIONS: SelectOption[] = Array.from(
  { length: 6 },
  (_, index) => ({
    value: String(index + 1),
    label: `${index + 1} Kelas`,
  }),
);

/**
 * Semester periode akademik / kurikulum.
 *
 * Backend menggunakan:
 * - Ganjil
 * - Genap
 */
export const SEMESTER_PERIODE_OPTIONS: SelectOption[] = [
  { value: "Ganjil", label: "Ganjil" },
  { value: "Genap", label: "Genap" },
];

/**
 * Nilai BE `tipe_kelas`.
 * Ditampilkan sebagai kolom "Kelompok" di tabel.
 */
export const TIPE_KELAS_OPTIONS: SelectOption[] = [
  { value: "MKK", label: "MKK" },
  { value: "MKDU", label: "MKDU" },
];

/**
 * Nilai BE `jenis`.
 */
export const JENIS_MATA_KULIAH_OPTIONS: SelectOption[] = [
  { value: "Wajib", label: "Wajib" },
  { value: "Pilihan", label: "Pilihan" },
];

/**
 * Nilai BE `kelompok`.
 * Ditampilkan sebagai kolom "Tipe" di tabel.
 */
export const KELOMPOK_MATA_KULIAH_OPTIONS: SelectOption[] = [
  { value: "Teori", label: "Teori" },
  { value: "Praktikum", label: "Praktikum" },
];