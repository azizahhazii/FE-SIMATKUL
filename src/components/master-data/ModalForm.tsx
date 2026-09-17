import type { ReactNode } from "react";
import { Modal, Button } from "assets-design-system";

/**
 * Lebar kartu modal form di Figma sama untuk SEMUA modal tambah/edit Master
 * Data (periode, mata kuliah, ruangan, dosen, kelas, sesi): 756px pada frame
 * 1440px. Modal konfirmasi hapus memakai lebar default design system (350px).
 */
const FORM_MODAL_WIDTH = "w-full max-w-[756px]";

interface ModalFormProps {
  isOpen: boolean;
  title: string;
  description: string;
  /** Label tombol aksi utama, mis. "Tambah Dosen" / "Simpan Perubahan". */
  submitLabel: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

/**
 * Cangkang tunggal untuk seluruh modal form Master Data.
 *
 * Tujuannya supaya lebar kartu, jarak antar field, dan posisi tombol footer
 * ditulis di satu tempat saja — di Figma tombol form selalu rata kanan
 * (bukan melebar penuh seperti modal konfirmasi hapus), sementara `Modal`
 * dari design system membuat setiap anak footer `flex-1`, jadi perataan itu
 * dikunci di sini lewat spacer + `!flex-none`.
 */
export function ModalForm({
  isOpen,
  title,
  description,
  submitLabel,
  onClose,
  onSubmit,
  children,
}: ModalFormProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      className={FORM_MODAL_WIDTH}
      actions={
        <>
          <div className="flex-1" />
          <Button
            theme="primary"
            variant="outline"
            size="sm"
            className="!flex-none !grow-0"
            onClick={onClose}
          >
            Batalkan
          </Button>
          <Button
            theme="primary"
            variant="solid"
            size="sm"
            className="!flex-none !grow-0"
            onClick={onSubmit}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">{children}</div>
    </Modal>
  );
}