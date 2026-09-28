import { useNavigate, useLocation, Outlet } from "react-router-dom";

import { Sidebar, type SidebarItem } from "assets-design-system";

import Database from "@solar-icons/react/ui/Database";
import CalendarMark from "@solar-icons/react/files/FileSmile";
import DocumentText from "@solar-icons/react/files/FileSend";

import simatkulIcon from "../assets/logo/simatkul-icon.svg";
import { useAuth } from "../context/AuthContext";

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const isGuest = user?.role?.toLowerCase() === "guest";

  const items: SidebarItem[] = [
    {
      key: "master-data",
      icon: (
        <Database
          weight="BoldDuotone"
          className={isGuest ? "opacity-35" : ""}
        />
      ),
      label: "Master Data",
      active: !isGuest && location.pathname.startsWith("/master-data"),
      onClick: () => {
        if (isGuest) return;
        navigate("/master-data");
      },
    },
    {
      key: "penjadwalan",
      icon: (
        <CalendarMark
          weight="BoldDuotone"
          className={isGuest ? "opacity-35" : ""}
        />
      ),
      label: "Penjadwalan",
      active: !isGuest && location.pathname.startsWith("/penjadwalan"),
      onClick: () => {
        if (isGuest) return;
        navigate("/penjadwalan");
      },
    },
    {
      key: "hasil",
      icon: <DocumentText weight="BoldDuotone" />,
      label: "Hasil",
      active: location.pathname.startsWith("/laporan"),
      onClick: () => navigate("/laporan/dosen"),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        logo={
          <div className="flex items-center gap-2">
            <img src={simatkulIcon} alt="" className="h-10 w-10" />

            <span className="text-h7 font-bold text-primary-500">SIMATKUL</span>
          </div>
        }
        items={items}
        user={{
          name: user?.name ?? "Admin",
        }}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto bg-neutral-300 p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
