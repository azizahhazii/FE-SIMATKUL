import { useState, useEffect } from 'react'
import { Button, Input } from 'assets-design-system'
import { CalendarIcon, ChevronDownIcon } from '../icons/TambahPeriodeIcons'
import type { PeriodeAkademik } from '../../types/periodeAkademik'

interface EditPeriodeModalProps {
  isOpen: boolean
  onClose: () => void
  periode?: PeriodeAkademik | null
  onSubmit?: (data: { id: string; nama: string }) => void
}

export function EditPeriodeModal({
  isOpen,
  onClose,
  periode,
  onSubmit,
}: EditPeriodeModalProps) {
  const [awalTahun, setAwalTahun] = useState('')
  const [semester, setSemester] = useState('')
  const [deskripsi, setDeskripsi] = useState('')

  useEffect(() => {
    if (isOpen) {
      setAwalTahun('')
      setSemester('')
      setDeskripsi('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const akhirTahun =
    awalTahun && !isNaN(Number(awalTahun)) ? String(Number(awalTahun) + 1) : ''

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!periode) return

    // Mengambil fallback dari periode lama jika input tidak diubah
    const parts = periode.nama.split(' – ')
    const mainPart = parts[0] || ''
    const spaceSplit = mainPart.split(' ')
    
    const finalSemester = semester || spaceSplit[0] || 'Gasal'
    const finalAwalTahun = awalTahun || (spaceSplit[1] ? spaceSplit[1].split('/')[0] : '2026')
    const finalAkhirTahun = akhirTahun || String(Number(finalAwalTahun) + 1)
    const finalDeskripsi = deskripsi !== '' ? deskripsi : (parts[1] || '')

    const namaBaru = `${finalSemester} ${finalAwalTahun}/${finalAkhirTahun}${
      finalDeskripsi ? ` – ${finalDeskripsi}` : ''
    }`

    onSubmit?.({
      id: periode.id,
      nama: namaBaru,
    })
    onClose()
  }

  const titlePeriode = periode ? periode.nama.split(' – ')[0] : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[560px] flex-col gap-6 rounded-2xl bg-[#FAFCFF] p-7 shadow-2xl border border-neutral-100">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <h3 className="text-xl font-bold text-[#2B4774]">
            Edit Periode Akademik {titlePeriode}
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            Ubah tahun ajaran, semester, atau deskripsi periode ini
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Row 1: Tahun Ajaran */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155]">
                Awal tahun ajaran
              </label>
              <Input
                placeholder="contoh: 2026"
                leftIcon={<CalendarIcon className="text-[#94A3B8]" />}
                value={awalTahun}
                onChange={(e) => setAwalTahun(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155]">
                Akhir tahun ajaran
              </label>
              <Input
                placeholder="terisi otomatis"
                leftIcon={<CalendarIcon className="text-[#CBD5E1]" />}
                value={akhirTahun}
                disabled
                className="bg-[#F8FAFC] text-[#94A3B8]"
              />
            </div>
          </div>

          {/* Row 2: Semester Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Semester
            </label>
            <div className="relative flex items-center">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={`w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-xs outline-none transition focus:border-[#0097A7] ${
                  semester === '' ? 'text-[#94A3B8]' : 'text-[#334155]'
                }`}
              >
                <option value="" disabled hidden>
                  Gasal/Genap
                </option>
                <option value="Gasal" className="text-[#334155]">
                  Gasal
                </option>
                <option value="Genap" className="text-[#334155]">
                  Genap
                </option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 text-[#94A3B8]" />
            </div>
          </div>

          {/* Row 3: Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#334155]">
              Deskripsi (Opsional)
            </label>
            <Input
              placeholder="contoh: Draft 1"
              maxLength={12}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
            />
            <span className="text-[11px] text-[#94A3B8]">Maks. 12 huruf</span>
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
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}