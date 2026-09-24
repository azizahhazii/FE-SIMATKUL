import { mockKelasList, PERIODE_AKADEMIK_DEFAULT_ID } from '../../data/laporan';
import { useJadwalLaporan } from '../../hooks/laporan/UseJadwalLaporan';
import { getJadwalKelas } from '../../services/laporan/jadwalKelasService';
import type { KelasRingkas } from '../../types/laporan';
import { exportMatrixToExcel } from '../../utils/exportExcel';
import UserId from '@solar-icons/react/users/UserId';
import { JadwalMatrixTable } from './JadwalMatrixTable';
import { LaporanToolbar } from './LaporanToolbar';

export function JadwalKelasView() {
  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan({
    service: getJadwalKelas,
    periodeAkademikId: PERIODE_AKADEMIK_DEFAULT_ID,
  });

  const kelasOptions = mockKelasList.map((kelas) => ({
    id: kelas.id,
    label: kelas.nama,
  }));

  const handleExport = () => {
    exportMatrixToExcel(data, `Laporan_Jadwal_Kelas_${PERIODE_AKADEMIK_DEFAULT_ID}`);
  };

  const renderKelasInfo = (kelas: KelasRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Nama kelas diperbesar menggunakan text-sm (14px) */}
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {kelas.nama}
      </div>
      <div className="mt-0.5 text-[11px] leading-tight text-neutral-600">
        {kelas.prodi ?? kelas.keteranganSub}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {error && (
        <div className="mb-4 rounded-2 border border-red-100 bg-neutral-300 p-4 text-b3 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3 border-2 border-neutral-500">
        <LaporanToolbar
          defaultOptionLabel="Semua Kelas"
          options={kelasOptions}
          selectedId={entityId}
          onSelectChange={setEntityId}
          onExportExcel={handleExport}
          isExportDisabled={loading || data.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <JadwalMatrixTable<KelasRingkas>
          data={data}
          labelKolomInfo="Nama Kelas"
          renderInfo={renderKelasInfo}
          loading={loading}
        />
      </div>
    </div>
  );
}