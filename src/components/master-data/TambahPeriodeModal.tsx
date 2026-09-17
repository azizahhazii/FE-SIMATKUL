import { useState } from 'react'
import { Button, Input } from 'assets-design-system'
import {
  CalendarIcon,
  ChevronDownIcon,
  DocumentSendIcon,
  DocumentFailIcon,
} from '../icons/TambahPeriodeIcons'

interface TambahPeriodeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: any) => void
}

export function TambahPeriodeModal({ isOpen, onClose, onSubmit }: TambahPeriodeModalProps) {
  const [awalTahun, setAwalTahun] = useState('')
  const [semester, setSemester] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [sumberData, setSumberData] = useState<'salin' | 'kosong'>('salin')
  const [periodeSumber, setPeriodeSumber] = useState('')

  if (!isOpen) return null

  const akhirTahun = awalTahun && !isNaN(Number(awalTahun)) ? String(Number(awalTahun) + 1) : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.({
      awalTahun,
      akhirTahun,
      semester,
      deskripsi,
      sumberData,
      periodeSumber: sumberData === 'salin' ? periodeSumber : null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[560px] flex-col gap-6 rounded-2xl bg-[#FAFCFF] p-7 shadow-2xl border border-neutral-100">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-[#2B4774]">
            Tambah periode baru
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Tentukan tahun ajaran dan semester untuk periode akademik baru
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Row 1: Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155]">Awal tahun ajaran</label>
              <Input
                placeholder="contoh: 2026"
                leftIcon={<CalendarIcon className="text-[#94A3B8]" />}
                value={awalTahun}
                onChange={(e) => setAwalTahun(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155]">Akhir tahun ajaran</label>
              <Input
                placeholder="terisi otomatis"
                leftIcon={<CalendarIcon className="text-[#CBD5E1]" />}
                value={akhirTahun}
                disabled
                className="bg-[#F8FAFC] text-[#94A3B8]"
              />
            </div>
          </div>

          {/* Row 2: Semester */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#334155]">Semester</label>
            <div className="relative flex items-center">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs text-[#334155] outline-none transition focus:border-[#0097A7]"
              >
                <option value="" disabled hidden>
                  Gasal/Genap
                </option>
                <option value="Gasal">Gasal</option>
                <option value="Genap">Genap</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 text-[#94A3B8]" />
            </div>
          </div>

          {/* Row 3: Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#334155]">Deskripsi (Opsional)</label>
            <Input
              placeholder="contoh: Draft 1"
              maxLength={12}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
            <span className="text-[11px] text-[#94A3B8]">Maks. 12 huruf</span>
          </div>

          {/* Row 4: Sumber Data */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[#334155]">Sumber Data</label>
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Option 1: Salin dari periode lain */}
              <button
                type="button"
                onClick={() => setSumberData('salin')}
                className={`flex flex-col items-start gap-2 rounded-xl p-3.5 text-left transition border ${
                  sumberData === 'salin'
                    ? 'border-[#0097A7] bg-[#E0F7FA]'
                    : 'border-transparent bg-[#F1F5F9] hover:bg-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DocumentSendIcon className={sumberData === 'salin' ? 'text-[#0097A7]' : 'text-[#64748B]'} />
                  <span className={`text-xs font-bold ${sumberData === 'salin' ? 'text-[#00838F]' : 'text-[#334155]'}`}>
                    Salin dari periode lain
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${sumberData === 'salin' ? 'text-[#006064]' : 'text-[#64748B]'}`}>
                  Kurikulum, ruang, dosen, kelas, dan sesi disalin. Perubahan tidak mempengaruhi periode asal.
                </p>
              </button>

              {/* Option 2: Mulai kosong */}
              <button
                type="button"
                onClick={() => setSumberData('kosong')}
                className={`flex flex-col items-start gap-2 rounded-xl p-3.5 text-left transition border ${
                  sumberData === 'kosong'
                    ? 'border-[#0097A7] bg-[#E0F7FA]'
                    : 'border-transparent bg-[#F1F5F9] hover:bg-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <DocumentFailIcon className={sumberData === 'kosong' ? 'text-[#0097A7]' : 'text-[#64748B]'} />
                  <span className={`text-xs font-bold ${sumberData === 'kosong' ? 'text-[#00838F]' : 'text-[#334155]'}`}>
                    Mulai kosong
                  </span>
                </div>
                <p className={`text-[11px] leading-relaxed ${sumberData === 'kosong' ? 'text-[#006064]' : 'text-[#64748B]'}`}>
                  Semua data perlu ditambahkan dari awal, tidak ada yang disalin.
                </p>
              </button>
            </div>

            {/* Dropdown Periode Sumber */}
            {sumberData === 'salin' && (
              <div className="relative mt-1 flex items-center">
                <select
                  value={periodeSumber}
                  onChange={(e) => setPeriodeSumber(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs text-[#334155] outline-none transition focus:border-[#0097A7]"
                >
                  <option value="" disabled hidden>
                    Pilih periode sumber
                  </option>
                  <option value="Genap 2026/2027">Genap 2026/2027</option>
                  <option value="Gasal 2026/2027">Gasal 2026/2027</option>
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 text-[#94A3B8]" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-3">
            <Button
              theme="neutral"
              variant="outline"
              type="button"
              onClick={onClose}
              className="border-[#0097A7] text-[#0097A7] hover:bg-[#E0F7FA]"
            >
              Batalkan
            </Button>
            <Button
              theme="primary"
              variant="solid"
              type="submit"
              className="bg-[#0097A7] hover:bg-[#00838F] text-white"
            >
              Tambah Periode
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}