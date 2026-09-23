import { useEffect, useState } from "react";
import { Input } from "assets-design-system";

import { ModalForm } from "../../../components/master-data/ModalForm";
import { SelectField } from "../../../components/master-data/SelectField";

import {
  ProdiFilterCards,
  type ProdiId,
} from "../../../components/master-data/ProdiFilterCards";

import {
  SEMESTER_OPTIONS,
  TIPE_KELAS_OPTIONS,
  JENIS_MATA_KULIAH_OPTIONS,
  KELOMPOK_MATA_KULIAH_OPTIONS,
} from "../../../components/master-data/formOptions";

export interface MataKuliahFormData {
  prodi: ProdiId;
  namaMataKuliah: string;
  kodeMK: string;
  semester: string;
  sks: string;

  /** MKK/MKDU — label "Tipe Kelas" di modal, kolom "Kelompok" di tabel. */
  kelompok: string;

  jenis: string;

  /** Teori/Praktikum — label "Kelompok" di modal, kolom "Tipe" di tabel. */
  tipe: string;
}

interface ModalFormMataKuliahProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: MataKuliahFormData;

  onClose: () => void;

  /**
   * Bisa synchronous atau asynchronous karena sekarang
   * menyimpan data ke backend.
   */
  onSave: (data: MataKuliahFormData) => void | Promise<void>;
}

const EMPTY_FORM: MataKuliahFormData = {
  prodi: "TRPL",
  namaMataKuliah: "",
  kodeMK: "",
  semester: "",
  sks: "",
  kelompok: "",
  jenis: "",
  tipe: "",
};

export function ModalFormMataKuliah({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}: ModalFormMataKuliahProps) {
  const [form, setForm] = useState<MataKuliahFormData>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ?? EMPTY_FORM);
      setErrorMessage("");
      setIsSubmitting(false);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setErrorMessage("");

    // Validasi frontend sederhana sebelum request.
    if (!form.namaMataKuliah.trim()) {
      setErrorMessage("Nama mata kuliah tidak boleh kosong.");
      return;
    }

    if (!form.kodeMK.trim() || !/^\d+$/.test(form.kodeMK.trim())) {
      setErrorMessage("Kode MK harus berupa angka positif.");
      return;
    }

    if (
      !form.sks ||
      !Number.isInteger(Number(form.sks)) ||
      Number(form.sks) < 1 ||
      Number(form.sks) > 10
    ) {
      setErrorMessage("Bobot SKS harus berupa angka 1 sampai 10.");
      return;
    }

    if (!form.semester) {
      setErrorMessage("Semester harus dipilih.");
      return;
    }

    if (!form.kelompok) {
      setErrorMessage("Tipe kelas harus dipilih.");
      return;
    }

    if (!form.jenis) {
      setErrorMessage("Jenis mata kuliah harus dipilih.");
      return;
    }

    if (!form.tipe) {
      setErrorMessage("Kelompok mata kuliah harus dipilih.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(form);

      /**
       * Modal hanya ditutup setelah API berhasil.
       */
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data mata kuliah.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      title={
        mode === "tambah"
          ? "Tambah Mata Kuliah"
          : `Edit Mata Kuliah ${initialData?.namaMataKuliah ?? ""}`
      }
      description={
        mode === "tambah"
          ? "Tambah data mata kuliah untuk periode ini"
          : "Ubah data mata kuliah untuk periode ini"
      }
      submitLabel={
        mode === "tambah" ? "Tambah Mata Kuliah" : "Simpan Perubahan"
      }
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
          NAMA
      ===================================================== */}
      <Input
        label="Nama Mata Kuliah"
        placeholder="contoh: Bahasa Inggris 1"
        value={form.namaMataKuliah}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            namaMataKuliah: e.target.value,
          }))
        }
      />

      {/* =====================================================
          KODE + SEMESTER
      ===================================================== */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Kode MK"
          placeholder="contoh: 101"
          type="number"
          min={1}
          value={form.kodeMK}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              kodeMK: e.target.value,
            }))
          }
        />

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
      </div>

      {/* =====================================================
          SKS + TIPE KELAS
      ===================================================== */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Bobot SKS"
          placeholder="contoh: 2"
          type="number"
          min={1}
          max={10}
          value={form.sks}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              sks: e.target.value,
            }))
          }
        />

        <SelectField
          label="Tipe Kelas"
          placeholder="MKK/MKDU"
          options={TIPE_KELAS_OPTIONS}
          value={form.kelompok}
          onChange={(kelompok) =>
            setForm((prev) => ({
              ...prev,
              kelompok,
            }))
          }
        />
      </div>

      {/* =====================================================
          JENIS + KELOMPOK
      ===================================================== */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Jenis"
          placeholder="Wajib/Pilihan"
          options={JENIS_MATA_KULIAH_OPTIONS}
          value={form.jenis}
          onChange={(jenis) =>
            setForm((prev) => ({
              ...prev,
              jenis,
            }))
          }
        />

        <SelectField
          label="Kelompok"
          placeholder="Teori/Praktikum"
          options={KELOMPOK_MATA_KULIAH_OPTIONS}
          value={form.tipe}
          onChange={(tipe) =>
            setForm((prev) => ({
              ...prev,
              tipe,
            }))
          }
        />
      </div>
    </ModalForm>
  );
}
