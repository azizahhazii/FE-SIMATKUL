import { useEffect, useState } from "react";
import { Input } from "assets-design-system";

import { ModalForm } from "../../../components/master-data/ModalForm";

export interface DosenFormData {
  nama: string;
  nidn: string;
  jabatan_akademik: string;
}

interface ModalFormDosenProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: DosenFormData;
  onClose: () => void;

  /**
   * Bisa synchronous maupun asynchronous
   * karena data disimpan ke backend.
   */
  onSave: (data: DosenFormData) => void | Promise<void>;
}

const EMPTY_FORM: DosenFormData = {
  nama: "",
  nidn: "",
  jabatan_akademik: "",
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

    setForm(initialData ?? EMPTY_FORM);
    setErrorMessage("");
    setIsSubmitting(false);
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setErrorMessage("");

    // Validasi nama
    if (!form.nama.trim()) {
      setErrorMessage("Nama dosen tidak boleh kosong.");
      return;
    }

    // Validasi NIDN
    if (!form.nidn.trim()) {
      setErrorMessage("NIDN tidak boleh kosong.");
      return;
    }

    // Validasi jabatan akademik
    if (!form.jabatan_akademik.trim()) {
      setErrorMessage("Jabatan akademik tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        nama: form.nama.trim(),
        nidn: form.nidn.trim(),
        jabatan_akademik: form.jabatan_akademik.trim(),
      });

      /**
       * Modal hanya ditutup setelah request
       * backend berhasil.
       */
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
      submitLabel={mode === "tambah" ? "Tambah Dosen" : "Simpan Perubahan"}
      onClose={onClose}
      onSubmit={() => {
        void handleSubmit();
      }}
    >
      {/* ================= ERROR ================= */}
      {errorMessage && (
        <div className="rounded-2 border border-red-200 bg-red-50 px-3 py-2.5">
          <p className="text-b4 text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* ================= NAMA ================= */}
      <Input
        label="Nama Dosen"
        placeholder="masukan nama lengkap dosen"
        value={form.nama}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nama: e.target.value,
          }))
        }
        disabled={isSubmitting}
      />

      {/* ================= NIDN ================= */}
      <Input
        label="NIDN"
        placeholder="masukan NIDN dosen"
        value={form.nidn}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            nidn: e.target.value,
          }))
        }
        disabled={isSubmitting}
      />

      {/* ================= JABATAN ================= */}
      <Input
        label="Jabatan Akademik"
        placeholder="contoh: Lektor"
        value={form.jabatan_akademik}
        onChange={(e) =>
          setForm((prev) => ({
            ...prev,
            jabatan_akademik: e.target.value,
          }))
        }
        disabled={isSubmitting}
      />
    </ModalForm>
  );
}
