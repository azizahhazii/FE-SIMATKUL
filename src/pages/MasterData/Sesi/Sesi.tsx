import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { MasterDataToolbar } from "../../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../../components/master-data/DataTable";
import { RowActions } from "../../../components/master-data/RowActions";
import { ModalHapusData } from "../../../components/master-data/ModalHapusData";
import { ModalFormSesi, type SesiFormData } from "./ModalFormSesi";

import type { MasterDataOutletContext } from "../../../layouts/MasterDataDetailLayout";

import {
  createSesiApi,
  deleteSesiApi,
  getSesiByKurikulumApi,
  updateSesiApi,
  type SesiApiItem,
} from "../../../services/api";

interface SesiItem {
  id: string;
  nama: number;
  nomor: string;
  jamMulai: string;
  jamBerakhir: string;
}

/**
 * Backend mengembalikan timestamp seperti:
 *
 * 2026-01-01 07:15:00
 *
 * UI menampilkan:
 *
 * 07.15 WIB
 */
function formatApiTime(value: string): string {
  if (!value) return "-";

  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})(?::\d{2})?/);

  if (!match) {
    return value;
  }

  return `${match[1]}.${match[2]} WIB`;
}

/**
 * Ubah input user ke format HH:mm yang diterima backend.
 *
 * Contoh:
 * "07.15 WIB" → "07:15"
 * "07:15"     → "07:15"
 */
function normalizeTimeForApi(value: string): string {
  return value
    .trim()
    .replace(/\s*WIB\s*/i, "")
    .replace(".", ":");
}

function mapApiToItem(item: SesiApiItem): SesiItem {
  return {
    id: String(item.id),
    nama: Number(item.nama),
    nomor: `Sesi ${item.nama}`,
    jamMulai: formatApiTime(item.jam_mulai),
    jamBerakhir: formatApiTime(item.jam_akhir),
  };
}

export function Sesi() {
  const { periode } = useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<SesiItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SesiItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<SesiItem | null>(null);

  /**
   * Ambil sesi berdasarkan kurikulum/periode yang
   * sedang dibuka.
   */
  const loadSesi = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getSesiByKurikulumApi(periode.id);

      const mapped = data.map(mapApiToItem).sort((a, b) => a.nama - b.nama);

      setItems(mapped);
    } catch (error) {
      setItems([]);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil data sesi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSesi();
  }, [periode.id]);

  /**
   * Search hanya memfilter data yang sudah ada.
   */
  const filtered = items.filter((item) =>
    [item.nomor, item.jamMulai, item.jamBerakhir].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  /**
   * Tambah sesi.
   *
   * Nomor sesi tidak diketik user karena UI sekarang memang
   * hanya meminta Jam Mulai dan Jam Berakhir.
   *
   * Nomor berikutnya dihitung dari nomor terbesar yang sudah
   * ada, kemudian BE menerima `nama` sebagai angka.
   */
  const handleAdd = async (data: SesiFormData) => {
    setErrorMessage("");

    const maxNomor = items.reduce((max, item) => Math.max(max, item.nama), 0);

    const nextNomor = maxNomor + 1;

    const created = await createSesiApi(periode.id, {
      nama: nextNomor,
      jam_mulai: normalizeTimeForApi(data.jamMulai),
      jam_akhir: normalizeTimeForApi(data.jamBerakhir),
    });

    setItems((prev) =>
      [...prev, mapApiToItem(created)].sort((a, b) => a.nama - b.nama),
    );
  };

  /**
   * Edit sesi.
   *
   * Nomor sesi tetap dipertahankan.
   * Yang diubah dari form hanya jam mulai dan jam berakhir.
   */
  const handleEdit = async (data: SesiFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    const updated = await updateSesiApi(editItem.id, {
      nama: editItem.nama,
      jam_mulai: normalizeTimeForApi(data.jamMulai),
      jam_akhir: normalizeTimeForApi(data.jamBerakhir),
    });

    setItems((prev) =>
      prev
        .map((item) => (item.id === editItem.id ? mapApiToItem(updated) : item))
        .sort((a, b) => a.nama - b.nama),
    );

    setEditItem(null);
  };

  /**
   * Hapus sesi.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteSesiApi(deleteItem.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

      setDeleteItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus data sesi.",
      );
    }
  };

  const columns: DataTableColumn<SesiItem>[] = [
    {
      key: "nomor",
      header: "Nomor Sesi",
      render: (item) => item.nomor,
    },
    {
      key: "jamMulai",
      header: "Jam Mulai",
      render: (item) => item.jamMulai,
    },
    {
      key: "jamBerakhir",
      header: "Jam Berakhir",
      render: (item) => item.jamBerakhir,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "w-24",
      render: (item) => (
        <RowActions
          entityLabel="Sesi"
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
          searchPlaceholder="Cari sesi"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Sesi"
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
            isLoading ? "Memuat data sesi..." : "Data sesi tidak ditemukan."
          }
        />
      </div>

      {/* =====================================================
          TAMBAH
      ===================================================== */}
      <ModalFormSesi
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =====================================================
          EDIT
      ===================================================== */}
      <ModalFormSesi
        mode="edit"
        isOpen={Boolean(editItem)}
        nomorSesi={editItem?.nomor}
        initialData={
          editItem
            ? {
                jamMulai: editItem.jamMulai,
                jamBerakhir: editItem.jamBerakhir,
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

export default Sesi;
