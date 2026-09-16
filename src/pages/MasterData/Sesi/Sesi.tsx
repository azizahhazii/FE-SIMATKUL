import { useState } from 'react'
import { Input, Button } from 'assets-design-system'

// Icons
import Magnifer from '@solar-icons/react/search/Magnifer'
import Pen from '@solar-icons/react/messages/Pen'
import TrashBinMinimalistic from '@solar-icons/react/ui/TrashBinMinimalistic'

// Summary Cards Icons
import BookmarkIcon from '@solar-icons/react/school/BookMarkSquare'
import Key from '@solar-icons/react/security/Key'
import UserId from '@solar-icons/react/users/UserId'
import UsersGroupRounded from '@solar-icons/react/users/UsersGroupRounded'
import ClockCircle from '@solar-icons/react/time/ClockCircle'

// Import Modals Sesi
import { ModalHapusSesi } from './ModalHapusSesi'
import { ModalTambahSesi } from './ModalTambahSesi'
import { ModalEditSesi } from './ModalEditSesi'

interface SesiProps {
  namaPeriode?: string
  onTabChange?: (tabName: string) => void
}

interface SesiItem {
  id: string
  nomor: string
  jamMulai: string
  jamBerakhir: string
}

const initialSesiList: SesiItem[] = [
  { id: '1', nomor: 'Sesi 1', jamMulai: '07.15 WIB', jamBerakhir: '8.55 WIB' },
  { id: '2', nomor: 'Sesi 2', jamMulai: '09.00 WIB', jamBerakhir: '10.30 WIB' },
  { id: '3', nomor: 'Sesi 3', jamMulai: '11.00 WIB', jamBerakhir: '12.30 WIB' },
  { id: '4', nomor: 'Sesi 4', jamMulai: '13.00 WIB', jamBerakhir: '14.30 WIB' },
  { id: '5', nomor: 'Sesi 5', jamMulai: '15.00 WIB', jamBerakhir: '16.30 WIB' },
]

export function Sesi({
  namaPeriode = 'Semester Gasal 2026/2027',
  onTabChange,
}: SesiProps) {
  const [sesiList, setSesiList] = useState<SesiItem[]>(initialSesiList)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Selected Data States
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null)
  const [selectedEditSesi, setSelectedEditSesi] = useState<SesiItem | null>(null)

  // Filter Sesi berdasarkan pencarian
  const filteredSesi = sesiList.filter(
    (item) =>
      item.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jamMulai.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.jamBerakhir.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handlers Modal Hapus
  const handleOpenDeleteModal = (id: string) => {
    setSelectedDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedDeleteId) {
      setSesiList((prev) => prev.filter((item) => item.id !== selectedDeleteId))
      setSelectedDeleteId(null)
    }
    setIsDeleteModalOpen(false)
  }

  // Handlers Modal Tambah
  const handleSaveTambah = (jamMulai: string, jamBerakhir: string) => {
    const nextNomor = `Sesi ${sesiList.length + 1}`
    const newSesi: SesiItem = {
      id: String(Date.now()),
      nomor: nextNomor,
      jamMulai,
      jamBerakhir,
    }
    setSesiList((prev) => [...prev, newSesi])
    setIsAddModalOpen(false)
  }

  // Handlers Modal Edit
  const handleOpenEditModal = (sesi: SesiItem) => {
    setSelectedEditSesi(sesi)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = (id: string, jamMulai: string, jamBerakhir: string) => {
    setSesiList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, jamMulai, jamBerakhir } : item
      )
    )
    setIsEditModalOpen(false)
    setSelectedEditSesi(null)
  }

  return (
    <div className="w-full min-h-screen bg-transparent">
      <main className="flex flex-1 flex-col gap-6 p-8 bg-transparent">
        
        {/* Breadcrumb & Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Master Data</span>
            <span>&gt;</span>
            <span className="text-slate-600 font-medium">{namaPeriode}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0097A7]">{namaPeriode}</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <BookmarkIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">425</span>
              <span className="text-[11px] text-slate-500">Data Kurikulum</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Key weight="BoldDuotone" className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">60</span>
              <span className="text-[11px] text-slate-500">Daftar Ruang</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <UserId weight="BoldDuotone" className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">63</span>
              <span className="text-[11px] text-slate-500">Daftar Dosen</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <UsersGroupRounded weight="BoldDuotone" className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">22</span>
              <span className="text-[11px] text-slate-500">Daftar Kelas</span>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/60">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <ClockCircle weight="BoldDuotone" className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-800">{sesiList.length}</span>
              <span className="text-[11px] text-slate-500">Sesi</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-2">
          {(['Kurikulum', 'Ruangan', 'Dosen', 'Kelas', 'Sesi'] as const).map(
            (tab) => {
              const isActive = tab === 'Sesi'
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange?.(tab)}
                  className={`rounded-xl px-5 py-2 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#0097A7] text-white shadow-sm'
                      : 'border border-[#0097A7] bg-white text-[#0097A7] hover:bg-cyan-50'
                  }`}
                >
                  {tab}
                </button>
              )
            }
          )}
        </div>

        {/* Container Tabel & Action Bar */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          
          <div className="flex items-center justify-between gap-3">
            <div className="w-80">
              <Input
                placeholder="Cari sesi"
                leftIcon={<Magnifer weight="LineDuotone" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              theme="primary"
              variant="solid"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0097A7] hover:bg-[#00838F] text-white"
            >
              + Tambah Sesi
            </Button>
          </div>

          {/* Tabel Sesi */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-4 px-6">Nomor Sesi</th>
                  <th className="py-4 px-6">Jam Mulai</th>
                  <th className="py-4 px-6">Jam Berakhir</th>
                  <th className="py-4 px-6 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSesi.length > 0 ? (
                  filteredSesi.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 px-6 font-medium text-slate-800">
                        {item.nomor}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {item.jamMulai}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-600">
                        {item.jamBerakhir}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            aria-label="Hapus Sesi"
                            onClick={() => handleOpenDeleteModal(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 transition"
                          >
                            <TrashBinMinimalistic
                              weight="BoldDuotone"
                              className="h-4 w-4"
                            />
                          </button>
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            aria-label="Edit Sesi"
                            onClick={() => handleOpenEditModal(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0097A7] text-white hover:bg-[#00838F] transition"
                          >
                            <Pen weight="BoldDuotone" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Data sesi tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </main>

      {/* Modal Hapus Sesi */}
      <ModalHapusSesi
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* Modal Tambah Sesi */}
      <ModalTambahSesi
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTambah}
      />

      {/* Modal Edit Sesi */}
      <ModalEditSesi
        isOpen={isEditModalOpen}
        initialData={selectedEditSesi}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEditSesi(null)
        }}
        onSave={handleSaveEdit}
      />
    </div>
  )
}

export default Sesi