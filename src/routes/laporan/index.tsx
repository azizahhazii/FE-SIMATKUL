import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { LaporanLayout } from "../../layouts/LaporanLayout";

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

        <Route path="dosen" element={<JadwalDosenView />} />

        {isAdmin ? (
          <Route path="*" element={<Navigate to="dosen" replace />} />
        ) : (
          <>
            <Route path="ruangan" element={<JadwalRuangView />} />

            <Route path="kelas" element={<JadwalKelasView />} />
          </>
        )}
      </Route>
    </Routes>
  );
}

export default LaporanRoutes;
