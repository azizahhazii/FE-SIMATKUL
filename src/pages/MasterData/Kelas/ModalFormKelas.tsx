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
  /** Kode kelas yang sedang diedit, mis. "PL1AA" — dipakai di judul modal. */
  namaKelas?: string;
  onClose: () => void;
  onSave: (data: KelasFormData) => void;
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
        mode === "tambah" ? "Tambah Kelas" : `Edit Kelas ${namaKelas ?? ""}`
      }
      description={
        mode === "tambah"
          ? "Tambah data kelas untuk periode ini"
          : "Ubah data kelas untuk periode ini"
      }
      submitLabel={mode === "tambah" ? "Tambah Kelas" : "Simpan Perubahan"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <span className="text-b2 text-neutral-1000">Program Studi</span>
        <ProdiFilterCards
          selected={form.prodi}
          onSelect={(prodi) => setForm((prev) => ({ ...prev, prodi }))}
          size="compact"
        />
      </div>

      <SelectField
        label="Semester"
        placeholder="pilih semester"
        options={SEMESTER_OPTIONS}
        value={form.semester}
        onChange={(semester) => setForm((prev) => ({ ...prev, semester }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Jumlah Kelas Teori"
          placeholder="pilih jumlah kelas"
          options={JUMLAH_KELAS_OPTIONS}
          value={form.jumlahTeori}
          onChange={(jumlahTeori) =>
            setForm((prev) => ({ ...prev, jumlahTeori }))
          }
        />
        <SelectField
          label="Jumlah Kelas Praktikum"
          placeholder="pilih jumlah kelas"
          options={JUMLAH_KELAS_OPTIONS}
          value={form.jumlahPraktikum}
          onChange={(jumlahPraktikum) =>
            setForm((prev) => ({ ...prev, jumlahPraktikum }))
          }
        />
      </div>
    </ModalForm>
  );
}