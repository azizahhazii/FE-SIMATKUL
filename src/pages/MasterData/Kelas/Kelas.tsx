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
  ProdiFilterCards,
  type ProdiId,
} from "../../../components/master-data/ProdiFilterCards";
import { ModalFormKelas, type KelasFormData } from "./ModalFormKelas";
import type { MasterDataOutletContext } from "../../../layouts/MasterDataDetailLayout";

interface KelasItem {
  id: string;
  nama: string;
  kode: string;
}

interface SemesterGroup {
  id: string;
  semester: string;
  prodi: ProdiId;
  kelas: KelasItem[];
}

const DUMMY_KELAS: SemesterGroup[] = [
  {
    id: "1",
    semester: "1",
    prodi: "TRPL",
    kelas: [
      { id: "1", nama: "AA", kode: "PL1AA" },
      { id: "2", nama: "BB", kode: "PL1BB" },
      { id: "3", nama: "A1", kode: "PL1A1" },
      { id: "4", nama: "A2", kode: "PL1A2" },
      { id: "5", nama: "B1", kode: "PL1B1" },
      { id: "6", nama: "B2", kode: "PL1B2" },
    ],
  },
];

const KELAS_COLUMNS: DataTableColumn<KelasItem>[] = [
  {
    key: "nama",
    header: "Kelas",
    align: "center",
    width: "w-1/2",
    render: (item) => item.nama,
  },
  {
    key: "kode",
    header: "Kode Kelas",
    align: "center",
    width: "w-1/2",
    render: (item) => item.kode,
  },
];

export function Kelas() {
  useOutletContext<MasterDataOutletContext>();

  const [groups, setGroups] = useState<SemesterGroup[]>(DUMMY_KELAS);
  const [selectedProdi, setSelectedProdi] = useState<ProdiId>("TRPL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<SemesterGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<SemesterGroup | null>(null);

  const filtered = groups
    .filter((group) => group.prodi === selectedProdi)
    .map((group) => ({
      ...group,
      kelas: group.kelas.filter((item) =>
        [item.nama, item.kode].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      ),
    }));

  const handleAdd = (data: KelasFormData) => {
    setGroups((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        semester: data.semester,
        prodi: data.prodi,
        kelas: [],
      },
    ]);
  };

  const handleEdit = (data: KelasFormData) => {
    if (!editGroup) return;
    setGroups((prev) =>
      prev.map((group) =>
        group.id === editGroup.id
          ? { ...group, semester: data.semester, prodi: data.prodi }
          : group,
      ),
    );
    setEditGroup(null);
  };

  const handleDelete = () => {
    if (!deleteGroup) return;
    setGroups((prev) => prev.filter((group) => group.id !== deleteGroup.id));
    setDeleteGroup(null);
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ProdiFilterCards selected={selectedProdi} onSelect={setSelectedProdi} />

        <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
          <MasterDataToolbar
            searchPlaceholder="Cari kelas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionLabel="Tambah Kelas"
            onAction={() => setIsAddOpen(true)}
            showFilter
          />

          {filtered.length > 0 ? (
            filtered.map((group) => (
              <div key={group.id} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-neutral-600 bg-neutral-400 px-3 py-2">
                  <span className="text-b3 font-bold text-neutral-1000">
                    Semester {group.semester}
                  </span>
                  <RowActions
                    entityLabel="Semester"
                    onDelete={() => setDeleteGroup(group)}
                    onEdit={() => setEditGroup(group)}
                  />
                </div>
                <DataTable
                  columns={KELAS_COLUMNS}
                  data={group.kelas}
                  getRowKey={(item) => item.id}
                  emptyMessage="Data kelas tidak ditemukan."
                />
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-b4 text-neutral-700">
              Data kelas semester belum tersedia.
            </div>
          )}
        </div>
      </div>

      <ModalFormKelas
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      <ModalFormKelas
        mode="edit"
        isOpen={Boolean(editGroup)}
        namaKelas={editGroup?.kelas[0]?.kode}
        initialData={
          editGroup
            ? {
                prodi: editGroup.prodi,
                semester: editGroup.semester,
                jumlahTeori: "",
                jumlahPraktikum: "",
              }
            : undefined
        }
        onClose={() => setEditGroup(null)}
        onSave={handleEdit}
      />
      <ModalHapusData
        isOpen={Boolean(deleteGroup)}
        onClose={() => setDeleteGroup(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

export default Kelas;