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

/**
 * Ambil nilai waktu dari timestamp/API untuk kebutuhan sorting.
 *
 * Contoh:
 * "2026-01-01 07:15:00" → "07:15"
 */
function getTimeForSort(value: string): string {
  if (!value) return "";

  const match = value.match(/(?:T|\s)(\d{2}):(\d{2})(?::\d{2})?/);

  if (!match) {
    return value;
  }

  return `${match[1]}:${match[2]}`;
}

/**
 * Mapping data dari backend ke bentuk yang digunakan UI.
 *
 * Backend sekarang hanya membutuhkan:
 * - id
 * - jam_mulai
 * - jam_akhir
 *
 * Nomor sesi dibuat oleh FE berdasarkan urutan waktu.
 */
function mapApiToItem(item: SesiApiItem): SesiItem {
  return {
    id: String(item.id),
    nomor: "",
    jamMulai: formatApiTime(item.jam_mulai),
    jamBerakhir: formatApiTime(item.jam_akhir),
  };
}

/**
 * Urutkan sesi berdasarkan jam mulai lalu beri nomor sesi
 * berdasarkan urutan data.
 */
function normalizeItems(items: SesiItem[]): SesiItem[] {
  return [...items]
    .sort((a, b) => {
      const timeA = normalizeTimeForApi(a.jamMulai);
      const timeB = normalizeTimeForApi(b.jamMulai);

      return timeA.localeCompare(timeB);
    })
    .map((item, index) => ({
      ...item,
      nomor: `Sesi ${index + 1}`,
    }));
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
   * Ambil sesi berdasarkan kurikulum/periode yang sedang dibuka.
   */
  useEffect(() => {
    let isMounted = true;

    const loadSesi = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getSesiByKurikulumApi(periode.id);

        if (!isMounted) return;

        const mapped = data.map(mapApiToItem);

        setItems(normalizeItems(mapped));
      } catch (error) {
        if (!isMounted) return;

        setItems([]);

        setErrorMessage(
          error instanceof Error ? error.message : "Gagal mengambil data sesi.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSesi();

    return () => {
      isMounted = false;
    };
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
   * Backend HANYA menerima:
   * - jam_mulai
   * - jam_akhir
   *
   * Tidak ada field `nama` yang dikirim.
   */
  const handleAdd = async (data: SesiFormData) => {
    setErrorMessage("");

    try {
      const created = await createSesiApi(periode.id, {
        jam_mulai: normalizeTimeForApi(data.jamMulai),
        jam_akhir: normalizeTimeForApi(data.jamBerakhir),
      });

      const newItem = mapApiToItem(created);

      setItems((prev) => normalizeItems([...prev, newItem]));

      setIsAddOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menambahkan data sesi.",
      );
    }
  };

  /**
   * Edit sesi.
   *
   * Backend HANYA menerima:
   * - jam_mulai
   * - jam_akhir
   *
   * Tidak ada field `nama` yang dikirim.
   */
  const handleEdit = async (data: SesiFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    try {
      const updated = await updateSesiApi(editItem.id, {
        jam_mulai: normalizeTimeForApi(data.jamMulai),
        jam_akhir: normalizeTimeForApi(data.jamBerakhir),
      });

      const updatedItem = mapApiToItem(updated);

      setItems((prev) =>
        normalizeItems(
          prev.map((item) => (item.id === editItem.id ? updatedItem : item)),
        ),
      );

      setEditItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengubah data sesi.",
      );
    }
  };

  /**
   * Hapus sesi.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteSesiApi(deleteItem.id);

      setItems((prev) =>
        normalizeItems(prev.filter((item) => item.id !== deleteItem.id)),
      );

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
