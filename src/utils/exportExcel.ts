import { DAFTAR_HARI, type BarisLaporanJadwal } from "../types/laporan";

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getEntityLabel<TInfo>(info: TInfo): string {
  if (typeof info === "object" && info !== null) {
    const obj = info as Record<string, unknown>;

    if (typeof obj.nama === "string") {
      if (typeof obj.nis === "string") {
        return `${obj.nis} - ${obj.nama}`;
      }

      return obj.nama;
    }
  }

  return String(info);
}

function countScheduledCells<TInfo>(data: BarisLaporanJadwal<TInfo>[]): number {
  let total = 0;

  for (const entitas of data) {
    for (const sesi of entitas.jadwalPerSesi) {
      for (const hari of DAFTAR_HARI) {
        const cells = sesi.perHari[hari];

        if (cells && cells.length > 0) {
          total += cells.length;
        }
      }
    }
  }

  return total;
}

export function exportMatrixToExcel<TInfo>(
  data: BarisLaporanJadwal<TInfo>[],
  filename: string,
): void {
  if (!data || data.length === 0) return;

  const totalEntitas = data.length;
  const totalJadwal = countScheduledCells(data);

  const generatedAt = new Date().toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const cleanFilename = filename
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\.xls$/i, "");

  let tableHtml = `
    <html
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40"
    >
      <head>
        <meta charset="utf-8" />

        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Hasil Penjadwalan</x:Name>

                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                  <x:FreezePanes/>
                  <x:FrozenNoSplit/>
                  <x:SplitHorizontal>5</x:SplitHorizontal>
                  <x:TopRowBottomPane>5</x:TopRowBottomPane>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->

        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            color: #1f2937;
            margin: 20px;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            table-layout: fixed;
          }

          .title {
            background-color: #0298AB;
            color: #ffffff;
            font-size: 18pt;
            font-weight: bold;
            text-align: left;
            padding: 14px 16px;
            border: 1px solid #0298AB;
          }

          .subtitle {
            background-color: #EAF7FA;
            color: #4b5563;
            font-size: 10pt;
            padding: 8px 12px;
            border: 1px solid #cbd5e1;
          }

          .summary-label {
            background-color: #F1F5F9;
            color: #475569;
            font-weight: bold;
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
          }

          .summary-value {
            background-color: #ffffff;
            color: #111827;
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
          }

          .header {
            background-color: #0298AB;
            color: #ffffff;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            padding: 10px 8px;
            border: 1px solid #cbd5e1;
          }

          .entity {
            background-color: #F8FAFC;
            color: #111827;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            padding: 10px 8px;
            border: 1px solid #CBD5E1;
          }

          .session {
            background-color: #EAF7FA;
            color: #0298AB;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            padding: 10px 8px;
            border: 1px solid #CBD5E1;
          }

          .scheduled {
            background-color: #FFF1E3;
            color: #7C2D12;
            vertical-align: middle;
            padding: 9px 10px;
            border: 1px solid #CBD5E1;
          }

          .scheduled-title {
            font-weight: bold;
            color: #C05F00;
            line-height: 1.25;
          }

          .scheduled-sub {
            color: #9A4A08;
            font-size: 9pt;
            margin-top: 3px;
          }

          .empty {
            background-color: #F8FAFC;
            color: #94A3B8;
            text-align: center;
            vertical-align: middle;
            padding: 9px;
            border: 1px solid #E2E8F0;
          }

          .group-divider td {
            border-bottom: 2px solid #94A3B8;
          }

          .legend-title {
            background-color: #F1F5F9;
            font-weight: bold;
            padding: 8px 10px;
            border: 1px solid #CBD5E1;
          }

          .legend-filled {
            background-color: #D16E05;
            color: #ffffff;
            font-weight: bold;
            padding: 8px 10px;
            border: 1px solid #CBD5E1;
            text-align: center;
          }

          .legend-empty {
            background-color: #FBEFE6;
            color: #7C2D12;
            padding: 8px 10px;
            border: 1px solid #CBD5E1;
            text-align: center;
          }

          .footer-note {
            color: #64748B;
            font-size: 9pt;
            padding-top: 10px;
          }

          .col-entity {
            width: 24%;
          }

          .col-session {
            width: 8%;
          }

          .col-day {
            width: 13.6%;
          }
        </style>
      </head>

      <body>
        <!-- ================= TITLE ================= -->
        <table>
          <colgroup>
            <col class="col-entity" />
            <col class="col-session" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
          </colgroup>

          <tr>
            <td
              colspan="${2 + DAFTAR_HARI.length}"
              class="title"
            >
              Hasil Penjadwalan - Jadwal Dosen
            </td>
          </tr>

          <tr>
            <td
              colspan="${2 + DAFTAR_HARI.length}"
              class="subtitle"
            >
              File laporan hasil penjadwalan yang
              diekspor dari SIMATKUL.
            </td>
          </tr>

          <tr>
            <td class="summary-label">
              Total Dosen
            </td>

            <td
              colspan="${2 + DAFTAR_HARI.length - 1}"
              class="summary-value"
            >
              ${totalEntitas}
            </td>
          </tr>

          <tr>
            <td class="summary-label">
              Total Jadwal
            </td>

            <td
              colspan="${2 + DAFTAR_HARI.length - 1}"
              class="summary-value"
            >
              ${totalJadwal}
            </td>
          </tr>

          <tr>
            <td class="summary-label">
              Diekspor
            </td>

            <td
              colspan="${2 + DAFTAR_HARI.length - 1}"
              class="summary-value"
            >
              ${escapeHtml(generatedAt)}
            </td>
          </tr>

          <tr>
            <td
              colspan="${2 + DAFTAR_HARI.length}"
              style="height: 12px; border: none;"
            >
              &nbsp;
            </td>
          </tr>

          <!-- ================= HEADER ================= -->
          <tr>
            <th class="header">
              Entitas
            </th>

            <th class="header">
              Sesi
            </th>

            ${DAFTAR_HARI.map(
              (hari) => `<th class="header">${escapeHtml(hari)}</th>`,
            ).join("")}
          </tr>
        </table>

        <!-- ================= DATA ================= -->
        <table>
          <colgroup>
            <col class="col-entity" />
            <col class="col-session" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
            <col class="col-day" />
          </colgroup>

          <tbody>
  `;

  for (let entityIndex = 0; entityIndex < data.length; entityIndex += 1) {
    const barisEntitas = data[entityIndex];

    const labelEntitas = getEntityLabel(barisEntitas.info);

    const totalSesi = barisEntitas.jadwalPerSesi.length;

    barisEntitas.jadwalPerSesi.forEach((barisSesi, idxSesi) => {
      const lastRowOfEntity = idxSesi === totalSesi - 1;

      tableHtml += `
          <tr class="${lastRowOfEntity ? "group-divider" : ""}">
        `;

      if (idxSesi === 0) {
        tableHtml += `
            <td
              rowspan="${totalSesi}"
              class="entity"
            >
              ${escapeHtml(labelEntitas)}
            </td>
          `;
      }

      tableHtml += `
          <td class="session">
            ${escapeHtml(barisSesi.sesi)}
          </td>
        `;

      for (const hari of DAFTAR_HARI) {
        const selList = barisSesi.perHari[hari];

        if (selList && selList.length > 0) {
          const konten = selList
            .map(
              (sel) => `
                  <div class="scheduled-title">
                    ${escapeHtml(sel.matkulNama)}
                  </div>

                  <div class="scheduled-sub">
                    ${escapeHtml(sel.keterangan)}
                  </div>
                `,
            )
            .join(`<div style="height: 8px;"></div>`);

          tableHtml += `
              <td class="scheduled">
                ${konten}
              </td>
            `;
        } else {
          tableHtml += `
              <td class="empty">
                -
              </td>
            `;
        }
      }

      tableHtml += `</tr>`;
    });
  }

  tableHtml += `
          </tbody>
        </table>

        <!-- ================= LEGEND ================= -->
        <table style="margin-top: 14px;">
          <tr>
            <td class="legend-title">
              Keterangan
            </td>

            <td class="legend-filled">
              Jadwal Terisi
            </td>

            <td class="legend-empty">
              Slot Kosong
            </td>
          </tr>
        </table>

        <div class="footer-note">
          SIMATKUL — Sistem Informasi Penjadwalan
        </div>
      </body>
    </html>
  `;

  const blob = new Blob([tableHtml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${cleanFilename}.xls`;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
