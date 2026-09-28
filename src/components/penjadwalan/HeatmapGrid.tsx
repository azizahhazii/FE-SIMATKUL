import { useState, type MouseEvent } from "react";

import { Input } from "assets-design-system";
import Magnifer from "@solar-icons/react/search/Magnifer";

import {
  HARI_LIST,
  SESI_LIST,
  type HeatmapRow,
  type Jadwal,
} from "../../types/penjadwalan";

import { slotKey } from "../../utils/penjadwalan";

const LABEL_WIDTH = "w-[360px] min-w-[360px]";

const CELL_COLOR = {
  kosong: "bg-[#FBEFE6]",
  terisi: "bg-[#D16E05]",
  bentrok: "bg-[#E5484D]",
} as const;

interface HeatmapGridProps {
  rows: HeatmapRow[];
  searchPlaceholder: string;
  emptyMessage: string;
  maxHeight?: string;
}

interface HoveredSlot {
  jadwal: Jadwal[];
  x: number;
  y: number;
}

export function HeatmapGrid({
  rows,
  searchPlaceholder,
  emptyMessage,
  maxHeight = "max-h-[245px]",
}: HeatmapGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [hoveredSlot, setHoveredSlot] = useState<HoveredSlot | null>(null);

  const filtered = rows.filter((row) =>
    row.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMouseEnter = (
    event: MouseEvent<HTMLDivElement>,
    jadwal: Jadwal[],
  ) => {
    if (jadwal.length === 0) return;

    setHoveredSlot({
      jadwal,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    setHoveredSlot((current) => {
      if (!current) return null;

      return {
        ...current,
        x: event.clientX,
        y: event.clientY,
      };
    });
  };

  const handleMouseLeave = () => {
    setHoveredSlot(null);
  };

  return (
    <div
      className="relative border-b border-neutral-600 last:border-b-0"
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`${maxHeight} overflow-y-auto`}
        onScroll={handleMouseLeave}
      >
        {/* ================= HEADER ================= */}
        <div className="sticky top-0 z-20 flex h-[62px] items-stretch bg-neutral-400">
          {/* Search */}
          <div
            className={`${LABEL_WIDTH} shrink-0 border-r border-neutral-600 p-3`}
          >
            <Input
              placeholder={searchPlaceholder}
              leftIcon={<Magnifer weight="LineDuotone" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="md"
            />
          </div>

          {/* Hari + Sesi */}
          <div className="flex min-w-0 flex-1">
            {HARI_LIST.map((hari, index) => (
              <div
                key={hari}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center border-neutral-600 ${
                  index < HARI_LIST.length - 1 ? "border-r" : ""
                }`}
              >
                <div className="text-b3 font-bold text-neutral-1000">
                  {hari}
                </div>

                <div className="mt-1 flex w-full justify-center gap-[5px]">
                  {SESI_LIST.map((sesi) => (
                    <span
                      key={sesi}
                      className="flex size-5 items-center justify-center rounded-[4px] bg-[#DCEFF5] text-[10px] font-semibold text-primary-600"
                    >
                      {sesi}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= BODY ================= */}
        {filtered.length > 0 ? (
          filtered.map((row) => (
            <div
              key={row.id}
              className="flex h-[61px] items-stretch border-b border-neutral-500 last:border-b-0"
            >
              {/* Resource */}
              <div
                className={`${LABEL_WIDTH} flex shrink-0 flex-col items-center justify-center border-r border-neutral-600 px-3 text-center`}
              >
                <div
                  className={`w-full truncate text-b3 ${
                    row.adaBentrok
                      ? "font-bold text-[#E5484D]"
                      : "text-neutral-1000"
                  }`}
                  title={row.label}
                >
                  {row.label}
                </div>

                <div
                  className="w-full truncate text-[10px] text-neutral-800"
                  title={row.sublabel}
                >
                  {row.sublabel}
                </div>
              </div>

              {/* Slot */}
              <div className="flex min-w-0 flex-1">
                {HARI_LIST.map((hari, index) => (
                  <div
                    key={hari}
                    className={`flex min-w-0 flex-1 items-center border-neutral-600 ${
                      index < HARI_LIST.length - 1 ? "border-r" : ""
                    }`}
                  >
                    {SESI_LIST.map((sesi) => {
                      const key = slotKey(hari, sesi);

                      const jumlah = row.slots[key] ?? 0;

                      const slotJadwal = row.slotJadwal[key] ?? [];

                      const kosong = jumlah === 0;

                      const bentrok = jumlah > 1;

                      const warna = kosong
                        ? CELL_COLOR.kosong
                        : bentrok
                          ? CELL_COLOR.bentrok
                          : CELL_COLOR.terisi;

                      return (
                        <div
                          key={sesi}
                          className="flex min-w-0 flex-1 items-center justify-center"
                        >
                          {kosong ? (
                            <div className={`size-5 rounded-[4px] ${warna}`} />
                          ) : (
                            <div
                              className={`size-5 cursor-help rounded-[4px] ${warna}`}
                              onMouseEnter={(event) =>
                                handleMouseEnter(event, slotJadwal)
                              }
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-b5 text-neutral-700">
            {emptyMessage}
          </div>
        )}
      </div>

      {/* ================= TOOLTIP ================= */}
      {hoveredSlot && (
        <div
          className="pointer-events-none fixed z-[9999] max-w-[225px] rounded-[4px] bg-[#D16E05] px-3 py-2 shadow-md"
          style={{
            left: Math.min(hoveredSlot.x + 12, window.innerWidth - 240),
            top: Math.min(hoveredSlot.y + 12, window.innerHeight - 95),
          }}
        >
          {hoveredSlot.jadwal.length === 1 ? (
            <>
              <div className="truncate text-[12px] font-bold leading-[15px] text-white">
                {hoveredSlot.jadwal[0].namaMataKuliah}
              </div>

              <div className="mt-0.5 truncate text-[10px] leading-[13px] text-white/90">
                {hoveredSlot.jadwal[0].kelas}
                {" · "}
                {hoveredSlot.jadwal[0].ruang}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-white">
                Jadwal Bentrok
              </div>

              {hoveredSlot.jadwal.map((item) => (
                <div
                  key={item.id}
                  className="border-t border-white/20 pt-1.5 first:border-t-0 first:pt-0"
                >
                  <div className="truncate text-[11px] font-bold leading-[14px] text-white">
                    {item.namaMataKuliah}
                  </div>

                  <div className="text-[10px] leading-[13px] text-white/90">
                    {item.kelas}
                    {" · "}
                    {item.ruang}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HeatmapGrid;
