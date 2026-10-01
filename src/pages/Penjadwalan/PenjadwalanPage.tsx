import { useEffect, useMemo, useState } from "react";

import { Text } from "assets-design-system";

import { MasterDataToolbar } from "../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/master-data/DataTable";
import { RowActions } from "../../components/master-data/RowActions";
import { ModalHapusData } from "../../components/master-data/ModalHapusData";
import { SelectField } from "../../components/master-data/SelectField";
import { PreviewPenjadwalan } from "../../components/penjadwalan/PreviewPenjadwalan";

import { ModalFormJadwal, type JadwalFormData } from "./ModalFormJadwal";

import {
  createPenjadwalanApi,
  deletePenjadwalanApi,
  getKurikulumApi,
  getMataKuliahByKurikulumApi,
  getPenjadwalanByKurikulumApi,
  getPenjadwalanFormOptionsApi,
  updatePenjadwalanApi,
  type MataKuliahApiItem,
  type PenjadwalanApiItem,
  type PenjadwalanFormOptionsApi,
} from "../../services/api";

import { cariBentrok } from "../../utils/penjadwalan";

import type { Hari, Jadwal, Sesi } from "../../types/penjadwalan";

import type { ProdiId } from "../../components/master-data/ProdiFilterCards";

const EMPTY_STATE = "Pilih periode akademik untuk melanjutkan";

interface PeriodeOption {
  value: string;
  label: string;
}

/**
 * Pastikan nilai selalu array.
 */
function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Backend dapat mengembalikan hari
 * dengan huruf kecil.
 *
 * FE tetap memakai format desain:
 * Senin, Selasa, dst.
 */
function normalizeHari(value: string): Hari {
  const hari = value.trim().toLowerCase();

  switch (hari) {
    case "senin":
      return "Senin";

    case "selasa":
      return "Selasa";

    case "rabu":
      return "Rabu";

    case "kamis":
      return "Kamis";

    case "jumat":
      return "Jumat";

    default:
      return "Senin";
  }
}

/**
 * Ambil ID sesi dari response BE.
 *
 * Bisa datang dari:
 * - sesi_ids
 * - sesi[].id
 */
