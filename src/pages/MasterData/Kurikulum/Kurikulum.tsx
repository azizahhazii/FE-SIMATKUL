import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { MasterDataToolbar } from "../../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/master-data/DataTable";
import { RowActions } from "../../../components/master-data/RowActions";
import { ModalHapusData } from "../../../components/master-data/ModalHapusData";

import {
  ModalFormMataKuliah,
  type MataKuliahFormData,
} from "./ModalFormMataKuliah";

import {
  createMataKuliahApi,
  deleteMataKuliahApi,
  getMataKuliahByKurikulumApi,
  updateMataKuliahApi,
  type MataKuliahApiItem,
  type MataKuliahPayload,
} from "../../../services/api";

interface KurikulumItem extends MataKuliahFormData {
  id: string;
}

/**
 * Mapping data dari backend ke bentuk yang dipakai tabel/modal FE.
 *
 * Mapping penting:
 *
 * BE `kelompok`    → FE `tipe`
 * BE `tipe_kelas`  → FE `kelompok`
 */
function mapApiToItem(item: MataKuliahApiItem): KurikulumItem {
  return {
    id: String(item.id),
    prodi: item.prodi as MataKuliahFormData["prodi"],
    namaMataKuliah: item.nama,
    kodeMK: String(item.kode),
    semester: String(item.semester),
    sks: String(item.sks),

    // Di FE namanya "kelompok", tapi nilainya MKK/MKDU.
    kelompok: item.tipe_kelas,

    jenis: item.jenis,

    // Di FE namanya "tipe", tapi nilainya Teori/Praktikum.
    tipe: item.kelompok,
  };
}

/**
 * Mapping data form FE ke payload yang diminta backend.
 */
function mapFormToPayload(data: MataKuliahFormData): MataKuliahPayload {
  return {
    kode: Number(data.kodeMK),
    nama: data.namaMataKuliah.trim(),
    sks: Number(data.sks),
    prodi: data.prodi,
    jenis: data.jenis,

    // FE `tipe` = BE `kelompok`.
    kelompok: data.tipe,

    // FE `kelompok` = BE `tipe_kelas`.
    tipe_kelas: data.kelompok,

    semester: Number(data.semester),
  };
}

export function Kurikulum() {
  const { periodeId } = useParams<{
    periodeId: string;
  }>();

  const [items, setItems] = useState<KurikulumItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<KurikulumItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KurikulumItem | null>(null);

  /**
   * Load mata kuliah berdasarkan kurikulum/periode yang
   * sedang dibuka.
   */
  const loadMataKuliah = async () => {
    if (!periodeId) {
      setItems([]);
      setPageError("ID periode akademik tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const data = await getMataKuliahByKurikulumApi(periodeId);

      setItems(data.map(mapApiToItem));
    } catch (error) {
      setItems([]);

      setPageError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data mata kuliah.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMataKuliah();
  }, [periodeId]);

  /**
   * Search tetap dilakukan di frontend.
   *
   * Jadi search tidak mengubah data asli dan tidak perlu
   * memanggil API setiap kali user mengetik.
   */
  const filtered = items.filter((item) =>
    [item.namaMataKuliah, item.kodeMK, item.prodi].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  /**
   * Tambah Mata Kuliah.
   */
  const handleAdd = async (data: MataKuliahFormData) => {
    if (!periodeId) {
      throw new Error("Periode akademik tidak ditemukan.");
    }

    const payload = mapFormToPayload(data);

    const created = await createMataKuliahApi(periodeId, payload);

    setItems((prev) => [...prev, mapApiToItem(created)]);
  };

  /**
   * Edit Mata Kuliah.
   */
  const handleEdit = async (data: MataKuliahFormData) => {
    if (!editItem) return;

    const payload = mapFormToPayload(data);

    const updated = await updateMataKuliahApi(editItem.id, payload);

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id ? mapApiToItem(updated) : item,
      ),
    );

    setEditItem(null);
  };

  /**
   * Delete Mata Kuliah.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      await deleteMataKuliahApi(deleteItem.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

      setDeleteItem(null);
      setPageError("");
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : "Gagal menghapus mata kuliah.",
      );
    }
  };

  const columns: DataTableColumn<KurikulumItem>[] = [
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
      key: "semester",
      header: "Semester",
      align: "center",
      width: "w-[12%]",
      render: (item) => item.semester,
    },
    {
      key: "sks",
      header: "SKS",
      align: "center",
      width: "w-[9%]",
      render: (item) => item.sks,
    },
    {
      key: "kelompok",
      header: "Kelompok",
      align: "center",
      width: "w-[16%]",
      render: (item) => item.kelompok,
    },
    {
      key: "jenis",
      header: "Jenis",
      align: "center",
      width: "w-[12%]",
      render: (item) => item.jenis,
    },
    {
      key: "tipe",
      header: "Tipe",
      align: "center",
      width: "w-[12%]",
      render: (item) => item.tipe,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "w-24",
      render: (item) => (
        <RowActions
          entityLabel="Mata Kuliah"
          onDelete={() => setDeleteItem(item)}
          onEdit={() => setEditItem(item)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
        <MasterDataToolbar
          searchPlaceholder="Cari nama mata kuliah"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Mata Kuliah"
          onAction={() => setIsAddOpen(true)}
          showFilter
        />

        {pageError && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3">
            <p className="text-b4 text-red-700">{pageError}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage={
            isLoading
              ? "Memuat data mata kuliah..."
              : "Data mata kuliah tidak ditemukan."
          }
        />
      </div>

      {/* =====================================================
          TAMBAH
      ===================================================== */}
      <ModalFormMataKuliah
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =====================================================
          EDIT
      ===================================================== */}
      <ModalFormMataKuliah
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={editItem ?? undefined}
        onClose={() => setEditItem(null)}
        onSave={handleEdit}
      />

      {/* =====================================================
          DELETE
      ===================================================== */}
      <ModalHapusData
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}

export default Kurikulum;
