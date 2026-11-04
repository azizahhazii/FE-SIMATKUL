import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Text } from "assets-design-system";

import {
  LaporanTabs,
  type LaporanTab,
} from "../components/laporan/LaporanTabs";
import { useAuth } from "../context/AuthContext";
import { PeriodeAkademikFilter } from "../components/laporan/PeriodeAkademikFilter";
import type { SelectOption } from "../components/master-data/SelectField";
import { apiRequest } from "../lib/axios";

interface PeriodeItem {
  id: number | string;
  nama?: string;
  nama_kurikulum?: string;
  tahun_akademik?: string;
  semester?: string;
}

interface ApiResponse<T> {
  message?: string;
  data: T;
}

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

export type LaporanOutletContext = {
  periodeId: string;
};

export function LaporanLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [periodeList, setPeriodeList] = useState<PeriodeItem[]>([]);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const periodeOptions: SelectOption[] = periodeList.map((periode) => ({
    value: String(periode.id),
    label:
      periode.nama ||
      periode.nama_kurikulum ||
      `${periode.semester ?? ""} ${periode.tahun_akademik ?? ""}`.trim() ||
      `Periode ${periode.id}`,
  }));

  useEffect(() => {
    async function fetchPeriodeList() {
      try {
        setIsLoading(true);
        const response = await apiRequest<ApiResponse<PeriodeItem[]>>(
          "/api/master-data/kurikulum",
          { method: "GET" },
        );

        const data = response.data || [];
        setPeriodeList(data);
      } catch (error) {
        console.error("Gagal mengambil daftar periode/kurikulum:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPeriodeList();
  }, []);

  const currentSegment = location.pathname.split("/").pop() ?? "dosen";
  const activeTab = PATH_TO_TAB[currentSegment] ?? "Jadwal Dosen";

  return (
    <div className="min-h-screen w-full bg-transparent">
      <main className="flex flex-1 flex-col gap-6 bg-transparent">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-primary-400">
              Hasil Penjadwalan
            </h1>

            <Text variant="b3" className="text-neutral-700">
              {isAdmin
                ? "Pantau hasil penjadwalan Dosen"
                : "Pantau hasil penjadwalan Dosen, Ruangan, dan Kelas"}
            </Text>
          </div>

          {/* ================= PERIODE ================= */}
          <div className="w-full sm:w-80">
            <PeriodeAkademikFilter
              options={periodeOptions}
              value={selectedPeriodeId}
              onChange={setSelectedPeriodeId}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* ================= TABS ================= */}
        <LaporanTabs
          activeTab={activeTab}
          onTabChange={(tab) => navigate(`/laporan/${TAB_TO_PATH[tab]}`)}
        />

        {/* ================= CONTENT ================= */}
        <Outlet
          context={{
            periodeId: selectedPeriodeId,
          }}
        />
      </main>
    </div>
  );
}

export default LaporanLayout;