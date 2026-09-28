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

  /**
   * Load data kelas berdasarkan kurikulum/periode.
   */
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

  /**
   * Filter berdasarkan Prodi + search.
   *
   * Data asli di state tidak diubah.
   */
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
   * Frontend tidak generate nama kelas sendiri.
   *
   * FE hanya mengirim konfigurasi.
   * BE yang menentukan kelas A/B/AB/A1/A2/dst.
   */
  const handleAdd = async (data: KelasFormData) => {
    setErrorMessage("");

    if (!data.semester) {
      throw new Error("Semester harus dipilih.");
    }

    await createKelasApi(periode.id, {
      prodi: data.prodi,
      semester: Number(data.semester),

      kelas_teori: data.jumlahTeori ? Number(data.jumlahTeori) : 0,

      kelas_praktikum: data.jumlahPraktikum ? Number(data.jumlahPraktikum) : 0,
    });

    /**
     * Ambil ulang dari backend supaya yang tampil
     * benar-benar hasil generate BE.
     */
    await loadKelas();
  };

  /**
   * EDIT GROUP
   *
   * Endpoint BE PUT hanya mengubah SATU kelas.
   *
   * Karena UI saat ini memiliki tombol Edit di header
   * semester group, maka semua kelas yang ada di group
   * diperbarui satu per satu.
   *
   * Jumlah kelas tidak diubah karena endpoint PUT BE
   * memang tidak menyediakan generate ulang jumlah kelas.
   */
  const handleEdit = async (data: KelasFormData) => {
    if (!editGroup) return;

    if (!data.semester) {
      throw new Error("Semester harus dipilih.");
    }

    setErrorMessage("");

    for (const item of editGroup.kelas) {
      await updateKelasApi(item.id, {
        prodi: data.prodi,
        semester: Number(data.semester),
      });
    }

    await loadKelas();
    setEditGroup(null);
  };

  /**
   * DELETE GROUP
   *
   * BE hanya punya DELETE /kelas/:id.
   *
   * Jadi seluruh kelas yang berada dalam satu semester group
   * dihapus satu per satu.
   */
  const handleDelete = async () => {
    if (!deleteGroup) return;

    setErrorMessage("");

    try {
      for (const item of deleteGroup.kelas) {
        await deleteKelasApi(item.id);
      }

      await loadKelas();

      setDeleteGroup(null);
    } catch (error) {
      /**
       * Reload lagi agar UI kembali mencerminkan kondisi
       * database kalau proses delete berhenti di tengah.
       */
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
        {/* ===================================================
            PRODI FILTER
        =================================================== */}
        <ProdiFilterCards
          selected={selectedProdi}
          onSelect={setSelectedProdi}
        />

        {/* ===================================================
            TABLE CARD
        =================================================== */}
        <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
          <MasterDataToolbar
            searchPlaceholder="Cari kelas"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionLabel="Tambah Kelas"
            onAction={() => setIsAddOpen(true)}
            showFilter
          />

          {/* Error */}
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
                {/* =========================================
                    SEMESTER HEADER
                ========================================= */}
                <div className="flex items-center justify-between border-b border-neutral-600 bg-white px-3 py-2">
                  <span className="text-b3 font-bold text-neutral-1000">
                    Semester {group.semester}
                  </span>

                  <RowActions
                    entityLabel="Semester"
                    onDelete={() => setDeleteGroup(group)}
                    onEdit={() => setEditGroup(group)}
                  />
                </div>

                {/* =========================================
                    KELAS TABLE
                ========================================= */}
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

      {/* =====================================================
          TAMBAH KELAS
      ===================================================== */}
      <ModalFormKelas
        mode="tambah"
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =====================================================
          EDIT KELAS / SEMESTER GROUP
      ===================================================== */}
      <ModalFormKelas
        mode="edit"
        isOpen={Boolean(editGroup)}
        namaKelas={editGroup?.kelas[0]?.kode}
        initialData={
          editGroup
            ? {
                prodi: editGroup.prodi,
                semester: editGroup.semester,

                /**
                 * Jumlah tidak dipakai saat edit.
                 * PUT BE hanya mengubah class existing.
                 */
                jumlahTeori: "",
                jumlahPraktikum: "",
              }
            : undefined
        }
        onClose={() => setEditGroup(null)}
        onSave={handleEdit}
      />

      {/* =====================================================
          DELETE
      ===================================================== */}
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
