import { useEffect, useState } from "react";
import { Input } from "assets-design-system";
import ClockCircle from "@solar-icons/react/time/ClockCircle";
import { ModalForm } from "../../../components/master-data/ModalForm";

export interface SesiFormData {
  jamMulai: string;
  jamBerakhir: string;
}

interface ModalFormSesiProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  initialData?: SesiFormData;
  /** Nomor sesi yang sedang diedit, mis. "Sesi 1" — dipakai di judul modal. */
  nomorSesi?: string;
  onClose: () => void;
  onSave: (data: SesiFormData) => void;
}

const EMPTY_FORM: SesiFormData = {
  jamMulai: "",
  jamBerakhir: "",
};

export function ModalFormSesi({
  isOpen,
  mode,
  initialData,
  nomorSesi,
  onClose,
  onSave,
}: ModalFormSesiProps) {
  const [form, setForm] = useState<SesiFormData>(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) setForm(initialData ?? EMPTY_FORM);
  }, [isOpen, initialData]);

  const handleSubmit = () => {
    if (!form.jamMulai || !form.jamBerakhir) return;
    onSave(form);
    onClose();
  };

  return (
    <ModalForm
      isOpen={isOpen}
      title={mode === "tambah" ? "Tambah Sesi" : `Edit ${nomorSesi ?? "Sesi"}`}
      description={
        mode === "tambah"
          ? "Tambah data sesi untuk periode ini"
          : "Ubah data sesi untuk periode ini"
      }
      submitLabel={mode === "tambah" ? "Tambah Sesi" : "Simpan Perubahan"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Jam Mulai"
          placeholder="00.00 WIB"
          leftIcon={<ClockCircle weight="BoldDuotone" />}
          value={form.jamMulai}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, jamMulai: e.target.value }))
          }
        />
        <Input
          label="Jam Berakhir"
          placeholder="00.00 WIB"
          leftIcon={<ClockCircle weight="BoldDuotone" />}
          value={form.jamBerakhir}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, jamBerakhir: e.target.value }))
          }
        />
      </div>
    </ModalForm>
  );
}