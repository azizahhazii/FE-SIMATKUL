/**
 * Tipe data untuk modul Laporan (Jadwal per Dosen, per Kelas, per Ruang).
 * Sumber data masih dummy (lihat data/laporan.ts), tapi bentuk tipe di sini
 * dibuat agar siap dipakai langsung saat backend API sudah tersedia.
 */

// NOTE: cek apakah type ini sudah ada di modul Penjadwalan/types
//       sebelum dipakai project sungguhan, untuk menghindari duplikasi.
export type Hari = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';

// NOTE: cek apakah type ini sudah ada di modul Penjadwalan/types
//       sebelum dipakai project sungguhan, untuk menghindari duplikasi.
export type Sesi = number;

export const DAFTAR_HARI: readonly Hari[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

/** Jumlah sesi per hari yang dipakai di tabel matriks laporan. */
export const JUMLAH_SESI_PER_HARI = 5;

/**
 * Satu baris jadwal mentah (unit terkecil): satu mata kuliah yang diampu satu
 * dosen, untuk satu kelas, di satu ruang, pada satu hari, sesi tertentu.
 *
 * `sesiAwal`/`sesiAkhir` mengakomodasi mata kuliah yang memakai lebih dari
 * satu sesi berturut-turut (mis. praktikum 2 sesi, lihat screenshot "Hasil
 * Penjadwalan"). Untuk mata kuliah 1 sesi, `sesiAwal === sesiAkhir`.
 */
export interface JadwalEntry {
  id: string;
  periodeAkademikId: string;
  hari: Hari;
  sesiAwal: Sesi;
  sesiAkhir: Sesi;
  matkulId: string;
  matkulNama: string;
  dosenId: string;
  dosenNama: string;
  ruangId: string;
  ruangNama: string;
  kelasId: string;
  kelasNama: string;
}

/** Data master ringkas, dipakai untuk isi dropdown filter per laporan. */
export interface DosenRingkas {
  id: string;
  nama: string;
  bebanSks: number;
}

export interface RuangRingkas {
  id: string;
  nama: string;
  /** Persentase okupansi ruang, 0-100. */
  okupansi: number;
}

export interface KelasRingkas {
  id: string;
  nama: string;
  prodi?: string;
  keteranganSub?: string;
}

/** Satu sel pada tabel matriks (array karena satu sel bisa berisi >1 jadwal jika bentrok). */
export interface SelJadwal {
  entryId: string;
  matkulNama: string;
  /** Baris kedua yang ditampilkan di sel, mis. "PL1AA - CU 205" atau "CU 205 - Dr. Sri Mulyana". */
  keterangan: string;
  sesiAwal: Sesi;
  sesiAkhir: Sesi;
}

/** Jadwal satu baris tabel (satu nomor sesi) untuk seluruh hari Senin-Jumat. */
export interface BarisSesiJadwal {
  sesi: Sesi;
  perHari: Partial<Record<Hari, SelJadwal[]>>;
}

/**
 * Baris laporan generik: info entitas (dosen/ruang/kelas) + matriks
 * jadwalnya. Dipakai bersama oleh ketiga jenis laporan lewat generic `TInfo`
 * supaya tidak ada 3 interface duplikat yang bedanya cuma info entitasnya.
 */
export interface BarisLaporanJadwal<TInfo> {
  info: TInfo;
  jadwalPerSesi: BarisSesiJadwal[];
}

export type BarisJadwalDosen = BarisLaporanJadwal<DosenRingkas>;
export type BarisJadwalRuang = BarisLaporanJadwal<RuangRingkas>;
export type BarisJadwalKelas = BarisLaporanJadwal<KelasRingkas>;

/** Parameter filter masing-masing laporan. */
export interface FilterLaporanDosen {
  periodeAkademikId: string;
  dosenId?: string;
}

export interface FilterLaporanRuang {
  periodeAkademikId: string;
  ruangId?: string;
}

export interface FilterLaporanKelas {
  periodeAkademikId: string;
  kelasId?: string;
}