function getSesiIds(item: PenjadwalanApiItem): number[] {
  if (Array.isArray(item.sesi_ids) && item.sesi_ids.length > 0) {
    return item.sesi_ids;
  }

  if (Array.isArray(item.sesi)) {
    return item.sesi
      .map((sesi) => Number(sesi.id))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  return [];
}

/**
 * Ambil nama dosen.
 */
function getDosenNames(item: PenjadwalanApiItem): string[] {
  if (Array.isArray(item.dosen)) {
    return item.dosen.map((dosen) => dosen.nama);
  }

  if (Array.isArray(item.dosen_ids)) {
    return item.dosen_ids.map((id) => String(id));
  }

  if (item.nama_dosen) {
    return [item.nama_dosen];
  }

  return [];
}

/**
 * Ubah ID sesi BE menjadi nomor urut Sesi 1, 2, 3, dst.
 *
 * Urutan mengikuti data form-options BE.
 */
function mapSesiIdsToNumbers(
  sesiIds: number[],
  options: PenjadwalanFormOptionsApi,
): Sesi[] {
  return sesiIds
    .map((sesiId) => {
      const index = options.sesi.findIndex(
        (sesi) => Number(sesi.id) === Number(sesiId),
      );

      return index >= 0 ? index + 1 : null;
    })
    .filter(
      (value): value is number => value !== null && value >= 1 && value <= 5,
    ) as Sesi[];
}

/**
 * Mapping response API ke type Jadwal yang
 * SUDAH dipakai UI sekarang.
 *
 * Tidak mengubah struktur component UI.
 */
function mapApiToJadwal(
  item: PenjadwalanApiItem,
  options: PenjadwalanFormOptionsApi,
  mataKuliah: MataKuliahApiItem[],
): Jadwal {
  const mataKuliahItem = safeArray(mataKuliah).find(
    (data) => Number(data.id) === Number(item.matkul_id),
  );

  const kelasItem = safeArray(options.kelas).find(
    (data) => Number(data.id) === Number(item.kelas_id),
  );

  const ruangItem = safeArray(options.ruang).find(
    (data) => Number(data.id) === Number(item.ruang_id),
  );

  const sesiIds = getSesiIds(item);

  const sesiNumbers = mapSesiIdsToNumbers(sesiIds, options);

  const dosenNames = getDosenNames(item);

  const kodeMK = item.kode_mk ?? item.kode_matkul ?? mataKuliahItem?.kode ?? "";

  return {
    /**
     * ID dari backend.
     *
     * Ini yang dipakai untuk:
     * PUT /api/penjadwalan/:id
     * DELETE /api/penjadwalan/:id
     */
    id: String(item.id),

    prodi: (mataKuliahItem?.prodi ?? kelasItem?.prodi ?? "TRPL") as ProdiId,

    kodeMK: String(kodeMK),

    namaMataKuliah: item.nama_matkul ?? mataKuliahItem?.nama ?? "",

    dosen: dosenNames.join(", "),

    kelas: item.kode_kelas ?? kelasItem?.kode_kelas ?? "",

    hari: normalizeHari(item.hari),

    sesi: (sesiNumbers[0] ?? 1) as Sesi,

    ruang: item.nama_ruang ?? ruangItem?.nama ?? "",

    sks: Number(item.sks ?? mataKuliahItem?.sks ?? 0),
  };
}

export function PenjadwalanPage() {
  const [periodeId, setPeriodeId] = useState("");

  const [periodeOptions, setPeriodeOptions] = useState<PeriodeOption[]>([]);

  const [formOptions, setFormOptions] =
    useState<PenjadwalanFormOptionsApi | null>(null);

  const [, setMataKuliah] = useState<MataKuliahApiItem[]>([]);

  const [items, setItems] = useState<Jadwal[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [prefill, setPrefill] = useState<JadwalFormData | null>(null);

  const [editItem, setEditItem] = useState<Jadwal | null>(null);

  const [deleteItem, setDeleteItem] = useState<Jadwal | null>(null);

  const hasPeriode = Boolean(periodeId);

  /**
   * ========================================================
   * GET PERIODE
   * ========================================================
   */
  useEffect(() => {
    let cancelled = false;

    async function loadPeriode() {
      try {
        const data = await getKurikulumApi();

        if (cancelled) {
          return;
        }

        setPeriodeOptions(
          safeArray(data).map((periode) => ({
            value: String(periode.id),
            label: periode.nama,
          })),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil periode akademik.",
        );
      }
    }

    void loadPeriode();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * ========================================================
   * GET DATA PENJADWALAN
   * ========================================================
   *
   * Saat admin memilih periode:
   *
   * GET form-options
   * GET penjadwalan berdasarkan kurikulum
   * GET mata kuliah lengkap
   */
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!periodeId) {
        setFormOptions(null);

        setMataKuliah([]);

        setItems([]);

        setErrorMessage("");

        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      setErrorMessage("");

      try {
        const [options, jadwalData, mataKuliahData] = await Promise.all([
          getPenjadwalanFormOptionsApi(periodeId),

          getPenjadwalanByKurikulumApi(periodeId),

          getMataKuliahByKurikulumApi(periodeId),
        ]);

        if (cancelled) {
          return;
        }

        const normalizedOptions: PenjadwalanFormOptionsApi = {
          ruang: safeArray(options?.ruang),

          dosen: safeArray(options?.dosen),

          sesi: safeArray(options?.sesi),

          kelas: safeArray(options?.kelas),

          mata_kuliah: safeArray(options?.mata_kuliah),
        };

        const normalizedMataKuliah = safeArray(mataKuliahData);

        setFormOptions(normalizedOptions);

        setMataKuliah(normalizedMataKuliah);

        setItems(
          safeArray(jadwalData).map((item) =>
            mapApiToJadwal(item, normalizedOptions, normalizedMataKuliah),
          ),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setFormOptions(null);

        setItems([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data penjadwalan.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      cancelled = true;
    };
  }, [periodeId]);

  /**
   * ========================================================
   * FILTER SEARCH
   * ========================================================
   */
  const visible = useMemo(() => (hasPeriode ? items : []), [hasPeriode, items]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return visible;
    }

    return visible.filter((item) =>
      item.namaMataKuliah.toLowerCase().includes(query),
    );
  }, [visible, searchQuery]);

  /**
   * ========================================================
   * OPTIONS MODAL
   * ========================================================
   *
   * Modal kamu saat ini menggunakan string[]
   * jadi kita mapping ID API -> nama untuk UI.
   */
  const opsiMataKuliah = useMemo(
    () => safeArray(formOptions?.mata_kuliah).map((item) => item.nama),
    [formOptions],
  );

  const opsiDosen = useMemo(
    () => safeArray(formOptions?.dosen).map((item) => item.nama),
    [formOptions],
  );

  const opsiKelas = useMemo(
    () => safeArray(formOptions?.kelas).map((item) => item.kode_kelas),
    [formOptions],
  );

  const opsiRuang = useMemo(
    () => safeArray(formOptions?.ruang).map((item) => item.nama),
    [formOptions],
  );

  const closeForm = () => {
    setIsAddOpen(false);

    setPrefill(null);

    setEditItem(null);

    setErrorMessage("");
  };

  /**
   * ========================================================
   * UBAH FORM -> PAYLOAD API
   * ========================================================
   */
  const getPayload = (data: JadwalFormData) => {
    if (!formOptions || !periodeId) {
      return null;
    }

    const matkul = formOptions.mata_kuliah.find(
      (item) => item.nama === data.namaMataKuliah,
    );

    const dosen = formOptions.dosen.find((item) => item.nama === data.dosen);

    const kelas = formOptions.kelas.find(
      (item) => item.kode_kelas === data.kelas,
    );

    const ruang = formOptions.ruang.find((item) => item.nama === data.ruang);

    const sesiIndex = Number(data.sesi);

    const sesi = formOptions.sesi[sesiIndex - 1];

    if (!matkul || !dosen || !kelas || !ruang || !sesi) {
      return null;
    }

    return {
      kurikulum_id: Number(periodeId),

      matkul_id: Number(matkul.id),

      ruang_id: Number(ruang.id),

      kelas_id: Number(kelas.id),

      hari: data.hari,

      sesi_ids: [Number(sesi.id)],

      dosen_ids: [Number(dosen.id)],
    };
  };

  /**
   * ========================================================
   * VALIDASI BENTROK
   * ========================================================
   */
  const validasi = (data: JadwalFormData, ignoreId?: string) => {
    const bentrok = cariBentrok(
      items,
      {
        hari: data.hari as Hari,

        sesi: Number(data.sesi) as Sesi,

        ruang: data.ruang,

        kelas: data.kelas,

        dosen: data.dosen,
      },
      ignoreId,
    );

    if (bentrok.length === 0) {
      return true;
    }

    setErrorMessage(
      `Bentrok dengan ${bentrok[0].namaMataKuliah} (${bentrok[0].kelas}, ${bentrok[0].ruang}) di ${data.hari} sesi ${data.sesi}.`,
    );

    return false;
  };

  /**
   * ========================================================
   * ADD
   * ========================================================
   */
  const handleAdd = async (data: JadwalFormData) => {
    if (!validasi(data)) {
      return;
    }

    const payload = getPayload(data);

    if (!payload) {
      setErrorMessage("Data pilihan penjadwalan tidak ditemukan.");

      return;
    }

    try {
      await createPenjadwalanApi(payload);

      /**
       * Setelah berhasil:
       * reload dari BE supaya Preview + tabel
       * memakai sumber data yang sama.
       */
      await reloadCurrentPeriode();

      closeForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menambahkan jadwal.",
      );
    }
  };

  /**
   * ========================================================
   * EDIT
   * ========================================================
   */
  const handleEdit = async (data: JadwalFormData) => {
    if (!editItem) {
      return;
    }

    if (!validasi(data, editItem.id)) {
      return;
    }

    const payload = getPayload(data);

    if (!payload) {
      setErrorMessage("Data pilihan penjadwalan tidak ditemukan.");

      return;
    }

    try {
      await updatePenjadwalanApi(editItem.id, payload);

      await reloadCurrentPeriode();

      closeForm();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengubah jadwal.",
      );
    }
  };

  /**
   * ========================================================
   * DELETE
   * ========================================================
   */
  const handleDelete = async () => {
    if (!deleteItem) {
      return;
    }

    try {
      await deletePenjadwalanApi(deleteItem.id);

      await reloadCurrentPeriode();

      setDeleteItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus jadwal.",
      );

      setDeleteItem(null);
    }
  };

  /**
   * ========================================================
   * RELOAD PERIODE AKTIF
   * ========================================================
   */
  async function reloadCurrentPeriode() {
    if (!periodeId) {
      return;
    }

    try {
      const [options, jadwalData, mataKuliahData] = await Promise.all([
        getPenjadwalanFormOptionsApi(periodeId),

        getPenjadwalanByKurikulumApi(periodeId),

        getMataKuliahByKurikulumApi(periodeId),
      ]);

      const normalizedOptions: PenjadwalanFormOptionsApi = {
        ruang: safeArray(options?.ruang),

        dosen: safeArray(options?.dosen),

        sesi: safeArray(options?.sesi),

        kelas: safeArray(options?.kelas),

        mata_kuliah: safeArray(options?.mata_kuliah),
      };

      const normalizedMataKuliah = safeArray(mataKuliahData);

      setFormOptions(normalizedOptions);

      setMataKuliah(normalizedMataKuliah);

      setItems(
        safeArray(jadwalData).map((item) =>
          mapApiToJadwal(item, normalizedOptions, normalizedMataKuliah),
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui data penjadwalan.",
      );
    }
  }

  /**
   * ========================================================
   * EDIT FORM
   * ========================================================
   */
  const toFormData = (item: Jadwal): JadwalFormData => ({
    prodi: item.prodi,

    namaMataKuliah: item.namaMataKuliah,

    dosen: item.dosen,

    kelas: item.kelas,

    hari: item.hari,

    sesi: String(item.sesi),

    ruang: item.ruang,
  });

  const columns: DataTableColumn<Jadwal>[] = [
    {
      key: "mataKuliah",

      header: "Mata Kuliah",

      render: (item) => (
        <span className="flex flex-col">
          <span className="text-b5 text-neutral-800">
            {item.prodi} {item.kodeMK}
          </span>

          <span className="text-b3 text-neutral-1000">
            {item.namaMataKuliah}
          </span>
        </span>
      ),
    },

    {
      key: "dosen",

      header: "Dosen",

      align: "center",

      width: "w-[22%]",

      render: (item) => item.dosen,
    },

    {
      key: "kelas",

      header: "Kelas",

      align: "center",

      width: "w-[10%]",

      render: (item) => item.kelas,
    },

    {
      key: "hari",

      header: "Hari",

      align: "center",

      width: "w-[10%]",

      render: (item) => item.hari,
    },

    {
      key: "sesi",

      header: "Sesi",

      align: "center",

      width: "w-[8%]",

      render: (item) => item.sesi,
    },

    {
      key: "ruang",

      header: "Ruang",

      align: "center",

      width: "w-[12%]",

      render: (item) => item.ruang,
    },

    {
      key: "aksi",

      header: "Aksi",

      align: "center",

      width: "w-24",

      render: (item) => (
        <RowActions
          entityLabel="Jadwal"
          onDelete={() => setDeleteItem(item)}
          onEdit={() => setEditItem(item)}
        />
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-neutral-300">
      <main className="flex flex-1 flex-col gap-6 p-10">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Text variant="h4" className="text-primary-400">
              Penjadwalan
            </Text>

            <Text variant="b2" className="text-neutral-800">
              Kelola jadwal mata kuliah untuk setiap periode akademik
            </Text>
          </div>

          <div className="w-[340px]">
            <SelectField
              label="Periode Akademik"
              placeholder="Pilih periode akademik"
              options={periodeOptions}
              value={periodeId}
              onChange={setPeriodeId}
            />
          </div>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="rounded-2 border border-red-200 bg-red-50 px-4 py-3">
            <Text variant="b4" className="text-red-700">
              {errorMessage}
            </Text>
          </div>
        )}

        {/* PREVIEW */}
        <PreviewPenjadwalan
          jadwal={visible}
          hasPeriode={hasPeriode}
          opsiRuang={opsiRuang}
          opsiKelas={opsiKelas}
          opsiDosen={opsiDosen}
        />

        {/* TABLE */}
        <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
          <MasterDataToolbar
            searchPlaceholder="Cari nama mata kuliah"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionLabel="Tambah Jadwal"
            onAction={() => setIsAddOpen(true)}
            showFilter
          />

          <DataTable
            columns={columns}
            data={filtered}
            getRowKey={(item) => item.id}
            emptyMessage={
              isLoading
                ? "Memuat data penjadwalan..."
                : hasPeriode
                  ? "Data jadwal tidak ditemukan."
                  : EMPTY_STATE
            }
          />
        </div>
      </main>

      {/* TAMBAH */}
      <ModalFormJadwal
        mode="tambah"
        isOpen={isAddOpen}
        initialData={prefill ?? undefined}
        opsiMataKuliah={opsiMataKuliah}
        opsiDosen={opsiDosen}
        opsiKelas={opsiKelas}
        opsiRuang={opsiRuang}
        jadwal={items}
        errorMessage={errorMessage}
        onClose={closeForm}
        onSave={handleAdd}
      />

      {/* EDIT */}
      <ModalFormJadwal
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={editItem ? toFormData(editItem) : undefined}
        opsiMataKuliah={opsiMataKuliah}
        opsiDosen={opsiDosen}
        opsiKelas={opsiKelas}
        opsiRuang={opsiRuang}
        jadwal={items}
        ignoreId={editItem?.id}
        errorMessage={errorMessage}
        onClose={closeForm}
        onSave={handleEdit}
      />

      {/* HAPUS */}
      <ModalHapusData
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}

export default PenjadwalanPage;
