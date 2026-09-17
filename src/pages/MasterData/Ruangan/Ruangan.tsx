import { useState } from "react";
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

interface RuanganItem {
  id: string;
  nama: string;
}

const DUMMY_RUANGAN: RuanganItem[] = [
  { id: "1", nama: "CU 205" },
  { id: "2", nama: "CU 206" },
  { id: "3", nama: "CU 207" },
  { id: "4", nama: "CU 208" },
  { id: "5", nama: "CU 209" },
  { id: "6", nama: "CU 210" },
  { id: "7", nama: "CU 211" },
  { id: "8", nama: "CU 212" },
];

export function Ruangan() {
  useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<RuanganItem[]>(DUMMY_RUANGAN);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<RuanganItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<RuanganItem | null>(null);

  const filtered = items.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = (data: RuanganFormData) => {
    setItems((prev) => [...prev, { id: String(Date.now()), ...data }]);
  };

  const handleEdit = (data: RuanganFormData) => {
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

  const columns: DataTableColumn<RuanganItem>[] = [
    {
      key: "nama",
      header: "Nama Ruang",
      render: (item) => item.nama,
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
        <MasterDataToolbar
          searchPlaceholder="Cari nama ruang"
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          actionLabel="Tambah Ruang"
          onAction={() => setIsAddOpen(true)}
        />
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage="Data ruang tidak ditemukan."
        />
      </div>

      <ModalFormRuangan
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      <ModalFormRuangan
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

export default Ruangan;