import { useState } from "react";
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

interface DosenItem {
  id: string;
  nama: string;
}

const DUMMY_DOSEN: DosenItem[] = [
  { id: "1", nama: "Dr. Sri Mulyana, M.Kom" },
  { id: "2", nama: "Prof. Leila Ahmad, Ph.D" },
  { id: "3", nama: "Ms. Fatima Khan, M.A." },
  { id: "4", nama: "Mr. John Smith, B.Sc." },
  { id: "5", nama: "Dr. Emily Johnson, Ed.D" },
  { id: "6", nama: "Mr. Carlos Vega, M.Eng" },
  { id: "7", nama: "Dr. Rachel Green, M.D." },
];

export function Dosen() {
  useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<DosenItem[]>(DUMMY_DOSEN);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<DosenItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<DosenItem | null>(null);

  const filtered = items.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = (data: DosenFormData) => {
    setItems((prev) => [...prev, { id: String(Date.now()), ...data }]);
  };

  const handleEdit = (data: DosenFormData) => {
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
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage="Data dosen tidak ditemukan."
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
        initialData={editItem ? { nama: editItem.nama } : undefined}
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

export default Dosen;