import { useEffect, useState } from "react";
import { Input } from "assets-design-system";
import CalendarIcon from "@solar-icons/react/time/Calendar";
import FileRight from "@solar-icons/react/files/FileRight";
import FileRemove from "@solar-icons/react/files/FileRemove";
import { ModalForm } from "./ModalForm";
import { SelectField } from "./SelectField";
import { SEMESTER_PERIODE_OPTIONS } from "./formOptions";
import type { PeriodeAkademik } from "../../types/periodeAkademik";

export interface PeriodeFormData {
  awalTahun: string;
  akhirTahun: string;
  semester: string;
  deskripsi: string;
  sumberData: "salin" | "kosong";
  periodeSumber: string | null;
}

interface ModalFormPeriodeProps {
  isOpen: boolean;
  mode: "tambah" | "edit";
  /** Hanya dipakai saat mode "edit". */
  periode?: PeriodeAkademik | null;
  /** Pilihan untuk dropdown "Pilih periode sumber" pada mode "tambah". */
  periodeList?: PeriodeAkademik[];
  onClose: () => void;
  onSave: (data: PeriodeFormData) => void;
}

const EMPTY_FORM: PeriodeFormData = {
  awalTahun: "",
  akhirTahun: "",
  semester: "",
  deskripsi: "",
  sumberData: "salin",
  periodeSumber: null,
};

const SUMBER_DATA_CARDS = [
  {
    id: "salin" as const,
    icon: FileRight,
    judul: "Salin dari periode lain",
    keterangan:
      "Kurikulum, ruang, dosen, kelas, dan sesi disalin. Perubahan tidak mempengaruhi periode asal.",
  },
  {
    id: "kosong" as const,
    icon: FileRemove,
    judul: "Mulai kosong",
    keterangan:
      "Semua data perlu ditambahkan dari awal, tidak ada yang disalin.",
  },
];

/** "Gasal 2026/2027 – Draft 1" -> { semester, awalTahun, deskripsi }. */
function parseNamaPeriode(nama: string): Partial<PeriodeFormData> {
  const [utama, deskripsi = ""] = nama.split(" – ");
  const [semester = "", tahun = ""] = utama.split(" ");
  const [awalTahun = ""] = tahun.split("/");
  return { semester, awalTahun, deskripsi };
}

export function ModalFormPeriode({
  isOpen,
  mode,
  periode,
  periodeList = [],
  onClose,
  onSave,
}: ModalFormPeriodeProps) {
  const [form, setForm] = useState<PeriodeFormData>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      mode === "edit" && periode
        ? { ...EMPTY_FORM, ...parseNamaPeriode(periode.nama) }
        : EMPTY_FORM,
    );
  }, [isOpen, mode, periode]);

  const akhirTahun = /^\d{4}$/.test(form.awalTahun)
    ? String(Number(form.awalTahun) + 1)
    : "";

  const handleSubmit = () => {
    onSave({
      ...form,
      akhirTahun,
      periodeSumber: form.sumberData === "salin" ? form.periodeSumber : null,
    });
    onClose();
  };

  const namaPeriode = periode ? periode.nama.split(" – ")[0] : "";

  return (
    <ModalForm
      isOpen={isOpen}
      title={
        mode === "tambah"
          ? "Tambah periode baru"
          : `Edit Periode Akademik ${namaPeriode}`
      }
      description={
        mode === "tambah"
          ? "Tentukan tahun ajaran dan semester untuk periode akademik baru"
          : "Ubah tahun ajaran, semester, atau deskripsi periode ini"
      }
      submitLabel={mode === "tambah" ? "Tambah Periode" : "Simpan Perubahan"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Awal tahun ajaran"
          placeholder="contoh: 2026"
          leftIcon={<CalendarIcon weight="BoldDuotone" />}
          value={form.awalTahun}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, awalTahun: e.target.value }))
          }
        />
        <Input
          label="Akhir tahun ajaran"
          placeholder="terisi otomatis"
          leftIcon={<CalendarIcon weight="BoldDuotone" />}
          value={akhirTahun}
          disabled
        />
      </div>

      <SelectField
        label="Semester"
        placeholder="Gasal/Genap"
        options={SEMESTER_PERIODE_OPTIONS}
        value={form.semester}
        onChange={(value) => setForm((prev) => ({ ...prev, semester: value }))}
      />

      <Input
        label="Deskripsi (Opsional)"
        placeholder="contoh: Draft 1"
        helperText="Maks. 12 huruf"
        maxLength={12}
        value={form.deskripsi}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
        }
      />

      {mode === "tambah" && (
        <div className="flex flex-col gap-2">
          <span className="text-b2 text-neutral-1000">Sumber Data</span>

          <div className="grid grid-cols-2 gap-3.5">
            {SUMBER_DATA_CARDS.map((card) => {
              const Icon = card.icon;
              const isSelected = form.sumberData === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, sumberData: card.id }))
                  }
                  className={`flex flex-col items-start gap-2 rounded-3 border p-3.5 text-left transition ${
                    isSelected
                      ? "border-primary-400 bg-primary-100"
                      : "border-transparent bg-neutral-400 hover:bg-neutral-500"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon
                      weight="BoldDuotone"
                      className={`size-5 shrink-0 ${
                        isSelected ? "text-primary-400" : "text-neutral-800"
                      }`}
                    />
                    <span
                      className={`text-b4 font-bold ${
                        isSelected ? "text-primary-400" : "text-neutral-1000"
                      }`}
                    >
                      {card.judul}
                    </span>
                  </span>
                  <span
                    className={`text-b5 ${
                      isSelected ? "text-primary-400" : "text-neutral-800"
                    }`}
                  >
                    {card.keterangan}
                  </span>
                </button>
              );
            })}
          </div>

          {form.sumberData === "salin" && (
            <SelectField
              placeholder="Pilih periode sumber"
              options={periodeList.map((item) => ({
                value: item.id,
                label: item.nama,
              }))}
              value={form.periodeSumber ?? ""}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, periodeSumber: value }))
              }
            />
          )}
        </div>
      )}
    </ModalForm>
  );
}