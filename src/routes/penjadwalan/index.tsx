import { Routes, Route } from "react-router-dom";
import PenjadwalanPage from "../../pages/Penjadwalan/PenjadwalanPage";

export function PenjadwalanRoutes() {
  return (
    <Routes>
      <Route index element={<PenjadwalanPage />} />
    </Routes>
  );
}