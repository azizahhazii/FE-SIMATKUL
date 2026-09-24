import { mockJadwalEntries, mockRuangList } from '../../data/laporan';
import type { BarisJadwalRuang, RuangRingkas } from '../../types/laporan';
import { buildBarisSesiJadwal, filterEntriesByPeriodeDanId } from './laporanUtils';

/**
 * Ambil data laporan jadwal per ruang.
 *
 * SEKARANG: baca & olah dari mock data (data/laporan.ts).
 * NANTI: tinggal ganti body fungsi ini jadi `return fetchJadwalRuang(periodeId, ruangId)`
 * dari laporanApi.ts — signature & return type sudah sama, jadi pemanggil
 * (hook/komponen) tidak perlu berubah sama sekali.
 *
 * Kalau `ruangId` tidak diisi, laporan dikembalikan untuk SEMUA ruang yang
 * punya jadwal pada periode tersebut (satu BarisJadwalRuang per ruang).
 */
export async function getJadwalRuang(
  periodeId: string,
  ruangId?: string,
): Promise<BarisJadwalRuang[]> {
  const daftarRuangDicakup: RuangRingkas[] = ruangId
    ? mockRuangList.filter((ruang) => ruang.id === ruangId)
    : mockRuangList;

  return daftarRuangDicakup.map((ruang) => {
    const entriesRuangIni = filterEntriesByPeriodeDanId(
      mockJadwalEntries,
      periodeId,
      'ruangId',
      ruang.id,
    );

    const jadwalPerSesi = buildBarisSesiJadwal(
      entriesRuangIni,
      // Baris kedua di sel: kelas yang memakai ruang ini + dosennya.
      (entry) => `${entry.kelasNama} - ${entry.dosenNama}`,
    );

    const barisLaporan: BarisJadwalRuang = {
      info: ruang,
      jadwalPerSesi,
    };
    return barisLaporan;
  });
}