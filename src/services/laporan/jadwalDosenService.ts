import { mockDosenList, mockJadwalEntries } from '../../data/laporan';
import type { BarisJadwalDosen, DosenRingkas } from '../../types/laporan';
import { buildBarisSesiJadwal, filterEntriesByPeriodeDanId } from './laporanUtils';

/**
 * Ambil data laporan jadwal per dosen.
 *
 * SEKARANG: baca & olah dari mock data (data/laporan.ts).
 * NANTI: tinggal ganti body fungsi ini jadi `return fetchJadwalDosen(periodeId, dosenId)`
 * dari laporanApi.ts — signature & return type sudah sama, jadi pemanggil
 * (hook/komponen) tidak perlu berubah sama sekali.
 *
 * Kalau `dosenId` tidak diisi, laporan dikembalikan untuk SEMUA dosen yang
 * punya jadwal pada periode tersebut (satu BarisJadwalDosen per dosen).
 */
export async function getJadwalDosen(
  periodeId: string,
  dosenId?: string,
): Promise<BarisJadwalDosen[]> {
  const daftarDosenDicakup: DosenRingkas[] = dosenId
    ? mockDosenList.filter((dosen) => dosen.id === dosenId)
    : mockDosenList;

  return daftarDosenDicakup.map((dosen) => {
    const entriesDosenIni = filterEntriesByPeriodeDanId(
      mockJadwalEntries,
      periodeId,
      'dosenId',
      dosen.id,
    );

    const jadwalPerSesi = buildBarisSesiJadwal(
      entriesDosenIni,
      // Baris kedua di sel: kelas yang diajar + ruangnya.
      (entry) => `${entry.kelasNama} - ${entry.ruangNama}`,
    );

    const barisLaporan: BarisJadwalDosen = {
      info: dosen,
      jadwalPerSesi,
    };
    return barisLaporan;
  });
}