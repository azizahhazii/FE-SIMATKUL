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
  namaKelas?: string;
  onClose: () => void;
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

    const jumlahTeori = Number(form.jumlahTeori);
    const jumlahPraktikum = Number(form.jumlahPraktikum);

    if (jumlahTeori < 1) {
      setErrorMessage("Jumlah kelas teori harus dipilih.");
      return;
    }

    if (jumlahPraktikum < 1) {
      setErrorMessage("Jumlah kelas praktikum harus dipilih.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(form);
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

  /**
   * BE saat ini mendukung jumlah kelas 1 - 4.
   * Filter dilakukan di sini supaya tidak mengubah component
   * formOptions yang mungkin dipakai halaman lain.
   */
  const kelasOptions = JUMLAH_KELAS_OPTIONS.filter(
    (option) => Number(option.value) <= 4,
  );

  return (
    <ModalForm
      isOpen={isOpen}
      title={isEdit ? `Edit Kelas ${namaKelas ?? ""}` : "Tambah Kelas"}
      description={
        isEdit
          ? "Ubah program studi, semester, dan jumlah kelas pada periode ini"
          : "Tambah data kelas untuk periode ini"
      }
      submitLabel={isEdit ? "Simpan Perubahan" : "Tambah Kelas"}
      onClose={onClose}
      onSubmit={() => {
        void handleSubmit();
      }}
    >
      {errorMessage && (
        <div className="rounded-2 border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-b4 text-red-700">{errorMessage}</p>
        </div>
      )}

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
        disabled={isSubmitting}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Jumlah Kelas Teori"
          placeholder="pilih jumlah kelas"
          options={kelasOptions}
          value={form.jumlahTeori}
          onChange={(jumlahTeori) =>
            setForm((prev) => ({
              ...prev,
              jumlahTeori,
            }))
          }
          disabled={isSubmitting}
        />

        <SelectField
          label="Jumlah Kelas Praktikum"
          placeholder="pilih jumlah kelas"
          options={kelasOptions}
          value={form.jumlahPraktikum}
          onChange={(jumlahPraktikum) =>
            setForm((prev) => ({
              ...prev,
              jumlahPraktikum,
            }))
          }
          disabled={isSubmitting}
        />
      </div>
    </ModalForm>
  );
}

export default ModalFormKelas;
