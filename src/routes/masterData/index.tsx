import { Routes, Route, Navigate } from "react-router-dom";
import { MasterDataPage } from "../../pages/MasterData/MasterDataPage";
import { MasterDataDetailLayout } from "../../layouts/MasterDataDetailLayout";
import { kurikulumRoute } from "./kurikulum.routes";
import { ruanganRoute } from "./ruangan.routes";
import { dosenRoute } from "./dosen.routes";
import { kelasRoute } from "./kelas.routes";
import { sesiRoute } from "./sesi.routes";

export function MasterDataRoutes() {
  return (
    <Routes>
      <Route index element={<MasterDataPage />} />
      <Route path=":periodeId" element={<MasterDataDetailLayout />}>
        <Route index element={<Navigate to="kurikulum" replace />} />
        {kurikulumRoute}
        {ruanganRoute}
        {dosenRoute}
        {kelasRoute}
        {sesiRoute}
      </Route>
    </Routes>
  );
}
