import { useState } from "react";
import { useOutletContext } from "react-router-dom";

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
import type { MasterDataOutletContext } from "../../../layouts/MasterDataDetailLayout";

interface KurikulumItem extends MataKuliahFormData {
  id: string;
}

const DUMMY_KURIKULUM: KurikulumItem[] = [
  {
    id: "1",
    prodi: "TRPL",
    namaMataKuliah: "Bahasa Inggris 1",
    kodeMK: "SVIK214101",
    semester: "1",
    sks: "2",
    kelompok: "MKK",
    jenis: "Wajib",
    tipe: "Teori",
  },
  {
    id: "2",
    prodi: "TRPL",
    namaMataKuliah: "Fisika Teknik 1",
    kodeMK: "SVIK214102",
    semester: "1",
    sks: "2",
    kelompok: "MKK",
    jenis: "Wajib",
    tipe: "Teori",
  },
];

export function Kurikulum() {
  useOutletContext<MasterDataOutletContext>();

  const [items, setItems] = useState<KurikulumItem[]>(DUMMY_KURIKULUM);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<KurikulumItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<KurikulumItem | null>(null);

  const filtered = items.filter((item) =>
    item.namaMataKuliah.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = (data: MataKuliahFormData) => {
    setItems((prev) => [...prev, { id: String(Date.now()), ...data }]);
  };

  const handleEdit = (data: MataKuliahFormData) => {
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
        <DataTable
          columns={columns}
          data={filtered}
          getRowKey={(item) => item.id}
          emptyMessage="Data mata kuliah tidak ditemukan."
        />
      </div>

      <ModalFormMataKuliah
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      <ModalFormMataKuliah
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={editItem ?? undefined}
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

export default Kurikulum;