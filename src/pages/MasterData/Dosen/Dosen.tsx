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
}

function mapApiToItem(item: DosenApiItem): DosenItem {
  return {
    id: String(item?.id ?? ""),
    nama: String(item?.nama ?? ""),
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

  const loadDosen = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDosenByKurikulumApi(periode.id);
      setItems(Array.isArray(data) ? data.map(mapApiToItem) : []);
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
    // loadDosen sengaja dipanggil ulang ketika periode berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periode.id]);

  // Pencarian mengabaikan kapitalisasi dan spasi di awal/akhir kata kunci.
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");
  const filtered = items.filter((item) =>
    item.nama.toLocaleLowerCase("id-ID").includes(normalizedQuery),
  );

  const handleAdd = async (data: DosenFormData) => {
    setErrorMessage("");

    const created = await createDosenApi(periode.id, {
      nama: data.nama.trim(),
    });

    setItems((previous) => [...previous, mapApiToItem(created)]);
  };

  const handleEdit = async (data: DosenFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    // Endpoint PUT hanya menerima field yang memang digunakan BE: nama.
    const updated = await updateDosenApi(editItem.id, {
      nama: data.nama.trim(),
    });

    // Beberapa respons BE dapat mengembalikan data null setelah update sukses.
    // Gunakan data form sebagai fallback agar tabel tidak crash.
    const updatedItem: DosenItem = updated
      ? mapApiToItem(updated)
      : { ...editItem, nama: data.nama.trim() };

    setItems((previous) =>
      previous.map((item) =>
        item.id === editItem.id ? updatedItem : item,
      ),
    );

    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteDosenApi(deleteItem.id);
      setItems((previous) =>
        previous.filter((item) => item.id !== deleteItem.id),
      );
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
        <MasterDataToolbar
          searchPlaceholder="Cari nama dosen"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Dosen"
          onAction={() => setIsAddOpen(true)}
        />

        {errorMessage && (
          <div className="border-b border-red-200 bg-red-50 px-4 py-3">
            <p className="text-b4 text-red-700">{errorMessage}</p>
          </div>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage={
            isLoading
              ? "Memuat data dosen..."
              : normalizedQuery
                ? "Dosen dengan kata kunci tersebut tidak ditemukan."
                : "Data dosen belum tersedia."
          }
        />
      </div>

      <ModalFormDosen
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      <ModalFormDosen
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={
          editItem
            ? {
                nama: editItem.nama,
              }
            : undefined
        }
        onClose={() => setEditItem(null)}
        onSave={handleEdit}
      />

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
