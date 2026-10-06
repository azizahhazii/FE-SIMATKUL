import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { LaporanLayout } from "../../layouts/LaporanLayout";

import { AdminJadwalDosenView } from "../../components/laporan/AdminJadwalDosenView";
import { AdminJadwalRuangView } from "../../components/laporan/AdminJadwalRuangView";
import { AdminJadwalKelasView } from "../../components/laporan/AdminJadwalKelasView";

import { JadwalDosenView } from "../../components/laporan/JadwalDosenView";
import { JadwalRuangView } from "../../components/laporan/JadwalRuangView";
import { JadwalKelasView } from "../../components/laporan/JadwalKelasView";

export function LaporanRoutes() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <Routes>
      <Route element={<LaporanLayout />}>
        <Route index element={<Navigate to="dosen" replace />} />

        <Route
          path="dosen"
          element={
            isAdmin ? <AdminJadwalDosenView /> : <JadwalDosenView />
          }
        />
        <Route
          path="ruangan"
          element={
            isAdmin ? <AdminJadwalRuangView /> : <JadwalRuangView />
          }
        />
        <Route
          path="kelas"
          element={
            isAdmin ? <AdminJadwalKelasView /> : <JadwalKelasView />
          }
        />

        <Route path="*" element={<Navigate to="dosen" replace />} />
      </Route>
    </Routes>
  );
}

export default LaporanRoutes;