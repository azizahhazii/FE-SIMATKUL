import {
  HARI_LIST,
  SESI_LIST,
  TOTAL_SLOT,
  type HeatmapRow,
  type Jadwal,
  type PreviewMode,
} from "../types/penjadwalan";

export function slotKey(hari: string, sesi: number) {
  return `${hari}-${sesi}`;
}

/**
 * Ubah daftar jadwal menjadi baris-baris grid preview.
 *
 * Semua styling/layout tetap dilakukan oleh HeatmapGrid.
 * Utility ini hanya menyiapkan data yang dibutuhkan oleh grid,
 * termasuk data jadwal asli untuk tooltip hover.
 */
export function buildHeatmapRows(
  jadwal: Jadwal[],
  mode: PreviewMode,
  resourceLabels: string[] = [],
): HeatmapRow[] {
  const groups = new Map<string, Jadwal[]>();

  // Semua resource dari master data tetap tampil walaupun belum punya jadwal.
  for (const label of resourceLabels) {
    if (label) {
      groups.set(label, []);
    }
  }

  for (const item of jadwal) {
    const key =
      mode === "ruang"
        ? item.ruang
        : mode === "kelas"
          ? item.kelas
          : item.dosen;

    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()]
    .map(([label, items]) => {
      const slots: Record<string, number> = {};
      const slotJadwal: Record<string, Jadwal[]> = {};

      // Buat semua 25 slot terlebih dahulu.
      for (const hari of HARI_LIST) {
        for (const sesi of SESI_LIST) {
          const key = slotKey(hari, sesi);

          slots[key] = 0;
          slotJadwal[key] = [];
        }
      }

      // Masukkan jadwal ke slot yang sesuai.
      for (const item of items) {
        const key = slotKey(item.hari, item.sesi);

        slots[key] = (slots[key] ?? 0) + 1;
        slotJadwal[key] = [...(slotJadwal[key] ?? []), item];
      }

      const terisi = Object.values(slots).filter((n) => n > 0).length;
      const okupansi = Math.round((terisi / TOTAL_SLOT) * 100);
      const totalSks = items.reduce((sum, item) => sum + item.sks, 0);

      return {
        id: label,
        label,
        sublabel:
          mode === "dosen"
            ? `Beban Dosen ${totalSks} SKS`
            : `Okupansi ${okupansi}%`,
        slots,
        slotJadwal,
        adaBentrok: Object.values(slots).some((n) => n > 1),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function cariBentrok(
  jadwal: Jadwal[],
  kandidat: Pick<Jadwal, "hari" | "sesi" | "ruang" | "kelas" | "dosen">,
  ignoreId?: string,
): Jadwal[] {
  return jadwal.filter(
    (item) =>
      item.id !== ignoreId &&
      item.hari === kandidat.hari &&
      item.sesi === kandidat.sesi &&
      (item.ruang === kandidat.ruang ||
        item.kelas === kandidat.kelas ||
        item.dosen === kandidat.dosen),
  );
}

interface SlotUsage {
  dosen: Set<string>;
  kelas: Set<string>;
  ruang: Set<string>;
}

export function getSlotUsage(
  jadwal: Jadwal[],
  hari: string,
  sesi: string,
): SlotUsage {
  const usage: SlotUsage = {
    dosen: new Set(),
    kelas: new Set(),
    ruang: new Set(),
  };

  if (!hari || !sesi) return usage;

  for (const item of jadwal) {
    if (item.hari === hari && String(item.sesi) === sesi) {
      usage.dosen.add(item.dosen);
      usage.kelas.add(item.kelas);
      usage.ruang.add(item.ruang);
    }
  }

  return usage;
}
