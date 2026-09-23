import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { Text } from "assets-design-system";

import { MasterDataStats } from "../components/master-data/MasterDataStats";
import {
  MasterDataTabs,
  type MasterDataTab,
} from "../components/master-data/MasterDataTabs";

import type { PeriodeAkademik } from "../types/periodeAkademik";
import { getKurikulumByIdApi } from "../services/api";

const TAB_TO_PATH: Record<MasterDataTab, string> = {
  Kurikulum: "kurikulum",
  Ruangan: "ruangan",
  Dosen: "dosen",
  Kelas: "kelas",
  Sesi: "sesi",
};

const PATH_TO_TAB: Record<string, MasterDataTab> = {
  kurikulum: "Kurikulum",
  ruangan: "Ruangan",
  dosen: "Dosen",
  kelas: "Kelas",
  sesi: "Sesi",
};

export type MasterDataOutletContext = {
  periode: PeriodeAkademik;
};

function mapKurikulumToPeriode(
  item: Awaited<ReturnType<typeof getKurikulumByIdApi>>,
): PeriodeAkademik {
  return {
    id: String(item.id),
    nama: item.nama,
    jumlahKurikulum: item.total_mata_kuliah,
    jumlahRuang: item.total_ruang,
    jumlahDosen: item.total_dosen,
    jumlahKelas: item.total_kelas,
    jumlahSesi: item.total_sesi,
  };
}

export function MasterDataDetailLayout() {
  const { periodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [periode, setPeriode] = useState<PeriodeAkademik | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const currentSegment = location.pathname.split("/").pop() ?? "kelas";

  const activeTab = PATH_TO_TAB[currentSegment] ?? "Kelas";

  /**
   * Ambil detail kurikulum berdasarkan ID dari URL.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPeriode() {
      if (!periodeId) {
        setPeriode(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getKurikulumByIdApi(periodeId);

        if (cancelled) return;

        setPeriode(mapKurikulumToPeriode(data));
      } catch (error) {
        if (cancelled) return;

        setPeriode(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data periode.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPeriode();

    return () => {
      cancelled = true;
    };
  }, [periodeId]);

  if (isLoading) {
    return (
      <div className="p-8">
        <Text variant="b1" className="text-neutral-800">
          Memuat data...
        </Text>
      </div>
    );
  }

  if (!periode) {
    return (
      <div className="p-8">
        <Text variant="b1" className="text-red-600">
          {errorMessage || "Periode tidak ditemukan."}
        </Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-transparent">
      <main className="flex flex-1 flex-col gap-6 bg-transparent">
        {/* ===================================================
            BREADCRUMB + TITLE
        =================================================== */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-b4 text-neutral-800">
            <button
              type="button"
              onClick={() => navigate("/master-data")}
              className="hover:underline"
            >
              Master Data
            </button>

            <span>&gt;</span>

            <span className="font-bold text-neutral-900">{periode.nama}</span>
          </div>

          <Text variant="h6" className="text-primary-400">
            {periode.nama}
          </Text>
        </div>

        {/* ===================================================
            STATS DARI BACKEND
        =================================================== */}
        <MasterDataStats
          jumlahKurikulum={periode.jumlahKurikulum}
          jumlahRuang={periode.jumlahRuang}
          jumlahDosen={periode.jumlahDosen}
          jumlahKelas={periode.jumlahKelas}
          jumlahSesi={periode.jumlahSesi}
        />

        {/* ===================================================
            TABS
        =================================================== */}
        <MasterDataTabs
          activeTab={activeTab}
          onTabChange={(tab) =>
            navigate(`/master-data/${periodeId}/${TAB_TO_PATH[tab]}`)
          }
        />

        {/* ===================================================
            CHILD PAGE
        =================================================== */}
        <Outlet
          context={{
            periode,
          }}
        />
      </main>
    </div>
  );
}

export default MasterDataDetailLayout;
