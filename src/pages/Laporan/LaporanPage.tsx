import { useState } from 'react';
import { Button } from 'assets-design-system';
import { PERIODE_AKADEMIK_DEFAULT_ID } from '../../data/laporan';
import { JadwalDosenView } from '../../components/laporan/JadwalDosenView';
import { JadwalKelasView } from '../../components/laporan/JadwalKelasView';
import { JadwalRuangView } from '../../components/laporan/JadwalRuangView';
import { PeriodeAkademikFilter } from '../../components/laporan/PeriodeAkademikFilter';
import type { SelectOption } from '../../components/master-data/SelectField';

type TabLaporan = 'dosen' | 'ruang' | 'kelas';

const DAFTAR_TAB: { key: TabLaporan; label: string }[] = [
  { key: 'dosen', label: 'Jadwal Dosen' },
  { key: 'ruang', label: 'Jadwal Ruang' },
  { key: 'kelas', label: 'Jadwal Kelas' },
];

const OPSI_PERIODE_AKADEMIK: SelectOption[] = [
  { value: PERIODE_AKADEMIK_DEFAULT_ID, label: '2025/2026 Ganjil' },
];

export function LaporanPage() {
  const [activeTab, setActiveTab] = useState<TabLaporan>('dosen');
  const [periodeAkademikId, setPeriodeAkademikId] = useState('');

  return (
    <div className="min-h-screen bg-neutral-300 p-6 sm:p-8">
      {/* Header Halaman */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-h7 font-bold text-primary-500">Hasil Penjadwalan</h1>
          <p className="mt-1 text-b3 text-neutral-700">
            Pantau hasil penjadwalan Dosen, Ruangan, dan Kelas
          </p>
        </div>

        <PeriodeAkademikFilter
          options={OPSI_PERIODE_AKADEMIK}
          value={periodeAkademikId}
          onChange={setPeriodeAkademikId}
        />
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {DAFTAR_TAB.map((tab) => (
          <Button
            key={tab.key}
            theme="primary"
            variant={activeTab === tab.key ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'dosen' && <JadwalDosenView />}
      {activeTab === 'ruang' && <JadwalRuangView />}
      {activeTab === 'kelas' && <JadwalKelasView />}
    </div>
  );
}

export default LaporanPage;