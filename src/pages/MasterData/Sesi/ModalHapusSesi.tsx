interface ModalHapusSesiProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ModalHapusSesi({
  isOpen,
  onClose,
  onConfirm,
}: ModalHapusSesiProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in duration-150">
        
        {/* Title & Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-800">
            Hapus data ini?
          </h3>
          <p className="text-xs text-slate-400 max-w-[220px] mx-auto leading-relaxed">
            Data ini akan dihapus permanen dan tidak bisa dikembalikan.
          </p>
        </div>

        {/* Buttons Action */}
        <div className="flex items-center gap-3 w-full mt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-xl border border-red-400 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
          >
            Hapus Data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#0097A7] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#00838F] transition"
          >
            Batalkan
          </button>
        </div>

      </div>
    </div>
  )
}

export default ModalHapusSesi