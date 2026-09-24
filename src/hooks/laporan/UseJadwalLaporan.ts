import { useCallback, useEffect, useState } from 'react';

/**
 * Bentuk fungsi service yang bisa dipakai hook ini. Ketiga service Tahap 3
 * (getJadwalDosen, getJadwalMahasiswa, getJadwalRuang) sudah cocok dengan
 * signature ini apa adanya: `(periodeAkademikId, entityId?) => Promise<TBaris[]>`.
 */
export type LaporanServiceFn<TBaris> = (
  periodeAkademikId: string,
  entityId?: string,
) => Promise<TBaris[]>;

export interface UseJadwalLaporanParams<TBaris> {
  /** Fungsi service yang dipanggil untuk ambil data, mis. `getJadwalDosen`. */
  service: LaporanServiceFn<TBaris>;
  periodeAkademikId: string;
  /** Id entitas awal yang ingin difilter (opsional, default: semua entitas). */
  entityIdAwal?: string;
}

export interface UseJadwalLaporanResult<TBaris> {
  data: TBaris[];
  loading: boolean;
  error: string | null;
  /** Id entitas yang sedang difilter (dosenId/mahasiswaId/ruangId), atau undefined = semua. */
  entityId: string | undefined;
  setEntityId: (entityId: string | undefined) => void;
  /** Muat ulang data secara manual dengan filter yang sama (mis. tombol "Refresh"). */
  reload: () => void;
}

/**
 * Hook generik untuk laporan jadwal (dosen/mahasiswa/ruang). Hook ini tidak
 * tahu bentuk `TBaris` atau sumber datanya (mock atau API asli) — semua
 * itu didelegasikan ke `service` yang di-passing, jadi hook yang sama bisa
 * dipakai oleh 3 view laporan tanpa duplikasi logic fetching/loading/error.
 */
export function useJadwalLaporan<TBaris>({
  service,
  periodeAkademikId,
  entityIdAwal,
}: UseJadwalLaporanParams<TBaris>): UseJadwalLaporanResult<TBaris> {
  const [entityId, setEntityId] = useState<string | undefined>(entityIdAwal);
  const [data, setData] = useState<TBaris[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let dibatalkan = false;

    async function muatData() {
      setLoading(true);
      setError(null);
      try {
        const hasil = await service(periodeAkademikId, entityId);
        if (!dibatalkan) {
          setData(hasil);
        }
      } catch (err) {
        if (!dibatalkan) {
          setError(err instanceof Error ? err.message : 'Gagal memuat data laporan');
          setData([]);
        }
      } finally {
        if (!dibatalkan) {
          setLoading(false);
        }
      }
    }

    muatData();

    return () => {
      dibatalkan = true;
    };
  }, [service, periodeAkademikId, entityId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, loading, error, entityId, setEntityId, reload };
}