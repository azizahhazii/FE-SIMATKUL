import { Button } from 'assets-design-system'

interface HapusPeriodeModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  namaPeriode?: string
}

export function HapusPeriodeModal({
  isOpen,
  onClose,
  onConfirm,
  namaPeriode,
}: HapusPeriodeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-5 rounded-2xl bg-white p-7 text-center shadow-2xl">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-bold text-[#2B4774]">Hapus data ini?</h3>
          <p className="text-xs leading-relaxed text-[#64748B]">
            Menghapus master data {namaPeriode ? <strong className="text-[#1E293B]">{namaPeriode}</strong> : ''} akan menghapus semua data yang berkaitan. Data yang dihapus tidak bisa dikembalikan.
          </p>
        </div>

        <div className="flex w-full items-center justify-center gap-3.5 mt-1">
          <Button
            theme="neutral"
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50 font-medium"
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            Hapus Data
          </Button>
          <Button
            theme="primary"
            variant="solid"
            className="flex-1 bg-[#0097A7] hover:bg-[#00838F] text-white font-medium"
            onClick={onClose}
          >
            Batalkan
          </Button>
        </div>
      </div>
    </div>
  )
}