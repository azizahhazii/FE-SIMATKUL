import { Routes, Route, Navigate } from "react-router-dom";
import { LaporanLayout } from "../../layouts/LaporanLayout";
import { JadwalDosenView } from "../../components/laporan/JadwalDosenView";
import { JadwalRuangView } from "../../components/laporan/JadwalRuangView";
import { JadwalKelasView } from "../../components/laporan/JadwalKelasView";

export function LaporanRoutes() {
  return (
    <Routes>
      <Route element={<LaporanLayout />}>
        {/* Redirect otomatis dari /laporan ke /laporan/dosen */}
        <Route index element={<Navigate to="dosen" replace />} />
        <Route path="dosen" element={<JadwalDosenView />} />
        <Route path="ruangan" element={<JadwalRuangView />} />
        <Route path="kelas" element={<JadwalKelasView />} />
      </Route>
    </Routes>
  );
}