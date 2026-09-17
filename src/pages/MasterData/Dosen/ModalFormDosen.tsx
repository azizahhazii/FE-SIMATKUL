import { useEffect, useState } from "react";
import { Input } from "assets-design-system";
import { ModalForm } from "../../../components/master-data/ModalForm";

export interface DosenFormData {
  nama: string;
}

interface ModalFormDosenProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: DosenFormData;
  onClose: () => void;
  onSave: (data: DosenFormData) => void;
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

  useEffect(() => {
    if (isOpen) setForm(initialData ?? EMPTY_FORM);
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    onSave(form);
    onClose();
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
      onSubmit={handleSubmit}
    >
      <Input
        label="Nama Dosen"
        placeholder="masukan nama lengkap dosen"
        value={form.nama}
        onChange={(e) => setForm({ nama: e.target.value })}
      />
    </ModalForm>
  );
}