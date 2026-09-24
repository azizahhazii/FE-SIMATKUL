import UserId from '@solar-icons/react/users/UserId';
import { mockRuangList, PERIODE_AKADEMIK_DEFAULT_ID } from '../../data/laporan';
import { useJadwalLaporan } from '../../hooks/laporan/UseJadwalLaporan';
import { getJadwalRuang } from '../../services/laporan/jadwalRuangService';
import type { RuangRingkas } from '../../types/laporan';
import { exportMatrixToExcel } from '../../utils/exportExcel';
import { JadwalMatrixTable } from './JadwalMatrixTable';
import { LaporanToolbar } from './LaporanToolbar';

export function JadwalRuangView() {
  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan({
    service: getJadwalRuang,
    periodeAkademikId: PERIODE_AKADEMIK_DEFAULT_ID,
  });

  const ruangOptions = mockRuangList.map((ruang) => ({
    id: ruang.id,
    label: ruang.nama,
  }));

  const handleExport = () => {
    exportMatrixToExcel(data, `Laporan_Jadwal_Ruang_${PERIODE_AKADEMIK_DEFAULT_ID}`);
  };

  const renderRuangInfo = (ruang: RuangRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {ruang.nama}
      </div>
      <div className="mt-1 text-xs leading-tight text-neutral-1000">
        Okupansi: {ruang.okupansi}%
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
          defaultOptionLabel="Semua Ruang"
          options={ruangOptions}
          selectedId={entityId}
          onSelectChange={setEntityId}
          onExportExcel={handleExport}
          isExportDisabled={loading || data.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <JadwalMatrixTable<RuangRingkas>
          data={data}
          labelKolomInfo="Nama Ruang"
          renderInfo={renderRuangInfo}
          loading={loading}
        />
      </div>
    </div>
  );
}