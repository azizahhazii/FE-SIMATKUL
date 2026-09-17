import React from "react";
// Import komponen dari Design System temanmu jika sudah ada
// import { Button, Card, Input } from "nama-package-design-system";

const dummyPeriode = [
  {
    id: 1,
    title: "Genap 2026/2027 - 2",
    kurikulum: 425,
    ruang: 60,
    dosen: 63,
    kelas: 22,
    sesi: 5,
  },
  {
    id: 2,
    title: "Genap 2026/2027",
    kurikulum: 425,
    ruang: 60,
    dosen: 63,
    kelas: 22,
    sesi: 5,
  },
  {
    id: 3,
    title: "Gasal 2026/2027",
    kurikulum: 425,
    ruang: 60,
    dosen: 63,
    kelas: 22,
    sesi: 5,
  },
];

export function PeriodeAkademik() {
  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header Halaman */}
      <div>
        <h1 className="text-2xl font-bold text-teal-800">Master Data</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola kurikulum, ruang, dosen, kelas, dan sesi untuk setiap periode akademik
        </p>
      </div>

      {/* Bar Pencarian & Tombol Aksi */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Cari periode akademik"
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap">
          <span>+</span> Tambah Periode Akademik
        </button>
      </div>

      {/* List Card Periode Akademik */}
      <div className="space-y-4">
        {dummyPeriode.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm relative"
          >
            {/* Tombol Opsi Kanan Atas */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-md">
                •••
              </button>
              <button className="p-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                ↗
              </button>
            </div>

            {/* Title Card */}
            <span className="text-xs text-gray-400 font-medium">Periode Akademik</span>
            <h2 className="text-xl font-bold text-gray-800 mt-0.5 mb-4">
              {item.title}
            </h2>

            {/* Tag Indikator / Statistik */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
                <span>🔖</span> {item.kurikulum} <span className="font-normal text-amber-700">Data Kurikulum</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
                <span>🔑</span> {item.ruang} <span className="font-normal text-amber-700">Daftar Ruang</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
                <span>👥</span> {item.dosen} <span className="font-normal text-amber-700">Daftar Dosen</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
                <span>🪑</span> {item.kelas} <span className="font-normal text-amber-700">Daftar Kelas</span>
              </div>
              <div className="flex items-center gap-2 bg-amber-100/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900">
                <span>📞</span> {item.sesi} <span className="font-normal text-amber-700">Sesi</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}