import type { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "center";
  /** Kelas lebar Tailwind, mis. "w-[12%]". Kolom tanpa lebar akan melar. */
  width?: string;
  render: (item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (item: T) => string;
  emptyMessage: string;
}

/**
 * Tabel tunggal untuk seluruh Master Data. Sebelumnya tiap halaman menulis
 * <table> sendiri dengan palet berbeda (slate-* vs token neutral-*), jadi
 * tinggi baris, warna header, dan ukuran teksnya tidak sama padahal di Figma
 * semuanya satu gaya. Semua styling sekarang pakai token design system.
 */
export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage,
}: DataTableProps<T>) {
  return (
    <table className="w-full border-collapse text-left">
      <thead className="bg-neutral-400">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-3 py-2 text-b3 font-bold text-neutral-1000 ${
                column.align === "center" ? "text-center" : "text-left"
              } ${column.width ?? ""}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length > 0 ? (
          data.map((item, index) => (
            <tr
              key={getRowKey(item)}
              className={
                index < data.length - 1 ? "border-b border-neutral-400" : ""
              }
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-3 py-2.5 text-b3 text-neutral-1000 ${
                    column.align === "center" ? "text-center" : "text-left"
                  }`}
                >
                  {column.render(item, index)}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={columns.length}
              className="p-8 text-center text-b3 text-neutral-700"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}