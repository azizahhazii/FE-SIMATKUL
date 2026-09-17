import { useState } from "react";
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

interface SesiItem {
  id: string;
  nomor: string;
  jamMulai: string;
  jamBerakhir: string;
}

const DUMMY_SESI: SesiItem[] = [
  { id: "1", nomor: "Sesi 1", jamMulai: "07.15 WIB", jamBerakhir: "8.55 WIB" },
  { id: "2", nomor: "Sesi 2", jamMulai: "09.00 WIB", jamBerakhir: "10.30 WIB" },
  { id: "3", nomor: "Sesi 3", jamMulai: "11.00 WIB", jamBerakhir: "12.30 WIB" },
  { id: "4", nomor: "Sesi 4", jamMulai: "13.00 WIB", jamBerakhir: "14.30 WIB" },
  { id: "5", nomor: "Sesi 5", jamMulai: "15.00 WIB", jamBerakhir: "16.30 WIB" },
];

export function Sesi() {
  useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<SesiItem[]>(DUMMY_SESI);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<SesiItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<SesiItem | null>(null);

  const filtered = items.filter((item) =>
    [item.nomor, item.jamMulai, item.jamBerakhir].some((field) =>
      field.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const handleAdd = (data: SesiFormData) => {
    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        nomor: `Sesi ${prev.length + 1}`,
        ...data,
      },
    ]);
  };

  const handleEdit = (data: SesiFormData) => {
    if (!editItem) return;
    setItems((prev) =>
      prev.map((item) => (item.id === editItem.id ? { ...item, ...data } : item)),
    );
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
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
        <MasterDataToolbar
          searchPlaceholder="Cari sesi"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Sesi"
          onAction={() => setIsAddOpen(true)}
        />
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage="Data sesi tidak ditemukan."
        />
      </div>

      <ModalFormSesi
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      <ModalFormSesi
        mode="edit"
        isOpen={Boolean(editItem)}
        nomorSesi={editItem?.nomor}
        initialData={
          editItem
            ? { jamMulai: editItem.jamMulai, jamBerakhir: editItem.jamBerakhir }
            : undefined
        }
        onClose={() => setEditItem(null)}
        onSave={handleEdit}
      />
      <ModalHapusData
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default Sesi;