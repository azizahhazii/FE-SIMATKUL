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
  onSave: (data: RuanganFormData) => void;
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
      onSubmit={handleSubmit}
    >
      <Input
        label="Nama Ruangan"
        placeholder="contoh: CU 205"
        value={form.nama}
        onChange={(e) => setForm({ nama: e.target.value })}
      />
    </ModalForm>
  );
}