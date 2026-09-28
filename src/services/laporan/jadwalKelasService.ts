import { mockJadwalEntries, mockKelasList } from '../../data/laporan';
import type { BarisJadwalKelas, KelasRingkas } from '../../types/laporan';
import { buildBarisSesiJadwal, filterEntriesByPeriodeDanId } from './laporanUtils';

/**
 * Ambil data laporan jadwal per kelas.
 *
 * SEKARANG: baca & olah dari mock data (data/laporan.ts).
 * NANTI: tinggal ganti body fungsi ini jadi
 * `return fetchJadwalKelas(periodeId, kelasId)` dari laporanApi.ts.
 *
 * Kalau `kelasId` tidak diisi, laporan dikembalikan untuk SEMUA kelas
 * (satu BarisJadwalKelas per kelas).
 */
export async function getJadwalKelas(
  periodeId: string,
  kelasId?: string,
): Promise<BarisJadwalKelas[]> {
  const daftarKelasDicakup: KelasRingkas[] = kelasId
    ? mockKelasList.filter((kelas) => kelas.id === kelasId)
    : mockKelasList;

  return daftarKelasDicakup.map((kelas) => {
    const entriesKelasIni = filterEntriesByPeriodeDanId(
      mockJadwalEntries,
      periodeId,
      'kelasId',
      kelas.id,
    );

    const jadwalPerSesi = buildBarisSesiJadwal(
      entriesKelasIni,
      // Baris kedua di sel: ruang + dosen pengampu mata kuliah tsb.
      (entry) => `${entry.ruangNama} - ${entry.dosenNama}`,
    );

    const barisLaporan: BarisJadwalKelas = {
      info: kelas,
      jadwalPerSesi,
    };
    return barisLaporan;
  });
}