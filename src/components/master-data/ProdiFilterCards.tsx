import CodeSquare from "@solar-icons/react/it/CodeSquare";
import Bolt from "@solar-icons/react/ui/Bolt";
import TransmissionSquare from "@solar-icons/react/ui/HomeWifiAngle";
import TuningSquare from "@solar-icons/react/settings/TuningSquare2";

export const PRODI_LIST = [
  {
    id: "TRPL",
    nama: "TRPL",
    deskripsi: "Teknologi Rekayasa Perangkat Lunak",
    icon: CodeSquare,
  },
  {
    id: "TRE",
    nama: "TRE",
    deskripsi: "Teknologi Rekayasa Elektro",
    icon: Bolt,
  },
  {
    id: "TRI",
    nama: "TRI",
    deskripsi: "Teknologi Rekayasa Internet",
    icon: TransmissionSquare,
  },
  {
    id: "TRIK",
    nama: "TRIK",
    deskripsi: "Teknologi Rekayasa Instrumentasi dan Kontrol",
    icon: TuningSquare,
  },
] as const;

export type ProdiId = (typeof PRODI_LIST)[number]["id"];

interface ProdiFilterCardsProps {
  selected: ProdiId;
  onSelect: (id: ProdiId) => void;
  size?: "default" | "compact";
}

export function ProdiFilterCards({
  selected,
  onSelect,
  size = "default",
}: ProdiFilterCardsProps) {
  const isCompact = size === "compact";

  return (
    <div className="grid grid-cols-4 gap-3">
      {PRODI_LIST.map((prodi) => {
        const Icon = prodi.icon;
        const isSelected = selected === prodi.id;

        return (
          <button
            key={prodi.id}
            type="button"
            onClick={() => onSelect(prodi.id)}
            className={`flex flex-col items-center justify-center text-center shadow-e1 transition ${
              isCompact ? "gap-1.5 rounded-3 p-3" : "gap-2 rounded-4 p-6"
            } ${
              isSelected
                ? "border-[1.5px] border-primary-400 bg-primary-100/60"
                : "border-[1.5px] border-neutral-600 bg-white hover:bg-neutral-300"
            }`}
          >
            {/* LANGSUNG ICON, TANPA SPAN PEMBUNGKUS */}
            <Icon
              weight="BoldDuotone"
              className={`${
                isCompact ? "size-9" : "size-12"
              } ${
                isSelected
                  ? "text-primary-400"
                  : "text-neutral-800"
              }`}
            />

            <span
              className={`font-bold text-neutral-1000 ${
                isCompact ? "text-b4" : "text-b3"
              }`}
            >
              {prodi.nama}
            </span>

            <span className="line-clamp-2 text-b5 leading-tight text-neutral-800">
              {prodi.deskripsi}
            </span>
          </button>
        );
      })}
    </div>
  );
}