import { Route } from "react-router-dom";
import { JadwalKelasView } from "../../components/laporan/JadwalKelasView";

export const kelasLaporanRoute = (
  <Route path="kelas" element={<JadwalKelasView />} />
);