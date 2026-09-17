const TABS = ["Kurikulum", "Ruangan", "Dosen", "Kelas", "Sesi"] as const;

export type MasterDataTab = (typeof TABS)[number];

interface MasterDataTabsProps {
  activeTab: MasterDataTab;
  onTabChange: (tab: MasterDataTab) => void;
}

export function MasterDataTabs({
  activeTab,
  onTabChange,
}: MasterDataTabsProps) {
  return (
    <div className="flex items-center gap-2">
      {TABS.map((tab) => {
        const isActive = tab === activeTab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`rounded-2 px-5 py-2 text-b4 font-bold transition ${
              isActive
                ? "bg-primary-400 text-white shadow-e1"
                : "border border-primary-400 bg-white text-primary-400 hover:bg-primary-100"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}