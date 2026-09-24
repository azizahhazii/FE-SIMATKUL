import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { MasterDataRoutes } from "./masterData";
import { LaporanRoutes } from "./laporan";

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
        <Route path="master-data/*" element={<MasterDataRoutes />} />
        <Route
          path="penjadwalan"
          element={<Placeholder label="Penjadwalan" />}
        />
        {/* Mengganti Placeholder dengan LaporanRoutes */}
        <Route path="laporan/*" element={<LaporanRoutes />} />
      </Route>
    </Routes>
  );
}