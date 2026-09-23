import type { Jadwal } from "../types/penjadwalan";

export const dummyJadwal: Jadwal[] = [
  {
    id: "1",
    prodi: "TRIK",
    kodeMK: "SVIK214101",
    namaMataKuliah: "Bahasa Inggris 1",
    dosen: "Yohana Ika Harnita Sari, S.Pd., M.Hum., Ph.D",
    kelas: "IK1AA",
    hari: "Senin",
    sesi: 1,
    ruang: "HU 108",
    sks: 2,
  },
  {
    id: "2",
    prodi: "TRIK",
    kodeMK: "SVIK214102",
    namaMataKuliah: "Matematika Dasar",
    dosen: "Rudi Setiawan, S.T., M.T.",
    kelas: "IK1AB",
    hari: "Selasa",
    sesi: 2,
    ruang: "HU 109",
    sks: 3,
  },
  {
    id: "3",
    prodi: "TRIK",
    kodeMK: "SVIK214103",
    namaMataKuliah: "Ilmu Komputer",
    dosen: "Diana Pratiwi, S.Kom., M.Kom.",
    kelas: "IK1AC",
    hari: "Rabu",
    sesi: 3,
    ruang: "HU 110",
    sks: 3,
  },
  {
    id: "4",
    prodi: "TRIK",
    kodeMK: "SVIK214104",
    namaMataKuliah: "Fisika Modern",
    dosen: "Budi Santoso, S.Si., M.Sc.",
    kelas: "IK1AD",
    hari: "Kamis",
    sesi: 4,
    ruang: "HU 111",
    sks: 2,
  },
  {
    id: "5",
    prodi: "TRIK",
    kodeMK: "SVIK214105",
    namaMataKuliah: "Ekonomi Mikro",
    dosen: "Siti Nurhaliza, S.E., M.E.",
    kelas: "IK1AE",
    hari: "Jumat",
    sesi: 5,
    ruang: "HU 112",
    sks: 2,
  },
];

/**
 * Mock pilihan Mata Kuliah.
 *
 * Struktur ini sengaja tetap sama seperti project sebelumnya karena
 * project saat ini belum mempunyai API/master-data yang menyediakan
 * relasi Program Studi -> Mata Kuliah.
 */
export const dummyOpsiMataKuliah = [
  "Bahasa Inggris 1",
  "Matematika Dasar",
  "Ilmu Komputer",
  "Fisika Modern",
  "Ekonomi Mikro",
];

export const dummyOpsiDosen = [
  "Yohana Ika Harnita Sari, S.Pd., M.Hum., Ph.D",
  "Rudi Setiawan, S.T., M.T.",
  "Diana Pratiwi, S.Kom., M.Kom.",
  "Budi Santoso, S.Si., M.Sc.",
  "Siti Nurhaliza, S.E., M.E.",
];

export const dummyOpsiKelas = ["IK1AA", "IK1AB", "IK1AC", "IK1AD", "IK1AE"];

export const dummyOpsiRuang = [
  "HU 108",
  "HU 109",
  "HU 110",
  "HU 111",
  "HU 112",
];

/**
 * State awal mock berdasarkan periode.
 *
 * Setiap periode memiliki array sendiri supaya:
 * - tambah pada periode A tidak masuk periode B
 * - edit pada periode A tidak mengubah periode B
 * - delete pada periode A tidak mengubah periode B
 *
 * Ketika backend sudah tersedia, object ini dapat diganti dengan
 * hasil fetch berdasarkan periodeId.
 */
export function createDummyJadwalByPeriode(
  periodeIds: string[],
): Record<string, Jadwal[]> {
  return Object.fromEntries(
    periodeIds.map((periodeId) => [
      periodeId,
      dummyJadwal.map((item) => ({
        ...item,
      })),
    ]),
  );
}
