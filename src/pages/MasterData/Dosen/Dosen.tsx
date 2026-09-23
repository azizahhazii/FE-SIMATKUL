import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { MasterDataToolbar } from "../../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/master-data/DataTable";
import { RowActions } from "../../../components/master-data/RowActions";
import { ModalHapusData } from "../../../components/master-data/ModalHapusData";
import { ModalFormDosen, type DosenFormData } from "./ModalFormDosen";

import type { MasterDataOutletContext } from "../../../layouts/MasterDataDetailLayout";

import {
  createDosenApi,
  deleteDosenApi,
  getDosenByKurikulumApi,
  updateDosenApi,
  type DosenApiItem,
} from "../../../services/api";

interface DosenItem {
  id: string;
  nama: string;
  nidn: string;
  jabatan_akademik: string;
}

function mapApiToItem(item: DosenApiItem): DosenItem {
  return {
    id: String(item.id),
    nama: item.nama,
    nidn: item.nidn,
    jabatan_akademik: item.jabatan_akademik,
  };
}

export function Dosen() {
  const { periode } = useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<DosenItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<DosenItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<DosenItem | null>(null);

  /**
   * Ambil dosen berdasarkan kurikulum/periode
   * yang sedang dibuka.
   */
  const loadDosen = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDosenByKurikulumApi(periode.id);

      setItems(data.map(mapApiToItem));
    } catch (error) {
      setItems([]);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil data dosen.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDosen();
  }, [periode.id]);

  /**
   * Search hanya memfilter state lokal.
   */
  const filtered = items.filter((item) =>
    [item.nama, item.nidn, item.jabatan_akademik].some((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  /**
   * Tambah dosen.
   */
  const handleAdd = async (data: DosenFormData) => {
    setErrorMessage("");

    const created = await createDosenApi(periode.id, {
      nama: data.nama.trim(),
      nidn: data.nidn.trim(),
      jabatan_akademik: data.jabatan_akademik.trim(),
    });

    setItems((prev) => [...prev, mapApiToItem(created)]);
  };

  /**
   * Edit dosen.
   */
  const handleEdit = async (data: DosenFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    const updated = await updateDosenApi(editItem.id, {
      nama: data.nama.trim(),
      nidn: data.nidn.trim(),
      jabatan_akademik: data.jabatan_akademik.trim(),
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id ? mapApiToItem(updated) : item,
      ),
    );

    setEditItem(null);
  };

  /**
   * Delete dosen.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteDosenApi(deleteItem.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

      setDeleteItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus data dosen.",
      );

      setDeleteItem(null);
    }
  };

  const columns: DataTableColumn<DosenItem>[] = [
    {
      key: "nama",
      header: "Nama Dosen",
      render: (item) => item.nama,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "w-24",
      render: (item) => (
        <RowActions
          entityLabel="Dosen"
          onDelete={() => setDeleteItem(item)}
          onEdit={() => setEditItem(item)}
        />
      ),
    },
  ];

  return (
    <>
      <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
        {/* ================= TOOLBAR ================= */}
        <MasterDataToolbar
          searchPlaceholder="Cari nama dosen"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Dosen"
          onAction={() => setIsAddOpen(true)}
        />

        {/* ================= ERROR ================= */}
        {errorMessage && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3">
            <p className="text-b4 text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* ================= TABLE ================= */}
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage={
            isLoading ? "Memuat data dosen..." : "Data dosen tidak ditemukan."
          }
        />
      </div>

      {/* =====================================================
          TAMBAH
      ===================================================== */}
      <ModalFormDosen
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =====================================================
          EDIT
      ===================================================== */}
      <ModalFormDosen
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={
          editItem
            ? {
                nama: editItem.nama,
                nidn: editItem.nidn,
                jabatan_akademik: editItem.jabatan_akademik,
              }
            : undefined
        }
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

export default Dosen;
