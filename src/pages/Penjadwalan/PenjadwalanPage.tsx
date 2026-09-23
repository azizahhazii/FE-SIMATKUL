import { useMemo, useState } from "react";
import { Text } from "assets-design-system";

import { MasterDataToolbar } from "../../components/master-data/MasterDataToolbar";
import {
  DataTable,
  type DataTableColumn,
} from "../../components/master-data/DataTable";
import { RowActions } from "../../components/master-data/RowActions";
import { ModalHapusData } from "../../components/master-data/ModalHapusData";
import { SelectField } from "../../components/master-data/SelectField";
import { PreviewPenjadwalan } from "../../components/penjadwalan/PreviewPenjadwalan";
import { ModalFormJadwal, type JadwalFormData } from "./ModalFormJadwal";
import { cariBentrok } from "../../utils/penjadwalan";
import { dummyPeriodeAkademik } from "../../data/periodeAkademik";
import {
  dummyJadwal,
  dummyOpsiDosen,
  dummyOpsiKelas,
  dummyOpsiMataKuliah,
  dummyOpsiRuang,
} from "../../data/penjadwalan";
import type { Hari, Jadwal, Sesi } from "../../types/penjadwalan";

const EMPTY_STATE = "Pilih periode akademik untuk melanjutkan";

/** Kode MK ikut nama mata kuliah; sementara diambil dari data yang sudah ada. */
function cariKodeMK(nama: string, jadwal: Jadwal[]) {
  return jadwal.find((item) => item.namaMataKuliah === nama)?.kodeMK ?? "";
}

