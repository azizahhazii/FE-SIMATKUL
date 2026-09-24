import type { ReactNode } from 'react';
import { DAFTAR_HARI, type BarisLaporanJadwal, type Hari } from '../../types/laporan';

export interface JadwalMatrixTableProps<TInfo> {
  data: BarisLaporanJadwal<TInfo>[];

  labelKolomInfo: string;

  renderInfo: (info: TInfo) => ReactNode;
  loading?: boolean;
}


const JUMLAH_KOLOM = 2 + DAFTAR_HARI.length;

const TINGGI_MINIMUM_BARIS = 'min-h-[72px]';


export function JadwalMatrixTable<TInfo>({
  data,
  labelKolomInfo,
  renderInfo,
  loading = false,
}: JadwalMatrixTableProps<TInfo>) {
  return (
    <div className="w-full bg-neutral-100">
      <table className="w-full border-collapse text-left">
        <thead className="bg-neutral-400">
          <tr>
            <th className="sticky left-0 z-10 w-1/5 border-r border-neutral-400 bg-neutral-400 px-3 py-5 text-center text-sm font-bold text-neutral-1000">
              {labelKolomInfo}
            </th>
            <th className="w-20 border-r border-neutral-400 bg-neutral-400 px-3 py-3 text-center text-sm font-bold text-neutral-1000">
              Sesi
            </th>
            {DAFTAR_HARI.map((hari) => (
              <th
                key={hari}
                className="px-3 py-3 text-center text-sm font-bold text-neutral-1000"
              >
                {hari}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-neutral-100">
          {/* Spacer pemberi jarak antara header dan isi tabel */}
          <tr className="h-2 bg-neutral-100">
            <td className="sticky left-0 z-10 border-r border-neutral-400 bg-neutral-100" />
            <td className="border-r border-neutral-400" />
            <td colSpan={DAFTAR_HARI.length} />
          </tr>

          {loading ? (
            <tr>
              <td colSpan={JUMLAH_KOLOM} className="p-8 text-center text-xs text-neutral-700">
                Memuat data laporan...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={JUMLAH_KOLOM} className="p-8 text-center text-xs text-neutral-700">
                Belum ada data jadwal untuk filter ini.
              </td>
            </tr>
          ) : (
            data.map((barisEntitas, indexEntitas) => (
              <BarisEntitasJadwal
                key={indexEntitas}
                baris={barisEntitas}
                renderInfo={renderInfo}
                isBarisTerakhir={indexEntitas === data.length - 1}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface BarisEntitasJadwalProps<TInfo> {
  baris: BarisLaporanJadwal<TInfo>;
  renderInfo: (info: TInfo) => ReactNode;
  isBarisTerakhir: boolean;
}

/** Satu entitas (dosen/ruang/kelas) dirender sebagai N baris <tr> (satu per sesi). */
function BarisEntitasJadwal<TInfo>({
  baris,
  renderInfo,
  isBarisTerakhir,
}: BarisEntitasJadwalProps<TInfo>) {
  const jumlahBarisSesi = baris.jadwalPerSesi.length;
  const sesiTertutupSampai: Partial<Record<Hari, number>> = {};

  return (
    <>
      {baris.jadwalPerSesi.map((barisSesi, indexSesi) => {
        const isSesiTerakhirDiEntitasIni = indexSesi === jumlahBarisSesi - 1;
        const tampilkanBorderBawah = isSesiTerakhirDiEntitasIni && !isBarisTerakhir;

        return (
          <tr
            key={barisSesi.sesi}
            className={`h-1 ${tampilkanBorderBawah ? 'border-b-2 border-neutral-500' : ''}`}
          >
            {/* Pembatas 1: Sebelah kanan kolom Nama Dosen */}
            {indexSesi === 0 && (
              <td
                rowSpan={jumlahBarisSesi}
                className="sticky left-0 z-10 border-r border-neutral-400 bg-neutral-100 px-3 py-3.5 text-center align-middle"
              >
                <div className="flex flex-col items-center justify-center text-xs">
                  {renderInfo(baris.info)}
                </div>
              </td>
            )}

            {/* Pembatas 2: Sebelah kanan kolom Sesi */}
            <td className="h-full border-r border-neutral-400 px-3 py-3.5 text-center align-middle">
              <span className={`inline-flex w-full max-w-[52px] items-center justify-center rounded-2 bg-[#0298AB1A] text-xs font-bold text-primary-500 ${TINGGI_MINIMUM_BARIS}`}>
                {barisSesi.sesi}
              </span>
            </td>

            {DAFTAR_HARI.map((hari) => {
              const sudahTertutupRowSpan = (sesiTertutupSampai[hari] ?? 0) >= barisSesi.sesi;
              if (sudahTertutupRowSpan) {
                return null;
              }

              const selJadwalHariIni = barisSesi.perHari[hari];
              const adaJadwal = selJadwalHariIni && selJadwalHariIni.length > 0;

              const entryTunggal = selJadwalHariIni?.length === 1 ? selJadwalHariIni[0] : undefined;
              const jumlahSesiSpan = entryTunggal ? entryTunggal.sesiAkhir - entryTunggal.sesiAwal + 1 : 1;

              if (entryTunggal && jumlahSesiSpan > 1) {
                sesiTertutupSampai[hari] = entryTunggal.sesiAkhir;
              }

              // Pengiraan ketinggian tepat: 72px (1 kotak) + 28px (jarak/padding antara baris)
              const tinggiPresisi = `${jumlahSesiSpan * 72 + (jumlahSesiSpan - 1) * 28}px`;

              return (
                <td key={hari} rowSpan={jumlahSesiSpan} className="h-full px-2.5 py-3.5 align-middle">
                  {!adaJadwal ? (
                    <div
                      className={`flex h-full items-center justify-center rounded-2 bg-neutral-300 text-center text-xs text-neutral-700 ${TINGGI_MINIMUM_BARIS}`}
                    >
                      -
                    </div>
                  ) : (
                    <div className="flex h-full flex-col gap-2">
                      {selJadwalHariIni.map((sel) => (
                        <div
                          key={sel.entryId}
                          className="flex h-full flex-1 flex-col justify-center rounded-2 bg-[#D16E051A] px-2.5 py-2 text-center"
                          style={{ minHeight: tinggiPresisi }}
                        >
                          <div className="text-xs font-bold leading-snug text-secondary-500">
                            {sel.matkulNama}
                          </div>
                          <div className="mt-0.5 text-[11px] leading-tight text-secondary-400">
                            {sel.keterangan}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}