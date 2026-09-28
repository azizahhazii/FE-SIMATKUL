import { useEffect, useMemo, useState } from "react";
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

import {
  createKelasApi,
  deleteKelasApi,
  getKelasByKurikulumApi,
  updateKelasApi,
  type KelasApiItem,
} from "../../../services/api";

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

function mapApiToItem(item: KelasApiItem): KelasItem {
  return {
    id: String(item.id),
    nama: item.kelas,
    kode: item.kode_kelas,
  };
}

/**
 * Grouping dilakukan FE hanya untuk kebutuhan tampilan.
 *
 * Satu group = satu Prodi + satu Semester.
 */
function groupKelas(items: KelasApiItem[]): SemesterGroup[] {
  const groups = new Map<string, SemesterGroup>();

  for (const item of items) {
    const prodi = item.prodi as ProdiId;
    const semester = String(item.semester);
    const groupId = `${prodi}-${semester}`;

    const existing = groups.get(groupId);
    const kelasItem = mapApiToItem(item);

    if (existing) {
      existing.kelas.push(kelasItem);
    } else {
      groups.set(groupId, {
        id: groupId,
        semester,
        prodi,
        kelas: [kelasItem],
      });
    }
  }

  return [...groups.values()].sort((a, b) => {
    const semesterCompare = Number(a.semester) - Number(b.semester);

    if (semesterCompare !== 0) {
      return semesterCompare;
    }

    return a.prodi.localeCompare(b.prodi);
  });
}

export function Kelas() {
  const { periode } = useOutletContext<MasterDataOutletContext>();

  const [groups, setGroups] = useState<SemesterGroup[]>([]);
  const [selectedProdi, setSelectedProdi] = useState<ProdiId>("TRPL");
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<SemesterGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<SemesterGroup | null>(null);

  const loadKelas = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getKelasByKurikulumApi(periode.id);
      setGroups(groupKelas(data));
    } catch (error) {
      setGroups([]);

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengambil data kelas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadKelas();
  }, [periode.id]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return groups
      .filter((group) => group.prodi === selectedProdi)
      .map((group) => ({
        ...group,
        kelas: group.kelas.filter(
          (item) =>
            !query ||
            [item.nama, item.kode].some((field) =>
              field.toLowerCase().includes(query),
            ),
        ),
      }))
      .filter((group) => group.kelas.length > 0);
  }, [groups, selectedProdi, searchQuery]);

  /**
   * ADD
   *
   * FE hanya mengirim konfigurasi.
   * BE yang generate nama dan kode kelas.
   */
  const handleAdd = async (data: KelasFormData) => {
    setErrorMessage("");

    if (!data.semester) {
      throw new Error("Semester harus dipilih.");
    }

    const jumlahTeori = Number(data.jumlahTeori);
    const jumlahPraktikum = Number(data.jumlahPraktikum);

    if (jumlahTeori < 1 || jumlahPraktikum < 1) {
      throw new Error(
        "Jumlah kelas teori dan praktikum harus dipilih terlebih dahulu.",
      );
    }

    await createKelasApi(periode.id, {
      prodi: data.prodi,
      semester: Number(data.semester),
      kelas_teori: jumlahTeori,
      kelas_praktikum: jumlahPraktikum,
    });

    await loadKelas();
  };

  /**
   * EDIT GROUP
   *
   * BE terbaru memperbarui group kelas berdasarkan:
   * from_semester, to_semester, kelas_teori, kelas_praktikum.
   */
  const handleEdit = async (data: KelasFormData) => {
    if (!editGroup) return;

    if (!data.semester) {
      throw new Error("Semester harus dipilih.");
    }

    const jumlahTeori = Number(data.jumlahTeori);
    const jumlahPraktikum = Number(data.jumlahPraktikum);

    if (jumlahTeori < 1 || jumlahPraktikum < 1) {
      throw new Error(
        "Jumlah kelas teori dan praktikum harus dipilih terlebih dahulu.",
      );
    }

    setErrorMessage("");

    await updateKelasApi(periode.id, {
      prodi: data.prodi,
      from_semester: Number(editGroup.semester),
      to_semester: Number(data.semester),
      kelas_teori: jumlahTeori,
      kelas_praktikum: jumlahPraktikum,
    });

    await loadKelas();
    setEditGroup(null);
  };

  /**
   * DELETE GROUP
   *
   * BE terbaru menghapus seluruh kelas pada semester tertentu
   * dalam satu request berdasarkan kurikulumId + semester.
   */
  const handleDelete = async () => {
    if (!deleteGroup) return;

    setErrorMessage("");

    try {
      await deleteKelasApi(periode.id, Number(deleteGroup.semester));

      await loadKelas();
      setDeleteGroup(null);
    } catch (error) {
      await loadKelas();

      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus data kelas.",
      );

      setDeleteGroup(null);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <ProdiFilterCards
          selected={selectedProdi}
          onSelect={setSelectedProdi}
        />

        <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
          <MasterDataToolbar
            searchPlaceholder="Cari kelas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionLabel="Tambah Kelas"
            onAction={() => setIsAddOpen(true)}
            showFilter
          />

          {errorMessage && (
            <div className="border-b border-red-200 bg-red-50 px-4 py-3">
              <p className="text-b4 text-red-700">{errorMessage}</p>
            </div>
          )}

          {isLoading ? (
            <div className="p-8 text-center text-b4 text-neutral-700">
              Memuat data kelas...
            </div>
          ) : filtered.length > 0 ? (
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
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}

export default Kelas;
