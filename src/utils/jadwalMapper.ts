import type { BarisLaporanJadwal, Hari, SelJadwal } from "../types/laporan";

const HARI_KERJA: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export interface RawPenjadwalanItem {
  id?: number | string;
  kode_matkul?: string;
  nama_matkul?: string;
  nama_dosen?: string | string[] | any;
  kode_kelas?: string;
  hari?: string;
  sesi?: number | number[] | string;
  nama_ruang?: string;
  [key: string]: any;
}

const capitalizeHari = (h?: string): Hari => {
  if (!h) return "Senin";
  const lower = String(h).trim().toLowerCase();
  const cap = (lower.charAt(0).toUpperCase() + lower.slice(1)) as Hari;
  return HARI_KERJA.includes(cap) ? cap : "Senin";
};

// Helper untuk mengekstrak array nama dosen secara aman dari berbagai tipe data
function extractDosenList(item: RawPenjadwalanItem): string[] {
  const raw = item.nama_dosen ?? item.dosen ?? item.namaDosen;
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((d) => (typeof d === "string" ? d.trim() : d?.nama || String(d)))
      .filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    return [raw.trim()];
  }
  return [];
}

// Helper untuk mengekstrak array sesi secara aman
function extractSesiList(rawSesi: any): number[] {
  if (Array.isArray(rawSesi)) {
    return rawSesi
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);
  }
  if (typeof rawSesi === "number" && !isNaN(rawSesi)) {
    return [rawSesi];
  }
  if (typeof rawSesi === "string") {
    return rawSesi
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);
  }
  return [];
}

// --- 1. MAPPER JADWAL KELAS ---
export function mapToJadwalKelas(
  rawList: RawPenjadwalanItem[] = []
): BarisLaporanJadwal<{ id: string; nama: string }>[] {
  if (!Array.isArray(rawList)) return [];
  const grouped: Record<string, RawPenjadwalanItem[]> = {};

  for (const item of rawList) {
    if (!item) continue;
    const key = item.kode_kelas || item.nama_kelas || item.kelas || "Tanpa Kelas";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return Object.entries(grouped).map(([kodeKelas, items]) => {
    return createBarisMatrix(
      { id: kodeKelas, nama: kodeKelas },
      items,
      (item) => {
        const dosenList = extractDosenList(item);
        const dosenStr = dosenList.join(", ");
        const ruangStr = item.nama_ruang || item.ruang || "";
        return [dosenStr, ruangStr].filter(Boolean).join(" - ");
      }
    );
  });
}

// --- 2. MAPPER JADWAL DOSEN ---
export function mapToJadwalDosen(
  rawList: RawPenjadwalanItem[] = []
): BarisLaporanJadwal<{ id: string; nama: string; bebanSks?: number }>[] {
  if (!Array.isArray(rawList)) return [];
  const grouped: Record<string, RawPenjadwalanItem[]> = {};

  for (const item of rawList) {
    if (!item) continue;
    const dosenList = extractDosenList(item);
    const finalDosenList = dosenList.length > 0 ? dosenList : ["Tanpa Dosen"];

    for (const namaDosen of finalDosenList) {
      if (!grouped[namaDosen]) grouped[namaDosen] = [];
      grouped[namaDosen].push(item);
    }
  }

  return Object.entries(grouped).map(([namaDosen, items]) => {
    // Hitung total SKS / Beban Dosen
    const totalSks = items.reduce((acc, curr) => {
      const sesiList = extractSesiList(curr.sesi);
      return acc + (sesiList.length || 1);
    }, 0);

    return createBarisMatrix(
      { id: namaDosen, nama: namaDosen, bebanSks: totalSks },
      items,
      (item) => {
        const kelasStr = item.kode_kelas || item.kelas || "";
        const ruangStr = item.nama_ruang || item.ruang || "";
        return [kelasStr, ruangStr].filter(Boolean).join(" - ");
      }
    );
  });
}

// --- 3. MAPPER JADWAL RUANG ---
export function mapToJadwalRuang(
  rawList: RawPenjadwalanItem[] = []
): BarisLaporanJadwal<{ id: string; nama: string }>[] {
  if (!Array.isArray(rawList)) return [];
  const grouped: Record<string, RawPenjadwalanItem[]> = {};

  for (const item of rawList) {
    if (!item) continue;
    const key = item.nama_ruang || item.ruang || "Tanpa Ruang";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return Object.entries(grouped).map(([namaRuang, items]) => {
    return createBarisMatrix(
      { id: namaRuang, nama: namaRuang },
      items,
      (item) => {
        const dosenList = extractDosenList(item);
        const dosenStr = dosenList.join(", ");
        const kelasStr = item.kode_kelas || item.kelas || "";
        return [dosenStr, kelasStr].filter(Boolean).join(" - ");
      }
    );
  });
}

// --- HELPER UNTUK PROSES SEBAR KE MATRIKS SESI (1 - 12) ---
function createBarisMatrix<TInfo>(
  info: TInfo,
  items: RawPenjadwalanItem[],
  getKeterangan: (item: RawPenjadwalanItem) => string
): BarisLaporanJadwal<TInfo> {
  const sesiMap: Record<number, Record<Hari, SelJadwal[]>> = {};
  for (let s = 1; s <= 12; s++) {
    sesiMap[s] = { Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [] };
  }

  for (const item of items) {
    if (!item) continue;
    const hari = capitalizeHari(item.hari);
    const sesiList = extractSesiList(item.sesi);

    if (sesiList.length === 0) continue;

    const sesiAwal = sesiList[0];
    const sesiAkhir = sesiList[sesiList.length - 1];

    const cellData: SelJadwal = {
      entryId: `${item.id ?? Math.random()}-${hari}-${sesiAwal}`,
      matkulNama: item.nama_matkul || item.matkul || "",
      keterangan: getKeterangan(item),
      sesiAwal,
      sesiAkhir,
    };

    for (const s of sesiList) {
      if (sesiMap[s]?.[hari]) {
        sesiMap[s][hari].push(cellData);
      }
    }
  }

  const jadwalPerSesi = Object.keys(sesiMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((sesi) => ({
      sesi,
      perHari: sesiMap[sesi],
    }));

  return { info, jadwalPerSesi };
}