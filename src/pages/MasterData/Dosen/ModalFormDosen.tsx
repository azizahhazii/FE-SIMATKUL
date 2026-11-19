import { useEffect, useState } from "react";
import { Input } from "assets-design-system";

import { ModalForm } from "../../../components/master-data/ModalForm";

export interface DosenFormData {
  nama: string;
}

interface ModalFormDosenProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: DosenFormData | null;
  onClose: () => void;
  onSave: (data: DosenFormData) => void | Promise<void>;
}

const EMPTY_FORM: DosenFormData = {
  nama: "",
};

export function ModalFormDosen({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}: ModalFormDosenProps) {
  const [form, setForm] = useState<DosenFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // Normalisasi data dari BE agar nilai null/undefined tidak masuk ke Input.
    setForm({
      nama: String(initialData?.nama ?? ""),
    });
    setErrorMessage("");
    setIsSubmitting(false);
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setErrorMessage("");

    // Tetap aman meskipun data awal dari BE tidak lengkap.
    const nama = String(form?.nama ?? "").trim();

    if (!nama) {
      setErrorMessage("Nama dosen tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({ nama });
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan data dosen.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalForm
      isOpen={isOpen}
      title={mode === "tambah" ? "Tambah Dosen" : "Edit Dosen"}
      description={
        mode === "tambah"
          ? "Tambah data dosen untuk periode ini"
          : "Ubah data dosen untuk periode ini"
      }
      submitLabel={
        isSubmitting
          ? "Menyimpan..."
          : mode === "tambah"
            ? "Tambah Dosen"
            : "Simpan Perubahan"
      }
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

      <Input
        label="Nama Dosen"
        placeholder="Masukkan nama lengkap dosen"
        value={form.nama}
        onChange={(event) =>
          setForm((previous) => ({
            ...previous,
            nama: event.target.value,
          }))
        }
        disabled={isSubmitting}
      />
    </ModalForm>
  );
}
