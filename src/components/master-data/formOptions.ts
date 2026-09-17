import type { SelectOption } from "./SelectField";

/**
 * Isi dropdown yang dipakai lebih dari satu modal. Sebelumnya daftar semester
 * ditulis ulang di tiga file dengan cara berbeda (Array.from di dua tempat,
 * <option> manual di tempat lain), jadi dikumpulkan di sini.
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

export const SEMESTER_PERIODE_OPTIONS: SelectOption[] = [
  { value: "Gasal", label: "Gasal" },
  { value: "Genap", label: "Genap" },
];

/** Kolom "Kelompok" di tabel Kurikulum, label "Tipe Kelas" di modal. */
export const TIPE_KELAS_OPTIONS: SelectOption[] = [
  { value: "MKK", label: "MKK" },
  { value: "MKDU", label: "MKDU" },
];

export const JENIS_MATA_KULIAH_OPTIONS: SelectOption[] = [
  { value: "Wajib", label: "Wajib" },
  { value: "Pilihan", label: "Pilihan" },
];

/** Kolom "Tipe" di tabel Kurikulum, label "Kelompok" di modal. */
export const KELOMPOK_MATA_KULIAH_OPTIONS: SelectOption[] = [
  { value: "Teori", label: "Teori" },
  { value: "Praktikum", label: "Praktikum" },
];