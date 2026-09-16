import { useState } from 'react'
import { Input, Button } from 'assets-design-system'

import CodeSquare from '@solar-icons/react/it/CodeSquare'
import Bolt from '@solar-icons/react/ui/Bolt'
import TransmissionSquare from '@solar-icons/react/parts/TransmissionSquare'
import TuningSquare from '@solar-icons/react/settings/TuningSquare'
import Magnifer from '@solar-icons/react/search/Magnifer'
import Filter from '@solar-icons/react/ui/Filter'
import Pen from '@solar-icons/react/messages/Pen'
import TrashBinMinimalistic from '@solar-icons/react/ui/TrashBinMinimalistic'

// Top Stat Icons
import BookmarkIcon from '@solar-icons/react/school/BookMarkSquare'
import Key from '@solar-icons/react/security/Key'
import UserId from '@solar-icons/react/users/UserId'
import UsersGroupRounded from '@solar-icons/react/users/UsersGroupRounded'
import ClockCircle from '@solar-icons/react/time/ClockCircle'

// Import Modals
import ModalHapusData from './ModalHapusData'
import ModalEditKelas from './ModalEditKelas'
import ModalTambahKelas from './ModalTambahKelas'

interface KelasProps {
  namaPeriode?: string
  onTabChange?: (tabName: string) => void
}

const dummyKelasList = [
  { id: '1', nama: 'AA', kode: 'PL1AA' },
  { id: '2', nama: 'BB', kode: 'PL1BB' },
  { id: '3', nama: 'A1', kode: 'PL1A1' },
  { id: '4', nama: 'A2', kode: 'PL1A2' },
  { id: '5', nama: 'B1', kode: 'PL1B1' },
  { id: '6', nama: 'B2', kode: 'PL1B2' },
]

const prodiList = [
  {
    id: 'TRPL',
    nama: 'TRPL',
    deskripsi: 'Teknologi Rekayasa Perangkat Lunak',
    icon: CodeSquare,
  },
  {
    id: 'TRE',
    nama: 'TRE',
    deskripsi: 'Teknologi Rekayasa Elektro',
    icon: Bolt,
  },
  {
    id: 'TRI',
    nama: 'TRI',
    deskripsi: 'Teknologi Rekayasa Internet',
    icon: TransmissionSquare,
  },
  {
    id: 'TRIK',
    nama: 'TRIK',
    deskripsi: 'Teknologi Rekayasa Instrumentasi dan Kontrol',
    icon: TuningSquare,
  },
]

export function Kelas({
  namaPeriode = 'Semester Gasal 2026/2027',
  onTabChange,
}: KelasProps) {
  const [selectedProdi, setSelectedProdi] = useState('TRPL')
  const [searchQuery, setSearchQuery] = useState('')

  // State Modals
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const [isSemester1Visible, setIsSemester1Visible] = useState(true)

  const filteredKelas = dummyKelasList.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteConfirm = () => {
    setIsSemester1Visible(false)
    setIsDeleteModalOpen(false)
  }

  const handleSaveEdit = (data: any) => {
    console.log('Data hasil edit:', data)
    setIsEditModalOpen(false)
  }

  const handleSaveTambah = (data: any) => {
    console.log('Data kelas baru:', data)
    setIsAddModalOpen(false)
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
              <span className="text-base font-bold text-slate-800">5</span>
              <span className="text-[11px] text-slate-500">Sesi</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex items-center gap-2">
          {(['Kurikulum', 'Ruangan', 'Dosen', 'Kelas', 'Sesi'] as const).map(
            (tab) => {
              const isActive = tab === 'Kelas'
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

        {/* Cards Filter Prodi */}
        <div className="grid grid-cols-4 gap-4">
          {prodiList.map((prodi) => {
            const IconComponent = prodi.icon
            const isSelected = selectedProdi === prodi.id

            return (
              <button
                key={prodi.id}
                type="button"
                onClick={() => setSelectedProdi(prodi.id)}
                className={`flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center transition ${
                  isSelected
                    ? 'border-2 border-[#0097A7] bg-cyan-50/60 shadow-sm'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isSelected
                      ? 'bg-[#0097A7] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {prodi.nama}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {prodi.deskripsi}
                </span>
              </button>
            )
          })}
        </div>

        {/* Container Tabel & Action Bar */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Cari kelas"
                leftIcon={<Magnifer weight="LineDuotone" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              aria-label="Filter"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#0097A7] bg-cyan-50 text-[#0097A7] hover:bg-cyan-100 transition"
            >
              <Filter weight="LineDuotone" className="h-5 w-5" />
            </button>
            <Button
              theme="primary"
              variant="solid"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#0097A7] hover:bg-[#00838F] text-white"
            >
              + Tambah Kelas
            </Button>
          </div>

          {/* Group Semester 1 */}
          {isSemester1Visible ? (
            <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden bg-white">
              
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
                <span className="text-sm font-bold text-slate-800">
                  Semester 1
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Hapus Semester"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50 transition"
                  >
                    <TrashBinMinimalistic weight="BoldDuotone" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Edit Semester"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0097A7] text-white hover:bg-[#00838F] transition"
                  >
                    <Pen weight="BoldDuotone" className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-6 text-center w-1/2">Kelas</th>
                    <th className="py-3 px-6 text-center w-1/2">Kode Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredKelas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-6 text-center font-medium">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-6 text-center font-medium">
                        {item.kode}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Data kelas semester belum tersedia.
            </div>
          )}

        </div>

      </main>

      {/* Modal Hapus Data */}
      <ModalHapusData
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Modal Edit Kelas */}
      <ModalEditKelas
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialData={{
          namaKelas: 'PL1AA',
          prodi: 'TRPL',
        }}
      />

      {/* Modal Tambah Kelas */}
      <ModalTambahKelas
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveTambah}
      />
    </div>
  )
}

export default Kelas