import {
  DAFTAR_HARI,
  JUMLAH_SESI_PER_HARI,
  type BarisSesiJadwal,
  type Hari,
  type JadwalEntry,
  type SelJadwal,
} from '../../types/laporan';

/**
 * Kumpulan fungsi transformasi data mentah (JadwalEntry[]) menjadi bentuk
 * matriks (BarisSesiJadwal[]) yang dipakai oleh ketiga jenis laporan
 * (dosen, mahasiswa, ruang). Semua fungsi di sini murni (pure) — tidak
 * mengakses mock data maupun API — supaya bisa dipakai ulang tanpa
 * duplikasi logic di 3 service.
 */

/** Fungsi untuk membangun teks baris kedua ("keterangan") pada satu sel jadwal. */
export type KeteranganBuilder = (entry: JadwalEntry) => string;

/**
 * Ubah daftar entry jadwal (yang sudah difilter untuk satu entitas, mis.
 * satu dosen/ruang/kelas) menjadi array BarisSesiJadwal sepanjang
 * JUMLAH_SESI_PER_HARI baris (sesi 1..N), Senin-Jumat.
 *
 * Satu entry ditempatkan pada baris `sesiAwal`-nya saja (bukan diulang di
 * setiap baris sampai `sesiAkhir`); baris-baris berikutnya yang tertutup
 * rentang sesi entry tersebut jadi tanggung jawab komponen tabel di UI
 * untuk digabung/merge secara visual (data di sini tidak menduplikasi sel).
 *
 * `keteranganBuilder` dipisah sebagai parameter karena teks baris kedua
 * beda-beda tergantung jenis laporan (mis. laporan dosen menampilkan
 * kelas & ruang, laporan ruang menampilkan kelas & dosen).
 */
export function buildBarisSesiJadwal(
  entries: JadwalEntry[],
  keteranganBuilder: KeteranganBuilder,
): BarisSesiJadwal[] {
  const barisPerSesi: BarisSesiJadwal[] = Array.from(
    { length: JUMLAH_SESI_PER_HARI },
    (_, index) => ({
      sesi: index + 1,
      perHari: {},
    }),
  );

  for (const entry of entries) {
    const baris = barisPerSesi[entry.sesiAwal - 1];
    if (!baris) {
      // sesiAwal di luar rentang JUMLAH_SESI_PER_HARI, lewati saja
      // (harusnya tidak terjadi kalau data konsisten).
      continue;
    }

    const selJadwal: SelJadwal = {
      entryId: entry.id,
      matkulNama: entry.matkulNama,
      keterangan: keteranganBuilder(entry),
      sesiAwal: entry.sesiAwal,
      sesiAkhir: entry.sesiAkhir,
    };

    const daftarSelHariIni = baris.perHari[entry.hari] ?? [];
    daftarSelHariIni.push(selJadwal);
    baris.perHari[entry.hari] = daftarSelHariIni;
  }

  return barisPerSesi;
}

/** Filter entry berdasarkan periode akademik, dan opsional satu field id tertentu. */
export function filterEntriesByPeriodeDanId<K extends keyof JadwalEntry>(
  entries: JadwalEntry[],
  periodeAkademikId: string,
  idField: K,
  idValue?: JadwalEntry[K],
): JadwalEntry[] {
  return entries.filter((entry) => {
    const cocokPeriode = entry.periodeAkademikId === periodeAkademikId;
    const cocokId = idValue === undefined || entry[idField] === idValue;
    return cocokPeriode && cocokId;
  });
}

/** Urutan hari tetap (Senin-Jumat), dipakai kalau UI perlu iterasi kolom hari. */
export const urutanHari: readonly Hari[] = DAFTAR_HARI;