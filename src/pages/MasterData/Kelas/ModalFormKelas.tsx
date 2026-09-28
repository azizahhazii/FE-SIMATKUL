import { useEffect, useState } from "react";

import { ModalForm } from "../../../components/master-data/ModalForm";
import { SelectField } from "../../../components/master-data/SelectField";
import {
  ProdiFilterCards,
  type ProdiId,
} from "../../../components/master-data/ProdiFilterCards";

import {
  SEMESTER_OPTIONS,
  JUMLAH_KELAS_OPTIONS,
} from "../../../components/master-data/formOptions";

export interface KelasFormData {
  prodi: ProdiId;
  semester: string;
  jumlahTeori: string;
  jumlahPraktikum: string;
}

interface ModalFormKelasProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: KelasFormData;

  /**
   * Kode kelas pertama pada group.
   * Dipakai sebagai konteks judul modal saat edit.
   */
  namaKelas?: string;

  onClose: () => void;

  /**
   * Bisa synchronous maupun asynchronous karena
   * proses simpan sekarang terhubung ke backend.
   */
  onSave: (data: KelasFormData) => void | Promise<void>;
}

const EMPTY_FORM: KelasFormData = {
  prodi: "TRPL",
  semester: "",
  jumlahTeori: "",
  jumlahPraktikum: "",
};

export function ModalFormKelas({
  isOpen,
  mode,
  initialData,
  namaKelas,
  onClose,
  onSave,
}: ModalFormKelasProps) {
  const [form, setForm] = useState<KelasFormData>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setForm(initialData ?? EMPTY_FORM);
    setErrorMessage("");
    setIsSubmitting(false);
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setErrorMessage("");

    if (!form.semester) {
      setErrorMessage("Semester harus dipilih.");
      return;
    }

    /**
     * Pada mode tambah:
     *
     * minimal salah satu konfigurasi jumlah harus
     * menghasilkan nilai > 0.
     *
     * Validasi detail tetap dilakukan BE.
     */
    if (mode === "tambah") {
      const jumlahTeori = Number(form.jumlahTeori || 0);

      const jumlahPraktikum = Number(form.jumlahPraktikum || 0);

      if (jumlahTeori <= 0 && jumlahPraktikum <= 0) {
        setErrorMessage("Jumlah kelas teori atau praktikum harus dipilih.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSave(form);

      /**
       * Tutup modal setelah API berhasil.
       */
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan data kelas.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <ModalForm
      isOpen={isOpen}
      title={isEdit ? `Edit Kelas ${namaKelas ?? ""}` : "Tambah Kelas"}
      description={
        isEdit
          ? "Ubah program studi atau semester kelas pada periode ini"
          : "Tambah data kelas untuk periode ini"
      }
      submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Kelas"}
      onClose={onClose}
      onSubmit={() => {
        void handleSubmit();
      }}
    >
      {/* =====================================================
          ERROR
      ===================================================== */}
      {errorMessage && (
        <div className="rounded-2 border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-b4 text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* =====================================================
          PROGRAM STUDI
      ===================================================== */}
      <div className="flex flex-col gap-2">
        <span className="text-b2 text-neutral-1000">Program Studi</span>

        <ProdiFilterCards
          selected={form.prodi}
          onSelect={(prodi) =>
            setForm((prev) => ({
              ...prev,
              prodi,
            }))
          }
          size="compact"
        />
      </div>

      {/* =====================================================
          SEMESTER
      ===================================================== */}
      <SelectField
        label="Semester"
        placeholder="pilih semester"
        options={SEMESTER_OPTIONS}
        value={form.semester}
        onChange={(semester) =>
          setForm((prev) => ({
            ...prev,
            semester,
          }))
        }
      />

      {/* =====================================================
          JUMLAH KELAS
          
          Hanya digunakan saat TAMBAH.
          
          Saat EDIT, endpoint BE tidak mendukung perubahan
          jumlah kelas / generate ulang kelas.
      ===================================================== */}
      <div className="grid grid-cols-2 gap-4">
        <div className={isEdit ? "opacity-50" : ""}>
          <SelectField
            label="Jumlah Kelas Teori"
            placeholder={
              isEdit ? "Tidak tersedia saat edit" : "pilih jumlah kelas"
            }
            options={JUMLAH_KELAS_OPTIONS}
            value={form.jumlahTeori}
            onChange={(jumlahTeori) =>
              setForm((prev) => ({
                ...prev,
                jumlahTeori,
              }))
            }
            disabled={isEdit || isSubmitting}
          />
        </div>

        <div className={isEdit ? "opacity-50" : ""}>
          <SelectField
            label="Jumlah Kelas Praktikum"
            placeholder={
              isEdit ? "Tidak tersedia saat edit" : "pilih jumlah kelas"
            }
            options={JUMLAH_KELAS_OPTIONS}
            value={form.jumlahPraktikum}
            onChange={(jumlahPraktikum) =>
              setForm((prev) => ({
                ...prev,
                jumlahPraktikum,
              }))
            }
            disabled={isEdit || isSubmitting}
          />
        </div>
      </div>
    </ModalForm>
  );
}

export default ModalFormKelas;
