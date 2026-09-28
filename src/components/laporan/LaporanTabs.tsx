export type LaporanTab = "Jadwal Dosen" | "Jadwal Ruang" | "Jadwal Kelas";

interface LaporanTabsProps {
  activeTab: LaporanTab;
  onTabChange: (tab: LaporanTab) => void;
}

const TABS: LaporanTab[] = ["Jadwal Dosen", "Jadwal Ruang", "Jadwal Kelas"];

export function LaporanTabs({ activeTab, onTabChange }: LaporanTabsProps) {
  return (
    <div className="flex items-center gap-3">
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
              isActive
                ? "bg-primary-400 text-white shadow-sm border border-primary-400"
                : "border border-primary-400 bg-white text-primary-400 hover:bg-slate-50"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}