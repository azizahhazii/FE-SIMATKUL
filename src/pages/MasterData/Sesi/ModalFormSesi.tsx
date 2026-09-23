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

  /** Nomor sesi yang sedang diedit, mis. "Sesi 1". */
  nomorSesi?: string;

  onClose: () => void;

  /**
   * Bisa synchronous maupun asynchronous karena
   * sekarang penyimpanan dilakukan ke backend.
   */
  onSave: (data: SesiFormData) => void | Promise<void>;
}

const EMPTY_FORM: SesiFormData = {
  jamMulai: "",
  jamBerakhir: "",
};

/**
 * Normalisasi format waktu dari input UI.
 *
 * Mendukung:
 * 07.15 WIB
 * 07:15
 */
function parseTime(value: string): number | null {
  const normalized = value
    .trim()
    .replace(/\s*WIB\s*/i, "")
    .replace(".", ":");

  const match = normalized.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return hour * 60 + minute;
}

function isTimeRangeValid(start: string, end: string): boolean {
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);

  if (startMinutes === null || endMinutes === null) {
    return false;
  }

  return startMinutes < endMinutes;
}

export function ModalFormSesi({
  isOpen,
  mode,
  initialData,
  nomorSesi,
  onClose,
  onSave,
}: ModalFormSesiProps) {
  const [form, setForm] = useState<SesiFormData>(EMPTY_FORM);

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

    if (!form.jamMulai.trim()) {
      setErrorMessage("Jam mulai tidak boleh kosong.");
      return;
    }

    if (!form.jamBerakhir.trim()) {
      setErrorMessage("Jam berakhir tidak boleh kosong.");
      return;
    }

    if (parseTime(form.jamMulai) === null) {
      setErrorMessage("Format jam mulai tidak valid. Contoh: 07.15 WIB.");
      return;
    }

    if (parseTime(form.jamBerakhir) === null) {
      setErrorMessage("Format jam berakhir tidak valid. Contoh: 08.55 WIB.");
      return;
    }

    /**
     * Harus sama dengan rule di backend:
     * jam mulai < jam akhir.
     */
    if (!isTimeRangeValid(form.jamMulai, form.jamBerakhir)) {
      setErrorMessage("Jam mulai harus lebih awal daripada jam berakhir.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(form);

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menyimpan data sesi.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

      {/* ================= JAM ================= */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Jam Mulai"
          placeholder="00.00 WIB"
          leftIcon={<ClockCircle weight="BoldDuotone" />}
          value={form.jamMulai}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              jamMulai: e.target.value,
            }))
          }
          disabled={isSubmitting}
        />

        <Input
          label="Jam Berakhir"
          placeholder="00.00 WIB"
          leftIcon={<ClockCircle weight="BoldDuotone" />}
          value={form.jamBerakhir}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              jamBerakhir: e.target.value,
            }))
          }
          disabled={isSubmitting}
        />
      </div>
    </ModalForm>
  );
}

export default ModalFormSesi;
