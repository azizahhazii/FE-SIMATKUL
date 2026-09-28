import { Routes, Route, Navigate } from "react-router-dom";
import { Login } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { MasterDataRoutes } from "./masterData";
import { PenjadwalanRoutes } from "./penjadwalan";
import { LaporanRoutes } from "./laporan";

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

        <Route path="penjadwalan/*" element={<PenjadwalanRoutes />} />

        <Route path="laporan/*" element={<LaporanRoutes />} />
      </Route>
    </Routes>
  );
}
