import { useState } from 'react'
import { Button, Input, Text } from 'assets-design-system'
import Magnifer from '@solar-icons/react/search/Magnifer'
import { AddCircleIcon } from '../components/icons/AddCircleIcon'
import { PeriodeAkademikCard } from '../components/master-data/PeriodeAkademikCard'
import { TambahPeriodeModal } from '../components/master-data/TambahPeriodeModal'
import { HapusPeriodeModal } from '../components/master-data/HapusPeriodeModal'
import { EditPeriodeModal } from '../components/master-data/EditPeriodeModal'
import { dummyPeriodeAkademik } from '../data/periodeAkademik'
import type { PeriodeAkademik } from '../types/periodeAkademik'

// Import komponen Kelas dan Sesi
import { Kelas } from './MasterData/Kelas/Kelas'
import { Sesi } from './MasterData/Sesi/Sesi'

export function MasterDataPage() {
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [periodeList, setPeriodeList] = useState<PeriodeAkademik[]>(dummyPeriodeAkademik)
  const [selectedDelete, setSelectedDelete] = useState<PeriodeAkademik | null>(null)
  const [selectedEdit, setSelectedEdit] = useState<PeriodeAkademik | null>(null)
  const [selectedPeriode, setSelectedPeriode] = useState<PeriodeAkademik | null>(null)

  // State untuk menyimpan tab yang aktif (default: 'Kelas')
  const [activeTab, setActiveTab] = useState<string>('Kelas')

  // Filter daftar periode berdasarkan query pencarian
  const filtered = periodeList.filter((p) =>
    p.nama.toLowerCase().includes(query.toLowerCase())
  )

  // Handler untuk menambah periode baru dari modal
  const handleAddPeriode = (data: {
    awalTahun: string
    akhirTahun: string
    semester: string
    deskripsi?: string
  }) => {
    const namaPeriode = `${data.semester} ${data.awalTahun}/${data.akhirTahun}${
      data.deskripsi ? ` – ${data.deskripsi}` : ''
    }`

    const newPeriode: PeriodeAkademik = {
      id: String(Date.now()),
      nama: namaPeriode,
      jumlahKurikulum: 0,
      jumlahRuang: 0,
      jumlahDosen: 0,
      jumlahKelas: 0,
      jumlahSesi: 0,
    }

    setPeriodeList((prev) => [newPeriode, ...prev])
  }

  // Handler untuk menyimpan hasil edit periode
  const handleEditPeriode = (updated: { id: string; nama: string }) => {
    setPeriodeList((prev) =>
      prev.map((item) =>
        item.id === updated.id ? { ...item, nama: updated.nama } : item
      )
    )
  }

  // Handler untuk konfirmasi hapus periode
  const handleConfirmDelete = () => {
    if (selectedDelete) {
      setPeriodeList((prev) => prev.filter((p) => p.id !== selectedDelete.id))
      setSelectedDelete(null)
    }
  }

  // Render halaman detail (Kelas/Sesi) jika ada periode yang dipilih
  if (selectedPeriode) {
    return (
      <>
        {activeTab === 'Kelas' && (
          <Kelas
            namaPeriode={selectedPeriode.nama}
            onTabChange={(tabName: string) => setActiveTab(tabName)}
          />
        )}

        {activeTab === 'Sesi' && (
          <Sesi
            namaPeriode={selectedPeriode.nama}
            onTabChange={(tabName: string) => setActiveTab(tabName)}
          />
        )}

        {/* Placeholder untuk tab Kurikulum, Ruangan, Dosen yang belum dibuat */}
        {activeTab !== 'Kelas' && activeTab !== 'Sesi' && (
          <div className="p-8 flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setSelectedPeriode(null)}
              className="text-xs text-[#0097A7] font-semibold w-fit hover:underline"
            >
              &lt; Kembali ke Daftar Periode
            </button>
            <div className="flex items-center gap-2">
              {(['Kurikulum', 'Ruangan', 'Dosen', 'Kelas', 'Sesi'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-5 py-2 text-xs font-semibold transition ${
                      activeTab === tab
                        ? 'bg-[#0097A7] text-white shadow-sm'
                        : 'border border-[#0097A7] bg-white text-[#0097A7] hover:bg-cyan-50'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Halaman <strong>{activeTab}</strong> sedang dalam pengembangan.
            </p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen bg-neutral-300">
      <main className="flex flex-1 flex-col gap-8 p-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <Text variant="h4" className="text-primary-500">
              Master Data
            </Text>
            <Text variant="b2" className="text-neutral-800">
              Kelola kurikulum, ruang, dosen, kelas, dan sesi untuk setiap periode akademik
            </Text>
          </div>

          <Button
            theme="primary"
            variant="solid"
            iconLeft={<AddCircleIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Tambah Periode Akademik
          </Button>
        </div>

        <Input
          placeholder="Cari periode akademik"
          leftIcon={<Magnifer weight="LineDuotone" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="flex flex-col gap-6">
          {filtered.map((periode) => (
            <PeriodeAkademikCard
              key={periode.id}
              periode={periode}
              onOpen={() => {
                setSelectedPeriode(periode)
                setActiveTab('Kelas') // Reset ke tab Kelas saat membuka periode
              }}
              onEdit={(item) => setSelectedEdit(item)}
              onDelete={(item) => setSelectedDelete(item)}
            />
          ))}
        </div>
      </main>

      {/* Modal Tambah Periode Akademik */}
      <TambahPeriodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddPeriode}
      />

      {/* Modal Edit Periode Akademik */}
      <EditPeriodeModal
        isOpen={Boolean(selectedEdit)}
        periode={selectedEdit}
        onClose={() => setSelectedEdit(null)}
        onSubmit={handleEditPeriode}
      />

      {/* Modal Hapus Periode Akademik */}
      <HapusPeriodeModal
        isOpen={Boolean(selectedDelete)}
        namaPeriode={selectedDelete?.nama}
        onClose={() => setSelectedDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}