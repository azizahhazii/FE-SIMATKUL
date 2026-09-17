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
  onSave: (data: MataKuliahFormData) => void;
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
          ? "Tambah Mata Kuliah"
          : `Edit Mata Kuliah ${initialData?.namaMataKuliah ?? ""}`
      }
      description={
        mode === "tambah"
          ? "Tambah data mata kuliah untuk periode ini"
          : "Ubah data mata kuliah untuk periode ini"
      }
      submitLabel={mode === "tambah" ? "Tambah Mata Kuliah" : "Simpan Perubahan"}
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

      <Input
        label="Nama Mata Kuliah"
        placeholder="contoh: Bahasa Inggris 1"
        value={form.namaMataKuliah}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, namaMataKuliah: e.target.value }))
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Kode MK"
          placeholder="contoh: SVIK214105"
          value={form.kodeMK}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, kodeMK: e.target.value }))
          }
        />
        <SelectField
          label="Semester"
          placeholder="pilih semester"
          options={SEMESTER_OPTIONS}
          value={form.semester}
          onChange={(semester) => setForm((prev) => ({ ...prev, semester }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Bobot SKS"
          placeholder="contoh: 2"
          type="number"
          min={0}
          value={form.sks}
          onChange={(e) => setForm((prev) => ({ ...prev, sks: e.target.value }))}
        />
        <SelectField
          label="Tipe Kelas"
          placeholder="MKK/MKDU"
          options={TIPE_KELAS_OPTIONS}
          value={form.kelompok}
          onChange={(kelompok) => setForm((prev) => ({ ...prev, kelompok }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Jenis"
          placeholder="Wajib/Pilihan"
          options={JENIS_MATA_KULIAH_OPTIONS}
          value={form.jenis}
          onChange={(jenis) => setForm((prev) => ({ ...prev, jenis }))}
        />
        <SelectField
          label="Kelompok"
          placeholder="Teori/Praktikum"
          options={KELOMPOK_MATA_KULIAH_OPTIONS}
          value={form.tipe}
          onChange={(tipe) => setForm((prev) => ({ ...prev, tipe }))}
        />
      </div>
    </ModalForm>
  );
}