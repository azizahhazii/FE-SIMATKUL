import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { PeriodeAkademik } from "../pages/MasterData/PeriodeAkademik/PeriodeAkademik";
import { MasterDataPage } from "../pages/MasterDataPage";

function Placeholder({ label }: { label: string }) {
  return <p className="text-b1">Halaman {label} (nnt dl sbr)</p>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/master-data" replace />} />
        <Route
          path="master-data/*"
          element={<MasterDataPage/>}
        />
        <Route
          path="penjadwalan"
          element={<Placeholder label="Penjadwalan" />}
        />
        <Route
          path="laporan/*"
          element={<Placeholder label="Hasil" />}
        />
        <Route
          path="master-data/*"
          element={<PeriodeAkademik />}
        />
      </Route>
    </Routes>
  );
}
