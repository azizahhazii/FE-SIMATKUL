import { Route } from "react-router-dom";
import { JadwalRuangView } from "../../components/laporan/JadwalRuangView";

export const ruangLaporanRoute = (
  <Route path="ruang" element={<JadwalRuangView />} />
);