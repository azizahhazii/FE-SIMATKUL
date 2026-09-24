import type {
  DosenRingkas,
  JadwalEntry,
  KelasRingkas,
  RuangRingkas,
} from '../types/laporan';

// TODO: sebaiknya periode akademik default/aktif diambil dari
//       data/periodeAkademik.ts (mis. periode yang berstatus "aktif"),
//       sementara memakai id statis karena isi file itu belum dicek.
export const PERIODE_AKADEMIK_DEFAULT_ID = 'GNJ-2025-2026';

export const mockDosenList: DosenRingkas[] = [
  { id: 'DSN-001', nama: 'Dr. Sri Mulyana, M.Kom', bebanSks: 14 },
  { id: 'DSN-002', nama: 'Alif Subardono, S.T., M.Eng.', bebanSks: 14 },
];

export const mockKelasList: KelasRingkas[] = [
  { id: 'KLS-PL1AA', nama: 'PL1AA' },
  { id: 'KLS-PL1AB', nama: 'PL1AB' },
];

export const mockRuangList: RuangRingkas[] = [
  { id: 'RG-CU205', nama: 'CU 205', okupansi: 40 },
  { id: 'RG-CU206', nama: 'CU 206', okupansi: 40 },
];

/**
 * Bikin satu paket jadwal mingguan untuk satu kelas (dipakai untuk PL1AA dan
 * PL1AB) supaya pola datanya konsisten dan gampang dibandingkan saat uji UI.
 */
function buatJadwalKelas(params: {
  kelas: KelasRingkas;
  dosen: DosenRingkas;
  ruang: RuangRingkas;
  prefixId: string;
}): JadwalEntry[] {
  const { kelas, dosen, ruang, prefixId } = params;
  const basis = {
    periodeAkademikId: PERIODE_AKADEMIK_DEFAULT_ID,
    dosenId: dosen.id,
    dosenNama: dosen.nama,
    ruangId: ruang.id,
    ruangNama: ruang.nama,
    kelasId: kelas.id,
    kelasNama: kelas.nama,
  };

  return [
    { id: `${prefixId}-1`, ...basis, hari: 'Senin', sesiAwal: 1, sesiAkhir: 1, matkulId: 'MK-MTK', matkulNama: 'Matematika Teknik' },
    { id: `${prefixId}-2`, ...basis, hari: 'Senin', sesiAwal: 3, sesiAkhir: 3, matkulId: 'MK-RLD', matkulNama: 'Rangkaian Listrik DC' },
    { id: `${prefixId}-3`, ...basis, hari: 'Senin', sesiAwal: 4, sesiAkhir: 4, matkulId: 'MK-PSD', matkulNama: 'Pengantar Sains Data' },
    { id: `${prefixId}-4`, ...basis, hari: 'Selasa', sesiAwal: 1, sesiAkhir: 2, matkulId: 'MK-PIL', matkulNama: 'Praktikum Instalasi Listrik' },
    { id: `${prefixId}-5`, ...basis, hari: 'Rabu', sesiAwal: 3, sesiAkhir: 3, matkulId: 'MK-MTK', matkulNama: 'Matematika Teknik' },
    { id: `${prefixId}-6`, ...basis, hari: 'Kamis', sesiAwal: 1, sesiAkhir: 2, matkulId: 'MK-PIL', matkulNama: 'Praktikum Instalasi Listrik' },
    { id: `${prefixId}-7`, ...basis, hari: 'Kamis', sesiAwal: 4, sesiAkhir: 5, matkulId: 'MK-PIL', matkulNama: 'Praktikum Instalasi Listrik' },
    { id: `${prefixId}-8`, ...basis, hari: 'Jumat', sesiAwal: 1, sesiAkhir: 1, matkulId: 'MK-PSD', matkulNama: 'Pengantar Sains Data' },
    { id: `${prefixId}-9`, ...basis, hari: 'Jumat', sesiAwal: 2, sesiAkhir: 2, matkulId: 'MK-RLD', matkulNama: 'Rangkaian Listrik DC' },
  ];
}

/**
 * Data jadwal mentah: kelas PL1AA diampu Dr. Sri Mulyana di CU 205,
 * kelas PL1AB diampu Alif Subardono di CU 206.
 */
export const mockJadwalEntries: JadwalEntry[] = [
  ...buatJadwalKelas({
    kelas: mockKelasList[0],
    dosen: mockDosenList[0],
    ruang: mockRuangList[0],
    prefixId: 'JDW-PL1AA',
  }),
  ...buatJadwalKelas({
    kelas: mockKelasList[1],
    dosen: mockDosenList[1],
    ruang: mockRuangList[1],
    prefixId: 'JDW-PL1AB',
  }),
];