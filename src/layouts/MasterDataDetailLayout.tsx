import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { Text } from "assets-design-system";
import { MasterDataStats } from "../components/master-data/MasterDataStats";
import {
  MasterDataTabs,
  type MasterDataTab,
} from "../components/master-data/MasterDataTabs";
import { dummyPeriodeAkademik } from "../data/periodeAkademik";
import type { PeriodeAkademik } from "../types/periodeAkademik";

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

export type MasterDataOutletContext = { periode: PeriodeAkademik };

export function MasterDataDetailLayout() {
  const { periodeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const periode = dummyPeriodeAkademik.find((p) => p.id === periodeId);
  const currentSegment = location.pathname.split("/").pop() ?? "kelas";
  const activeTab = PATH_TO_TAB[currentSegment] ?? "Kelas";

  if (!periode) {
    return (
      <Text variant="b1" className="p-8 text-neutral-800">
        Periode tidak ditemukan.
      </Text>
    );
  }

  return (
    <div className="w-full min-h-screen bg-transparent">
      <main className="flex flex-1 flex-col gap-6 bg-transparent">
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

        <MasterDataStats
          jumlahKurikulum={periode.jumlahKurikulum}
          jumlahRuang={periode.jumlahRuang}
          jumlahDosen={periode.jumlahDosen}
          jumlahKelas={periode.jumlahKelas}
          jumlahSesi={periode.jumlahSesi}
        />

        <MasterDataTabs
          activeTab={activeTab}
          onTabChange={(tab) =>
            navigate(`/master-data/${periodeId}/${TAB_TO_PATH[tab]}`)
          }
        />

        <Outlet context={{ periode } satisfies MasterDataOutletContext} />
      </main>
    </div>
  );
}