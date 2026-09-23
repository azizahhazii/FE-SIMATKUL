import { useState } from "react";
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
  // 62px header + 3 x 61px row = 245px
  maxHeight = "max-h-[245px]",
}: HeatmapGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredSlot, setHoveredSlot] = useState<HoveredSlot | null>(null);

  const filtered = rows.filter((row) =>
    row.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement>,
    jadwal: Jadwal[],
  ) => {
    if (jadwal.length === 0) return;

    setHoveredSlot({
      jadwal,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
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
      {/* =========================================================
          SATU SCROLL CONTAINER UNTUK HEADER + BODY
          
          Ini yang memperbaiki garis vertikal agar tidak miring.
          Header dan body sekarang menggunakan lebar yang sama persis.
      ========================================================= */}
      <div
        className={`${maxHeight} overflow-y-auto`}
        onScroll={handleMouseLeave}
      >
        {/* =======================================================
            HEADER
            Sticky supaya tetap terlihat ketika section di-scroll.
        ======================================================= */}
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

        {/* =======================================================
            BODY
        ======================================================= */}
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
                  className={`w-full truncate text-b5 ${
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
                            /* Slot kosong hanya indikator */
                            <div className={`size-5 rounded-[4px] ${warna}`} />
                          ) : (
                            /* Slot terisi hanya bisa di-hover */
                            <div
                              className={`size-5 rounded-[4px] ${warna} cursor-help`}
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

      {/* =========================================================
          TOOLTIP
          
          Fixed → tidak ikut menambah tinggi layout.
      ========================================================= */}
      {hoveredSlot && (
        <div
          className="pointer-events-none fixed z-[9999] w-[320px] rounded-[4px] bg-[#1F1F1F] px-4 py-3 shadow-lg"
          style={{
            left: Math.min(hoveredSlot.x + 14, window.innerWidth - 340),
            top: Math.min(hoveredSlot.y + 14, window.innerHeight - 175),
          }}
        >
          {hoveredSlot.jadwal.map((item, index) => (
            <div
              key={item.id}
              className={`relative pl-4 ${
                index > 0 ? "mt-3 border-t border-neutral-700 pt-3" : ""
              }`}
            >
              {/* Garis kiri dibuat sebagai elemen sendiri supaya lurus */}
              <span
                className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full bg-[#4A4A4A]"
                aria-hidden="true"
              />

              {hoveredSlot.jadwal.length > 1 && (
                <div className="mb-1 text-[10px] font-semibold text-[#FF8A8A]">
                  Jadwal Bentrok
                </div>
              )}

              {/* Mata Kuliah */}
              <div className="text-b4 font-bold leading-5 text-white">
                {item.namaMataKuliah}
              </div>

              {/* Dosen */}
              <div className="text-b4 leading-5 text-white">{item.dosen}</div>

              {/* Kelas + Ruang */}
              <div className="text-b4 leading-5 text-white">
                {item.kelas} · {item.ruang}
              </div>

              {/* Hari + Sesi */}
              <div className="text-b4 leading-5 text-white">
                {item.hari} · Sesi {item.sesi}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
