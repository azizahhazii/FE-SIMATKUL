import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { mockKelasList, PERIODE_AKADEMIK_DEFAULT_ID } from "../../data/laporan";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";

import { getJadwalKelas } from "../../services/laporan/jadwalKelasService";

import type { KelasRingkas } from "../../types/laporan";

import { exportMatrixToExcel } from "../../utils/exportExcel";

import { JadwalMatrixTable } from "./JadwalMatrixTable";

import { LaporanToolbar } from "./LaporanToolbar";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function JadwalKelasView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const belumPilihPeriode = periodeId === "";

  const periodeUntukService = belumPilihPeriode
    ? "__NO_PERIODE__"
    : PERIODE_AKADEMIK_DEFAULT_ID;

  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan({
    service: getJadwalKelas,
    periodeAkademikId: periodeUntukService,
  });

  const kelasOptions = mockKelasList.map((kelas) => ({
    id: kelas.id,
    label: kelas.nama,
  }));

  const handleExport = () => {
    if (belumPilihPeriode) return;
    if (data.length === 0) return;

    exportMatrixToExcel(data, `Laporan_Jadwal_Kelas_${periodeId}`);
  };

  const renderKelasInfo = (kelas: KelasRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {kelas.nama}
      </div>

      <div className="mt-0.5 text-[11px] leading-tight text-neutral-600">
        {kelas.prodi ?? kelas.keteranganSub ?? "TRPL"}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {error && !belumPilihPeriode && (
        <div className="mb-4 rounded-2 border border-red-100 bg-neutral-300 p-4 text-b3 text-red-200">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3 border-2 border-neutral-500 bg-white">
        <LaporanToolbar
          defaultOptionLabel="Semua kelas"
          options={kelasOptions}
          selectedId={entityId}
          onSelectChange={setEntityId}
          onExportExcel={handleExport}
          isExportDisabled={belumPilihPeriode || loading || data.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <JadwalMatrixTable<KelasRingkas>
          data={belumPilihPeriode ? [] : data}
          labelKolomInfo="Nama Kelas"
          renderInfo={renderKelasInfo}
          loading={!belumPilihPeriode && loading}
          emptyMessage={
            belumPilihPeriode
              ? "Pilih periode akademik untuk melanjutkan"
              : "Belum ada data jadwal untuk filter ini."
          }
        />
      </div>
    </div>
  );
}

export default JadwalKelasView;
