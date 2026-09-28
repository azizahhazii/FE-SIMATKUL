import { Route } from "react-router-dom";
import { JadwalDosenView } from "../../components/laporan/JadwalDosenView";

export const dosenLaporanRoute = (
  <Route path="dosen" element={<JadwalDosenView />} />
);