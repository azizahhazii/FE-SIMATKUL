import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { MasterDataToolbar } from "../../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/master-data/DataTable";
import { RowActions } from "../../../components/master-data/RowActions";
import { ModalHapusData } from "../../../components/master-data/ModalHapusData";
import { ModalFormRuangan, type RuanganFormData } from "./ModalFormRuangan";

import type { MasterDataOutletContext } from "../../../layouts/MasterDataDetailLayout";

import {
  createRuangApi,
  deleteRuangApi,
  getRuangByKurikulumApi,
  updateRuangApi,
  type RuangApiItem,
} from "../../../services/api";

interface RuanganItem {
  id: string;
  nama: string;
}

function mapApiToItem(item: RuangApiItem): RuanganItem {
  return {
    id: String(item.id),
    nama: item.nama,
  };
}

export function Ruangan() {
  const { periode } = useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<RuanganItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<RuanganItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RuanganItem | null>(null);

  /**
   * Ambil data ruang berdasarkan kurikulum/periode
   * yang sedang dibuka.
   */
  const loadRuangan = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getRuangByKurikulumApi(periode.id);

      setItems(data.map(mapApiToItem));
    } catch (error) {
      setItems([]);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil data ruang.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRuangan();
  }, [periode.id]);

  /**
   * Search hanya memfilter data yang sudah diterima.
   * Tidak mengubah data asli di state.
   */
  const filtered = items.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Tambah ruang.
   */
  const handleAdd = async (data: RuanganFormData) => {
    setErrorMessage("");

    const created = await createRuangApi(periode.id, {
      nama: data.nama.trim(),
    });

    setItems((prev) => [...prev, mapApiToItem(created)]);
  };

  /**
   * Edit ruang.
   */
  const handleEdit = async (data: RuanganFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    const updated = await updateRuangApi(editItem.id, {
      nama: data.nama.trim(),
    });

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id ? mapApiToItem(updated) : item,
      ),
    );

    setEditItem(null);
  };

  /**
   * Hapus ruang.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteRuangApi(deleteItem.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

      setDeleteItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus data ruang.",
      );

      setDeleteItem(null);
    }
  };

  const columns: DataTableColumn<RuanganItem>[] = [
    {
      key: "nama",
      header: "Nama Ruang",
      render: (item) => <div className="min-w-0 break-all">{item.nama}</div>,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "w-24",
      render: (item) => (
        <RowActions
          entityLabel="Ruang"
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
          searchPlaceholder="Cari nama ruang"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Ruang"
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
            isLoading ? "Memuat data ruang..." : "Data ruang tidak ditemukan."
          }
        />
      </div>

      {/* =====================================================
          TAMBAH RUANG
      ===================================================== */}
      <ModalFormRuangan
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =====================================================
          EDIT RUANG
      ===================================================== */}
      <ModalFormRuangan
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

      {/* =====================================================
          DELETE RUANG
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

export default Ruangan;