export function PenjadwalanPage() {
  const [periodeId, setPeriodeId] = useState("");
  const [items, setItems] = useState<Jadwal[]>(dummyJadwal);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [prefill, setPrefill] = useState<JadwalFormData | null>(null);
  const [editItem, setEditItem] = useState<Jadwal | null>(null);
  const [deleteItem, setDeleteItem] = useState<Jadwal | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const hasPeriode = Boolean(periodeId);

  const visible = useMemo(() => (hasPeriode ? items : []), [hasPeriode, items]);

  const filtered = visible.filter((item) =>
    item.namaMataKuliah.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const closeForm = () => {
    setIsAddOpen(false);
    setPrefill(null);
    setEditItem(null);
    setErrorMessage("");
  };

  /** Validasi bentrok dipakai bersama oleh tambah dan edit. */
  const validasi = (data: JadwalFormData, ignoreId?: string) => {
    const bentrok = cariBentrok(
      items,
      {
        hari: data.hari as Hari,
        sesi: Number(data.sesi) as Sesi,
        ruang: data.ruang,
        kelas: data.kelas,
        dosen: data.dosen,
      },
      ignoreId,
    );

    if (bentrok.length === 0) return true;

    setErrorMessage(
      `Bentrok dengan ${bentrok[0].namaMataKuliah} (${bentrok[0].kelas}, ${bentrok[0].ruang}) di ${data.hari} sesi ${data.sesi}.`,
    );

    return false;
  };

  const handleAdd = (data: JadwalFormData) => {
    if (!validasi(data)) return;

    setItems((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        prodi: data.prodi,
        kodeMK: cariKodeMK(data.namaMataKuliah, prev),
        namaMataKuliah: data.namaMataKuliah,
        dosen: data.dosen,
        kelas: data.kelas,
        hari: data.hari as Hari,
        sesi: Number(data.sesi) as Sesi,
        ruang: data.ruang,
        sks: 2,
      },
    ]);

    closeForm();
  };

  const handleEdit = (data: JadwalFormData) => {
    if (!editItem) return;
    if (!validasi(data, editItem.id)) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id
          ? {
              ...item,
              prodi: data.prodi,
              namaMataKuliah: data.namaMataKuliah,
              kodeMK: cariKodeMK(data.namaMataKuliah, prev),
              dosen: data.dosen,
              kelas: data.kelas,
              hari: data.hari as Hari,
              sesi: Number(data.sesi) as Sesi,
              ruang: data.ruang,
            }
          : item,
      ),
    );

    closeForm();
  };

  const handleDelete = () => {
    if (!deleteItem) return;

    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));

    setDeleteItem(null);
  };

  const columns: DataTableColumn<Jadwal>[] = [
    {
      key: "mataKuliah",
      header: "Mata Kuliah",
      render: (item) => (
        <span className="flex flex-col">
          <span className="text-b5 text-neutral-800">
            {item.prodi} {item.kodeMK}
          </span>

          <span className="text-b3 text-neutral-1000">
            {item.namaMataKuliah}
          </span>
        </span>
      ),
    },
    {
      key: "dosen",
      header: "Dosen",
      align: "center",
      width: "w-[22%]",
      render: (item) => item.dosen,
    },
    {
      key: "kelas",
      header: "Kelas",
      align: "center",
      width: "w-[10%]",
      render: (item) => item.kelas,
    },
    {
      key: "hari",
      header: "Hari",
      align: "center",
      width: "w-[10%]",
      render: (item) => item.hari,
    },
    {
      key: "sesi",
      header: "Sesi",
      align: "center",
      width: "w-[8%]",
      render: (item) => item.sesi,
    },
    {
      key: "ruang",
      header: "Ruang",
      align: "center",
      width: "w-[12%]",
      render: (item) => item.ruang,
    },
    {
      key: "aksi",
      header: "Aksi",
      align: "center",
      width: "w-24",
      render: (item) => (
        <RowActions
          entityLabel="Jadwal"
          onDelete={() => setDeleteItem(item)}
          onEdit={() => setEditItem(item)}
        />
      ),
    },
  ];

  const toFormData = (item: Jadwal): JadwalFormData => ({
    prodi: item.prodi,
    namaMataKuliah: item.namaMataKuliah,
    dosen: item.dosen,
    kelas: item.kelas,
    hari: item.hari,
    sesi: String(item.sesi),
    ruang: item.ruang,
  });

  return (
    <div className="flex min-h-screen bg-neutral-300">
      <main className="flex flex-1 flex-col gap-6 p-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <Text variant="h4" className="text-primary-400">
              Penjadwalan
            </Text>

            <Text variant="b2" className="text-neutral-800">
              Kelola jadwal mata kuliah untuk setiap periode akademik
            </Text>
          </div>

          <div className="w-[340px]">
            <SelectField
              label="Periode Akademik"
              placeholder="Pilih periode akademik"
              options={dummyPeriodeAkademik.map((periode) => ({
                value: periode.id,
                label: periode.nama,
              }))}
              value={periodeId}
              onChange={setPeriodeId}
            />
          </div>
        </div>

        <PreviewPenjadwalan
          jadwal={visible}
          hasPeriode={hasPeriode}
          opsiRuang={dummyOpsiRuang}
          opsiKelas={dummyOpsiKelas}
          opsiDosen={dummyOpsiDosen}
        />

        <div className="overflow-hidden rounded-2 border border-neutral-600 bg-white">
          <MasterDataToolbar
            searchPlaceholder="Cari nama mata kuliah"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            actionLabel="Tambah Jadwal"
            onAction={() => setIsAddOpen(true)}
            showFilter
          />

          <DataTable
            columns={columns}
            data={filtered}
            getRowKey={(item) => item.id}
            emptyMessage={
              hasPeriode ? "Data jadwal tidak ditemukan." : EMPTY_STATE
            }
          />
        </div>
      </main>

      <ModalFormJadwal
        mode="tambah"
        isOpen={isAddOpen}
        initialData={prefill ?? undefined}
        opsiMataKuliah={dummyOpsiMataKuliah}
        opsiDosen={dummyOpsiDosen}
        opsiKelas={dummyOpsiKelas}
        opsiRuang={dummyOpsiRuang}
        jadwal={items}
        errorMessage={errorMessage}
        onClose={closeForm}
        onSave={handleAdd}
      />

      <ModalFormJadwal
        mode="edit"
        isOpen={Boolean(editItem)}
        initialData={editItem ? toFormData(editItem) : undefined}
        opsiMataKuliah={dummyOpsiMataKuliah}
        opsiDosen={dummyOpsiDosen}
        opsiKelas={dummyOpsiKelas}
        opsiRuang={dummyOpsiRuang}
        jadwal={items}
        ignoreId={editItem?.id}
        errorMessage={errorMessage}
        onClose={closeForm}
        onSave={handleEdit}
      />

      <ModalHapusData
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default PenjadwalanPage;
