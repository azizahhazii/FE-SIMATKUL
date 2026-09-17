interface ModalHapusDataProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ModalHapusData({
  isOpen,
  onClose,
  onConfirm,
}: ModalHapusDataProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="flex w-full max-w-sm flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 shadow-xl text-center">
        <h3 className="text-base font-bold text-slate-800">
          Hapus data ini?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed px-2">
          Data ini akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="mt-2 flex w-full items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
          >
            Hapus Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#0097A7] py-2.5 text-xs font-semibold text-white hover:bg-[#00838F] transition"
          >
            Batalkan
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalHapusData