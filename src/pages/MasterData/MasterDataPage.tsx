import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Text } from "assets-design-system";
import Magnifer from "@solar-icons/react/search/Magnifer";

import { AddCircleIcon } from "../../components/icons/AddCircleIcon";
import { PeriodeAkademikCard } from "../../components/master-data/PeriodeAkademikCard";
import {
  ModalFormPeriode,
  type PeriodeFormData,
} from "../../components/master-data/ModalFormPeriode";
import { ModalHapusData } from "../../components/master-data/ModalHapusData";
import { dummyPeriodeAkademik } from "../../data/periodeAkademik";
import type { PeriodeAkademik } from "../../types/periodeAkademik";

/** "Gasal" + "2026" + "2027" + "Draft 1" -> "Gasal 2026/2027 – Draft 1". */
function buatNamaPeriode(data: PeriodeFormData) {
  const tahun = `${data.awalTahun}/${data.akhirTahun}`;
  const deskripsi = data.deskripsi ? ` – ${data.deskripsi}` : "";
  return `${data.semester} ${tahun}${deskripsi}`;
}

export function MasterDataPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<PeriodeAkademik[]>(dummyPeriodeAkademik);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<PeriodeAkademik | null>(null);
  const [deleteItem, setDeleteItem] = useState<PeriodeAkademik | null>(null);

  const filtered = items.filter((item) =>
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAdd = (data: PeriodeFormData) => {
    setItems((prev) => [
      {
        id: String(Date.now()),
        nama: buatNamaPeriode(data),
        jumlahKurikulum: 0,
        jumlahRuang: 0,
        jumlahDosen: 0,
        jumlahKelas: 0,
        jumlahSesi: 0,
      },
      ...prev,
    ]);
  };

  const handleEdit = (data: PeriodeFormData) => {
    if (!editItem) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === editItem.id ? { ...item, nama: buatNamaPeriode(data) } : item,
      ),
    );
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <div className="flex min-h-screen bg-neutral-300">
      <main className="flex flex-1 flex-col gap-8 p-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="h4" className="text-primary-400">
              Master Data
            </Text>
            <Text variant="b2" className="text-neutral-800">
              Kelola kurikulum, ruang, dosen, kelas, dan sesi untuk setiap
              periode akademik
            </Text>
          </div>

          <Button
            theme="primary"
            variant="solid"
            iconLeft={<AddCircleIcon />}
            onClick={() => setIsAddOpen(true)}
          >
            Tambah Periode Akademik
          </Button>
        </div>

        <Input
          placeholder="Cari periode akademik"
          leftIcon={<Magnifer weight="LineDuotone" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex flex-col gap-6">
          {filtered.length > 0 ? (
            filtered.map((periode) => (
              <PeriodeAkademikCard
                key={periode.id}
                periode={periode}
                onOpen={() => navigate(`/master-data/${periode.id}/kurikulum`)}
                onEdit={setEditItem}
                onDelete={setDeleteItem}
              />
            ))
          ) : (
            <div className="flex w-full items-center justify-center rounded-3 bg-white py-8 shadow-e1">
              <Text variant="b2" className="text-neutral-800">
                {items.length === 0
                  ? "Belum ada data periode akademik"
                  : "Periode akademik tidak ditemukan"}
              </Text>
            </div>
          )}
        </div>
      </main>

      <ModalFormPeriode
        mode="tambah"
        isOpen={isAddOpen}
        periodeList={items}
        onClose={() => setIsAddOpen(false)}
        onSave={handleAdd}
      />
      <ModalFormPeriode
        mode="edit"
        isOpen={Boolean(editItem)}
        periode={editItem}
        onClose={() => setEditItem(null)}
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

export default MasterDataPage;