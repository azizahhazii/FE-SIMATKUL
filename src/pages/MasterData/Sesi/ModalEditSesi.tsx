import { useState, useEffect } from 'react'
import ClockCircle from '@solar-icons/react/time/ClockCircle'

interface SesiData {
  id: string
  nomor: string
  jamMulai: string
  jamBerakhir: string
}

interface ModalEditSesiProps {
  isOpen: boolean
  initialData: SesiData | null
  onClose: () => void
  onSave: (id: string, jamMulai: string, jamBerakhir: string) => void
}

export function ModalEditSesi({
  isOpen,
  initialData,
  onClose,
  onSave,
}: ModalEditSesiProps) {
  const [jamMulai, setJamMulai] = useState('')
  const [jamBerakhir, setJamBerakhir] = useState('')

  useEffect(() => {
    if (initialData) {
      setJamMulai(initialData.jamMulai)
      setJamBerakhir(initialData.jamBerakhir)
    }
  }, [initialData])

  if (!isOpen || !initialData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(initialData.id, jamMulai, jamBerakhir)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl flex flex-col gap-6 animate-in fade-in zoom-in duration-150">
        
        {/* Header Title */}
        <div className="flex flex-col text-center gap-1">
          <h3 className="text-xl font-bold text-slate-800">
            Edit {initialData.nomor}
          </h3>
          <p className="text-xs text-slate-400">
            Ubah data sesi untuk periode ini
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Input Jam Mulai */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-semibold text-slate-700">
                Jam Mulai
              </label>
              <div className="relative flex items-center">
                <ClockCircle className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="00.00 WIB"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0097A7] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Input Jam Berakhir */}
            <div className="flex flex-col gap-2 text-left">
              <label className="text-xs font-semibold text-slate-700">
                Jam Berakhir
              </label>
              <div className="relative flex items-center">
                <ClockCircle className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="00.00 WIB"
                  value={jamBerakhir}
                  onChange={(e) => setJamBerakhir(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-xs font-medium text-slate-800 outline-none transition focus:border-[#0097A7] focus:bg-white"
                  required
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#0097A7] px-6 py-2.5 text-xs font-semibold text-[#0097A7] hover:bg-cyan-50 transition"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0097A7] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#00838F] transition shadow-sm"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default ModalEditSesi