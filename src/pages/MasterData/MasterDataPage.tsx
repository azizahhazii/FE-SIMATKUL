import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Text } from "assets-design-system";
import Magnifer from "@solar-icons/react/search/Magnifer";

import { AddCircleIcon } from "../../components/icons/AddCircleIcon";
import { PeriodeAkademikCard } from "../../components/master-data/PeriodeAkademikCard";
import {
  ModalFormPeriode,
  type PeriodeFormData,
} from "../../components/master-data/ModalFormPeriode";
import { ModalHapusData } from "../../components/master-data/ModalHapusData";

import type { PeriodeAkademik } from "../../types/periodeAkademik";

import {
  createKurikulumApi,
  deleteKurikulumApi,
  getKurikulumApi,
  updateKurikulumApi,
} from "../../services/api";

/**
 * Mapping response backend Kurikulum menjadi bentuk data
 * yang saat ini dipakai oleh komponen PeriodeAkademikCard.
 */
function mapKurikulumToPeriode(
  item: Awaited<ReturnType<typeof getKurikulumApi>>[number],
): PeriodeAkademik {
  return {
    id: String(item.id),
    nama: item.nama,
    jumlahKurikulum: item.total_mata_kuliah,
    jumlahRuang: item.total_ruang,
    jumlahDosen: item.total_dosen,
    jumlahKelas: item.total_kelas,
    jumlahSesi: item.total_sesi,
  };
}

export function MasterDataPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<PeriodeAkademik[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PeriodeAkademik | null>(null);
  const [deleteItem, setDeleteItem] = useState<PeriodeAkademik | null>(null);

  /**
   * Ambil seluruh kurikulum dari backend ketika halaman pertama kali dibuka.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadKurikulum() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await getKurikulumApi();

        if (cancelled) return;

        setItems(data.map(mapKurikulumToPeriode));
      } catch (error) {
        if (cancelled) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data Master Data.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadKurikulum();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = items.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /**
   * Tambah periode / kurikulum baru.
   *
   * UI masih menggunakan istilah "Periode Akademik",
   * sedangkan backend menyimpan entity ini sebagai Kurikulum.
   */
  const handleAdd = async (data: PeriodeFormData) => {
    setErrorMessage("");

    try {
      if (!data.awalTahun || !data.semester) {
        throw new Error("Tahun ajaran dan semester harus diisi.");
      }

      /**
       * Kalau sumber data = salin, backend membutuhkan ID
       * kurikulum asal.
       */
      if (data.sumberData === "salin" && !data.periodeSumber) {
        throw new Error(
          "Pilih periode sumber terlebih dahulu untuk menyalin data.",
        );
      }

      const created = await createKurikulumApi(
        {
          semester: data.semester,
          tahun_ajaran: Number(data.awalTahun),
          description: data.deskripsi.trim() || null,
        },
        data.sumberData === "salin" ? data.periodeSumber : null,
      );

      setItems((prev) => [mapKurikulumToPeriode(created), ...prev]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menambahkan periode akademik.",
      );
    }
  };

  /**
   * Edit periode / kurikulum.
   */
  const handleEdit = async (data: PeriodeFormData) => {
    if (!editItem) return;

    setErrorMessage("");

    try {
      if (!data.awalTahun || !data.semester) {
        throw new Error("Tahun ajaran dan semester harus diisi.");
      }

      /**
       * Backend PUT mengembalikan row mentah, bukan format card lengkap.
       * Karena itu setelah update kita GET lagi berdasarkan ID.
       */
      await updateKurikulumApi(editItem.id, {
        semester: data.semester,
        tahun_ajaran: Number(data.awalTahun),
        description: data.deskripsi.trim() || null,
      });

      const updated = await getKurikulumApi();

      setItems(updated.map(mapKurikulumToPeriode));
      setEditItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui periode akademik.",
      );
    }
  };

  /**
   * Hapus periode / kurikulum.
   */
  const handleDelete = async () => {
    if (!deleteItem) return;

    setErrorMessage("");

    try {
      await deleteKurikulumApi(deleteItem.id);

      setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

      setDeleteItem(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus periode akademik.",
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-300">
      <main className="flex flex-1 flex-col gap-8 p-10">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="h4" className="text-primary-400">
              Master Data
            </Text>

            <Text variant="b2" className="text-neutral-800">
              Kelola kurikulum, ruang, dosen, kelas, dan sesi untuk setiap
              periode akademik
            </Text>
          </div>

          <Button
            theme="primary"
            variant="solid"
            iconLeft={<AddCircleIcon />}
            onClick={() => setIsAddOpen(true)}
            disabled={isLoading}
          >
            Tambah Periode Akademik
          </Button>
        </div>

        {/* =====================================================
            ERROR
            Hanya muncul ketika request gagal.
        ===================================================== */}
        {errorMessage && (
          <div className="rounded-2 border border-red-200 bg-red-50 px-4 py-3">
            <Text variant="b4" className="text-red-700">
              {errorMessage}
            </Text>
          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}
        <Input
          placeholder="Cari periode akademik"
          leftIcon={<Magnifer weight="LineDuotone" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />

        {/* =====================================================
            DATA
        ===================================================== */}
        <div className="flex flex-col gap-6">
          {isLoading ? (
            <div className="flex w-full items-center justify-center rounded-3 bg-white py-10 shadow-e1">
              <Text variant="b2" className="text-neutral-800">
                Memuat data Master Data...
              </Text>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((periode) => (
              <PeriodeAkademikCard
                key={periode.id}
                periode={periode}
                onOpen={() => navigate(`/master-data/${periode.id}/kurikulum`)}
                onEdit={setEditItem}
                onDelete={setDeleteItem}
              />
            ))
          ) : (
            <div className="flex w-full items-center justify-center rounded-3 bg-white py-8 shadow-e1">
              <Text variant="b2" className="text-neutral-800">
                {items.length === 0
                  ? "Belum ada data periode akademik"
                  : "Periode akademik tidak ditemukan"}
              </Text>
            </div>
          )}
        </div>
      </main>

      {/* =======================================================
          TAMBAH
      ======================================================= */}
      <ModalFormPeriode
        mode="tambah"
        isOpen={isAddOpen}
        periodeList={items}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />

      {/* =======================================================
          EDIT
      ======================================================= */}
      <ModalFormPeriode
        mode="edit"
        isOpen={Boolean(editItem)}
        periode={editItem}
        onClose={() => setEditItem(null)}
        onSave={handleEdit}
      />

      {/* =======================================================
          DELETE
      ======================================================= */}
      <ModalHapusData
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </div>
  );
}

export default MasterDataPage;
