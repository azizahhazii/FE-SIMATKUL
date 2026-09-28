import { useOutletContext } from "react-router-dom";

import UserId from "@solar-icons/react/users/UserId";

import { mockRuangList, PERIODE_AKADEMIK_DEFAULT_ID } from "../../data/laporan";

import { useJadwalLaporan } from "../../hooks/laporan/UseJadwalLaporan";

import { getJadwalRuang } from "../../services/laporan/jadwalRuangService";

import type { RuangRingkas } from "../../types/laporan";

import { exportMatrixToExcel } from "../../utils/exportExcel";

import { JadwalMatrixTable } from "./JadwalMatrixTable";

import { LaporanToolbar } from "./LaporanToolbar";

import type { LaporanOutletContext } from "../../layouts/LaporanLayout";

export function JadwalRuangView() {
  const { periodeId } = useOutletContext<LaporanOutletContext>();

  const belumPilihPeriode = periodeId === "";

  /*
   * Dropdown periode memakai ID 1, 2, 3.
   * Data dummy laporan masih memakai:
   * GNJ-2025-2026
   *
   * Jadi:
   * - belum pilih → jangan ambil data
   * - sudah pilih → pakai ID dummy laporan
   */
  const periodeUntukService = belumPilihPeriode
    ? "__NO_PERIODE__"
    : PERIODE_AKADEMIK_DEFAULT_ID;

  const { data, loading, error, entityId, setEntityId } = useJadwalLaporan({
    service: getJadwalRuang,
    periodeAkademikId: periodeUntukService,
  });

  const ruangOptions = mockRuangList.map((ruang) => ({
    id: ruang.id,
    label: ruang.nama,
  }));

  const handleExport = () => {
    if (belumPilihPeriode) return;
    if (data.length === 0) return;

    exportMatrixToExcel(data, `Laporan_Jadwal_Ruang_${periodeId}`);
  };

  const renderRuangInfo = (ruang: RuangRingkas) => (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="text-sm font-bold leading-snug text-neutral-1000">
        {ruang.nama}
      </div>

      <div className="mt-0.5 text-[11px] leading-tight text-neutral-1000">
        Okupansi: {ruang.okupansi}%
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
          defaultOptionLabel="Semua ruang"
          options={ruangOptions}
          selectedId={entityId}
          onSelectChange={setEntityId}
          onExportExcel={handleExport}
          isExportDisabled={belumPilihPeriode || loading || data.length === 0}
          selectLeftIcon={<UserId weight="BoldDuotone" size={24} />}
        />

        <JadwalMatrixTable<RuangRingkas>
          data={belumPilihPeriode ? [] : data}
          labelKolomInfo="Nama Ruang"
          renderInfo={renderRuangInfo}
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

export default JadwalRuangView;
