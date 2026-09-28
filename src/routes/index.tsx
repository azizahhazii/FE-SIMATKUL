import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "../pages/Login/Login";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

import { MasterDataRoutes } from "./masterData";
import { PenjadwalanRoutes } from "./penjadwalan";
import { LaporanRoutes } from "./laporan";

export function AppRoutes() {
  const { user } = useAuth();

  const isAdmin = user?.role?.toLowerCase() === "admin";

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
        {/* ================= ROOT ================= */}
        <Route
          index
          element={
            <Navigate
              to={isAdmin ? "/master-data" : "/laporan/dosen"}
              replace
            />
          }
        />

        {/* ================= MASTER DATA ================= */}
        <Route
          path="master-data/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <MasterDataRoutes />
            </ProtectedRoute>
          }
        />

        {/* ================= PENJADWALAN ================= */}
        <Route
          path="penjadwalan/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PenjadwalanRoutes />
            </ProtectedRoute>
          }
        />

        {/* ================= HASIL ================= */}
        <Route path="laporan/*" element={<LaporanRoutes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
