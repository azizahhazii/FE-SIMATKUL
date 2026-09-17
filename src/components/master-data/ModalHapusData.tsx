import { Modal, Button } from "assets-design-system";

interface ModalHapusDataProps {
  isOpen: boolean;
  description?: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Satu modal konfirmasi hapus untuk seluruh Master Data — di Figma judul,
 * deskripsi, lebar kartu, dan urutan tombolnya identik di semua halaman
 * (periode, kurikulum, ruangan, dosen, kelas, sesi), jadi tidak ada versi
 * per halaman.
 *
 * Lebar memakai default `Modal` (350px) dan tombolnya melebar penuh — beda
 * dari modal form yang rata kanan lewat `ModalForm`.
 */
export function ModalHapusData({
  isOpen,
  description = "Data ini akan dihapus permanen dan tidak bisa dikembalikan.",
  onClose,
  onConfirm,
}: ModalHapusDataProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Hapus data ini?"
      description={description}
      actions={
        <>
          <Button
            theme="error"
            variant="outline"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Hapus Data
          </Button>
          <Button theme="primary" variant="solid" size="sm" onClick={onClose}>
            Batalkan
          </Button>
        </>
      }
    />
  );
}