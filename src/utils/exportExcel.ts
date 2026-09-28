import { DAFTAR_HARI, type BarisLaporanJadwal } from '../types/laporan';

/**
 * Ekspor data matriks laporan jadwal ke file Excel (.xls) menggunakan format HTML Spreadsheet Blob.
 * Fungsi ini generik dan dapat digunakan untuk semua jenis laporan (Dosen, Mahasiswa, Ruang)
 * tanpa dependensi ke library eksternal.
 */
export function exportMatrixToExcel<TInfo>(
  data: BarisLaporanJadwal<TInfo>[],
  filename: string,
): void {
  if (!data || data.length === 0) return;

  const helperGetLabel = (info: TInfo): string => {
    if (typeof info === 'object' && info !== null) {
      const obj = info as Record<string, unknown>;
      if (typeof obj.nama === 'string') {
        return obj.nis ? `${obj.nis} - ${obj.nama}` : obj.nama;
      }
    }
    return String(info);
  };

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Laporan Jadwal</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { background-color: #f1f5f9; font-weight: bold; border: 1px solid #cbd5e1; text-align: center; }
        td { border: 1px solid #e2e8f0; vertical-align: top; padding: 6px; }
        .entitas { font-weight: bold; background-color: #ffffff; }
        .sesi { text-align: center; background-color: #f8fafc; font-weight: bold; }
        .isi-jadwal { background-color: #fff7ed; color: #7c2d12; }
        .kosong { text-align: center; color: #94a3b8; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>
            <th>Entitas</th>
            <th>Sesi</th>
            ${DAFTAR_HARI.map((hari) => `<th>${hari}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  for (const barisEntitas of data) {
    const labelEntitas = helperGetLabel(barisEntitas.info);
    const totalSesi = barisEntitas.jadwalPerSesi.length;

    barisEntitas.jadwalPerSesi.forEach((barisSesi, idxSesi) => {
      tableHtml += `<tr>`;
      if (idxSesi === 0) {
        tableHtml += `<td rowspan="${totalSesi}" class="entitas">${labelEntitas}</td>`;
      }
      tableHtml += `<td class="sesi">${barisSesi.sesi}</td>`;

      for (const hari of DAFTAR_HARI) {
        const selList = barisSesi.perHari[hari];
        if (selList && selList.length > 0) {
          const konten = selList
            .map((sel) => `<b>${sel.matkulNama}</b><br/><small>${sel.keterangan}</small>`)
            .join('<br/><br/>');
          tableHtml += `<td class="isi-jadwal">${konten}</td>`;
        } else {
          tableHtml += `<td class="kosong">-</td>`;
        }
      }
      tableHtml += `</tr>`;
    });
  }

  tableHtml += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedFilename = filename.endsWith('.xls') ? filename : `${filename}.xls`;

  link.href = url;
  link.download = sanitizedFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}