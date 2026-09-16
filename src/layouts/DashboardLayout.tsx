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

  const items: SidebarItem[] = [
    {
      key: "master-data",
      icon: <Database weight="Bold" />,
      label: "Master Data",
      active: location.pathname.startsWith("/master-data"),
      onClick: () => navigate("/master-data"),
    },
    {
      key: "penjadwalan",
      icon: <CalendarMark weight="Bold" />,
      label: "Penjadwalan",
      active: location.pathname.startsWith("/penjadwalan"),
      onClick: () => navigate("/penjadwalan"),
    },
    {
      key: "hasil",
      icon: <DocumentText weight="Bold" />,
      label: "Hasil",
      active: location.pathname.startsWith("/laporan"),
      onClick: () => navigate("/laporan"),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        logo={
          <div className="flex items-center gap-2">
            <img src={simatkulIcon} alt="" className="h-10 w-10" />
            <span className="text-h7 font-bold text-primary-500">SIMATKUL</span>
          </div>
        }
        items={items}
        user={{ name: user?.name ?? "Admin" }}
        onLogout={handleLogout}
      />
      <main className="flex-1 bg-neutral-300 p-10">
        <Outlet />
      </main>
    </div>
  );
}
