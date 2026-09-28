import { useEffect, useState } from "react";
import { Input } from "assets-design-system";

import { ModalForm } from "../../../components/master-data/ModalForm";

export interface RuanganFormData {
  nama: string;
}

interface ModalFormRuanganProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: RuanganFormData;
  onClose: () => void;

  /**
   * Bisa synchronous maupun asynchronous.
   * Dipakai supaya modal menunggu request API selesai.
   */
  onSave: (data: RuanganFormData) => void | Promise<void>;
}

const EMPTY_FORM: RuanganFormData = {
  nama: "",
};

export function ModalFormRuangan({
  isOpen,
  mode,
  initialData,
  onClose,
  onSave,
}: ModalFormRuanganProps) {
  const [form, setForm] = useState<RuanganFormData>(EMPTY_FORM);

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

    /**
     * Validasi frontend sederhana.
     * Backend juga melakukan validasi nama.
     */
    if (!form.nama.trim()) {
      setErrorMessage("Nama ruangan tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        nama: form.nama.trim(),
      });

      /**
       * Tutup hanya jika request API berhasil.
       */
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data ruangan.",
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
          ? "Tambah Ruangan"
          : `Edit Ruang ${initialData?.nama ?? ""}`
      }
      description={
        mode === "tambah"
          ? "Tambah data ruangan untuk periode ini"
          : "Ubah data ruangan untuk periode ini"
      }
      submitLabel={mode === "tambah" ? "Tambah Ruangan" : "Simpan Perubahan"}
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
        label="Nama Ruangan"
        placeholder="contoh: CU 205"
        value={form.nama}
        onChange={(e) =>
          setForm({
            nama: e.target.value,
          })
        }
        disabled={isSubmitting}
      />
    </ModalForm>
  );
}
