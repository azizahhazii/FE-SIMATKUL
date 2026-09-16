import { useState, useEffect } from 'react'
import CodeSquare from '@solar-icons/react/it/CodeSquare'
import Bolt from '@solar-icons/react/ui/Bolt'
import TransmissionSquare from '@solar-icons/react/parts/TransmissionSquare'
import TuningSquare from '@solar-icons/react/settings/TuningSquare'

interface ModalEditKelasProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: {
    prodi: string
    semester: string
    jumlahTeori: string
    jumlahPraktikum: string
  }) => void
  initialData?: {
    namaKelas?: string
    prodi?: string
    semester?: string
    jumlahTeori?: string
    jumlahPraktikum?: string
  }
}

const prodiOptions = [
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

export function ModalEditKelas({
  isOpen,
  onClose,
  onSave,
  initialData,
}: ModalEditKelasProps) {
  const [selectedProdi, setSelectedProdi] = useState('TRPL')
  const [semester, setSemester] = useState('')
  const [jumlahTeori, setJumlahTeori] = useState('')
  const [jumlahPraktikum, setJumlahPraktikum] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedProdi(initialData?.prodi || 'TRPL')
      setSemester(initialData?.semester || '')
      setJumlahTeori(initialData?.jumlahTeori || '')
      setJumlahPraktikum(initialData?.jumlahPraktikum || '')
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    onSave?.({
      prodi: selectedProdi,
      semester,
      jumlahTeori,
      jumlahPraktikum,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-xl flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl">
        
        {/* Header Modal */}
        <div className="text-center">
          <h3 className="text-base font-bold text-slate-800">
            Edit Kelas {initialData?.namaKelas || 'PL1AA'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tambah data kelas untuk periode ini
          </p>
        </div>

        {/* Option Program Studi */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-slate-600">
            Program Studi
          </label>
          <div className="grid grid-cols-4 gap-3">
            {prodiOptions.map((item) => {
              const IconComponent = item.icon
              const isSelected = selectedProdi === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedProdi(item.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 text-center transition border ${
                    isSelected
                      ? 'border-[#0097A7] bg-cyan-50/50'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-[#0097A7] text-white'
                        : 'bg-slate-200/70 text-slate-500'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {item.nama}
                  </span>
                  <span className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                    {item.deskripsi}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="flex flex-col gap-4">
          
          {/* Dropdown Semester */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#0097A7] focus:outline-none transition ${
                !semester ? 'text-slate-400' : 'text-slate-800'
              }`}
            >
              <option value="" disabled hidden>
                pilih semester
              </option>
              <option value="1" className="text-slate-800">Semester 1</option>
              <option value="2" className="text-slate-800">Semester 2</option>
              <option value="3" className="text-slate-800">Semester 3</option>
              <option value="4" className="text-slate-800">Semester 4</option>
            </select>
          </div>

          {/* Grid Teori & Praktikum */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Jumlah Kelas Teori
              </label>
              <select
                value={jumlahTeori}
                onChange={(e) => setJumlahTeori(e.target.value)}
                className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#0097A7] focus:outline-none transition ${
                  !jumlahTeori ? 'text-slate-400' : 'text-slate-800'
                }`}
              >
                <option value="" disabled hidden>
                  pilih jumlah kelas
                </option>
                <option value="1" className="text-slate-800">1 Kelas</option>
                <option value="2" className="text-slate-800">2 Kelas</option>
                <option value="3" className="text-slate-800">3 Kelas</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">
                Jumlah Kelas Praktikum
              </label>
              <select
                value={jumlahPraktikum}
                onChange={(e) => setJumlahPraktikum(e.target.value)}
                className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs focus:border-[#0097A7] focus:outline-none transition ${
                  !jumlahPraktikum ? 'text-slate-400' : 'text-slate-800'
                }`}
              >
                <option value="" disabled hidden>
                  pilih jumlah kelas
                </option>
                <option value="1" className="text-slate-800">1 Kelas</option>
                <option value="2" className="text-slate-800">2 Kelas</option>
                <option value="3" className="text-slate-800">3 Kelas</option>
              </select>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#0097A7] px-5 py-2.5 text-xs font-semibold text-[#0097A7] hover:bg-cyan-50 transition"
          >
            Batalkan
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-[#0097A7] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#00838F] transition"
          >
            Edit Kelas
          </button>
        </div>

      </div>
    </div>
  )
}

export default ModalEditKelas