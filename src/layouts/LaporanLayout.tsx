import { useId, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Text } from "assets-design-system";
import Calendar from "@solar-icons/react/time/Calendar";
import { dummyPeriodeAkademik } from "../data/periodeAkademik";
import {
  LaporanTabs,
  type LaporanTab,
} from "../components/laporan/LaporanTabs";

const TAB_TO_PATH: Record<LaporanTab, string> = {
  "Jadwal Dosen": "dosen",
  "Jadwal Ruang": "ruangan",
  "Jadwal Kelas": "kelas",
};

const PATH_TO_TAB: Record<string, LaporanTab> = {
  dosen: "Jadwal Dosen",
  ruangan: "Jadwal Ruang",
  ruang: "Jadwal Ruang",
  kelas: "Jadwal Kelas",
};

export type LaporanOutletContext = { periodeId: string };

export function LaporanLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const periodeSelectId = useId();

  // Default string kosong agar tulisan "Pilih periode akademik" pudar
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("");

  const currentSegment = location.pathname.split("/").pop() ?? "dosen";
  const activeTab = PATH_TO_TAB[currentSegment] ?? "Jadwal Dosen";

  return (
    <div className="w-full min-h-screen bg-transparent">
      <main className="flex flex-1 flex-col gap-6 bg-transparent">
        {/* Header & Filter Periode */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-primary-400">
              Hasil Penjadwalan
            </h1>
            <Text variant="b3" className="text-neutral-700">
              Pantau hasil penjadwalan Dosen, Ruangan, dan Kelas
            </Text>
          </div>

          {/* Filter Periode Akademik */}
          <div className="flex flex-col gap-1.5 sm:items-start">
            <label
              htmlFor={periodeSelectId}
              className="font-sans text-b3 font-medium text-neutral-1000"
            >
              Periode Akademik
            </label>

            <div className="relative min-w-[280px] sm:min-w-[320px]">
              {/* Ikon kalender (selalu pekat dengan text-neutral-1000) */}
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-1000">
                <Calendar weight="BoldDuotone" size={20} />
              </div>

              {/* Select (teks pudar jika belum dipilih) */}
              <select
                id={periodeSelectId}
                value={selectedPeriodeId}
                onChange={(e) => setSelectedPeriodeId(e.target.value)}
                className={`w-full appearance-none rounded-xl border border-neutral-600 bg-transparent py-2 pl-10 pr-9 text-sm font-medium transition-colors hover:border-neutral-700 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 ${
                  selectedPeriodeId === "" ? "text-neutral-700" : "text-neutral-1000"
                }`}
              >
                <option value="" disabled hidden>
                  Pilih periode akademik
                </option>
                {dummyPeriodeAkademik.map((periode) => (
                  <option key={periode.id} value={periode.id}>
                    {periode.nama}
                  </option>
                ))}
              </select>

              {/* Ikon panah kustom di kanan */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-700">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M6 9l6 6 6-6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <LaporanTabs
          activeTab={activeTab}
          onTabChange={(tab) => navigate(`/laporan/${TAB_TO_PATH[tab]}`)}
        />

        {/* Child Content */}
        <Outlet context={{ periodeId: selectedPeriodeId } satisfies LaporanOutletContext} />
      </main>
    </div>
  );
}