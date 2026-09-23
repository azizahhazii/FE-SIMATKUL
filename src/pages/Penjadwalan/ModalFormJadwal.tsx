import { useEffect, useMemo, useState } from "react";

import { ModalForm } from "../../components/master-data/ModalForm";

import {
  SelectField,
  type SelectOption,
} from "../../components/master-data/SelectField";

import {
  ProdiFilterCards,
  type ProdiId,
} from "../../components/master-data/ProdiFilterCards";

import { HARI_LIST, SESI_LIST, type Jadwal } from "../../types/penjadwalan";

import { getSlotUsage } from "../../utils/penjadwalan";

export interface JadwalFormData {
  prodi: ProdiId;
  namaMataKuliah: string;
  dosen: string;
  kelas: string;
  hari: string;
  sesi: string;
  ruang: string;
}

interface ModalFormJadwalProps {
  isOpen: boolean;
  mode: "tambah" | "edit";

  initialData?: JadwalFormData;

  opsiMataKuliah: string[];
  opsiDosen: string[];
  opsiKelas: string[];
  opsiRuang: string[];

  jadwal: Jadwal[];

  ignoreId?: string;

  errorMessage?: string;

  onClose: () => void;

  onSave: (data: JadwalFormData) => void;
}

const EMPTY_FORM: JadwalFormData = {
  prodi: "TRPL",
  namaMataKuliah: "",
  dosen: "",
  kelas: "",
  hari: "",
  sesi: "",
  ruang: "",
};

const toOptions = (values: string[], usedSet?: Set<string>): SelectOption[] =>
  values.map((value) => ({
    value,
    label: value,
    disabled: usedSet?.has(value) ?? false,
  }));

const HARI_OPTIONS = HARI_LIST.map((value) => ({
  value,
  label: value,
}));

const SESI_OPTIONS = SESI_LIST.map((sesi) => ({
  value: String(sesi),
  label: `Sesi ${sesi}`,
}));

export function ModalFormJadwal({
  isOpen,
  mode,
  initialData,
  opsiMataKuliah,
  opsiDosen,
  opsiKelas,
  opsiRuang,
  jadwal,
  ignoreId,
  errorMessage,
  onClose,
  onSave,
}: ModalFormJadwalProps) {
  const [form, setForm] = useState<JadwalFormData>(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  /**
   * Saat modal dibuka:
   *
   * - tombol Tambah Jadwal
   *   -> form kosong
   *
   * - klik slot Preview
   *   -> form memakai data prefill
   *
   * - Edit
   *   -> form memakai data jadwal
   */
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setForm(initialData ?? EMPTY_FORM);

    setFormError("");
  }, [isOpen, initialData]);

  /**
   * Jadwal yang sedang diedit tidak
   * ikut dihitung sebagai konflik.
   */
  const jadwalUntukConflict = useMemo(() => {
    if (!ignoreId) {
      return jadwal;
    }

    return jadwal.filter((item) => item.id !== ignoreId);
  }, [jadwal, ignoreId]);

  /**
   * Availability dihitung berdasarkan
   * Hari + Sesi yang sedang dipilih.
   */
  const usage = useMemo(
    () => getSlotUsage(jadwalUntukConflict, form.hari, form.sesi),
    [jadwalUntukConflict, form.hari, form.sesi],
  );

  const handleSubmit = () => {
    setFormError("");

    if (
      !form.namaMataKuliah ||
      !form.dosen ||
      !form.kelas ||
      !form.hari ||
      !form.sesi ||
      !form.ruang
    ) {
      setFormError("Semua field harus diisi.");
      return;
    }

    /**
     * Cek ulang sebelum submit.
     */
    if (usage.dosen.has(form.dosen)) {
      setFormError("Dosen sudah digunakan pada hari dan sesi tersebut.");
      return;
    }

    if (usage.kelas.has(form.kelas)) {
      setFormError("Kelas sudah digunakan pada hari dan sesi tersebut.");
      return;
    }

    if (usage.ruang.has(form.ruang)) {
      setFormError("Ruang sudah digunakan pada hari dan sesi tersebut.");
      return;
    }

    onSave(form);
  };

  const displayedError = errorMessage || formError;

  return (
    <ModalForm
      isOpen={isOpen}
      title={mode === "tambah" ? "Tambah Jadwal" : "Edit Jadwal"}
      description="Tambahkan jadwal untuk Periode Akademik terpilih"
      submitLabel={mode === "tambah" ? "Tambah Jadwal" : "Simpan Perubahan"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* PROGRAM STUDI */}
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

      {/* MATA KULIAH */}
      <SelectField
        label="Mata Kuliah"
        placeholder="Pilih mata kuliah"
        options={toOptions(opsiMataKuliah)}
        value={form.namaMataKuliah}
        onChange={(namaMataKuliah) =>
          setForm((prev) => ({
            ...prev,
            namaMataKuliah,
          }))
        }
      />

      {/* DOSEN */}
      <SelectField
        label="Dosen"
        placeholder="Pilih dosen mata kuliah terkait"
        options={toOptions(opsiDosen, usage.dosen)}
        value={form.dosen}
        onChange={(dosen) =>
          setForm((prev) => ({
            ...prev,
            dosen,
          }))
        }
      />

      {/* KELAS + HARI */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Kelas"
          placeholder="Pilih kelas"
          options={toOptions(opsiKelas, usage.kelas)}
          value={form.kelas}
          onChange={(kelas) =>
            setForm((prev) => ({
              ...prev,
              kelas,
            }))
          }
        />

        <SelectField
          label="Hari"
          placeholder="Pilih hari"
          options={HARI_OPTIONS}
          value={form.hari}
          onChange={(hari) =>
            setForm((prev) => ({
              ...prev,
              hari,
            }))
          }
        />
      </div>

      {/* SESI + RUANG */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Sesi"
          placeholder="Tentukan sesi"
          options={SESI_OPTIONS}
          value={form.sesi}
          onChange={(sesi) =>
            setForm((prev) => ({
              ...prev,
              sesi,
            }))
          }
        />

        <SelectField
          label="Ruang"
          placeholder="Tentukan ruang"
          options={toOptions(opsiRuang, usage.ruang)}
          value={form.ruang}
          onChange={(ruang) =>
            setForm((prev) => ({
              ...prev,
              ruang,
            }))
          }
        />
      </div>

      {displayedError && (
        <p className="text-b4 text-[#E5484D]">{displayedError}</p>
      )}
    </ModalForm>
  );
}
