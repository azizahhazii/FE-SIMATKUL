import BookmarkIcon from "@solar-icons/react/school/BookmarkSquare";
import Key from "@solar-icons/react/security/KeySquare";
import UserId from "@solar-icons/react/users/UserId";
import UsersGroupRounded from "@solar-icons/react/users/UsersGroupTwoRounded";
import ClockCircle from "@solar-icons/react/time/ClockSquare";
import { IconStat } from "./IconStat";

interface MasterDataStatsProps {
  jumlahKurikulum: number;
  jumlahRuang: number;
  jumlahDosen: number;
  jumlahKelas: number;
  jumlahSesi: number;
}

export function MasterDataStats(props: MasterDataStatsProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      <IconStat
        icon={<BookmarkIcon weight="BoldDuotone" />}
        value={props.jumlahKurikulum}
        label="Data Kurikulum"
      />
      <IconStat
        icon={<Key weight="BoldDuotone" />}
        value={props.jumlahRuang}
        label="Daftar Ruang"
      />
      <IconStat
        icon={<UserId weight="BoldDuotone" />}
        value={props.jumlahDosen}
        label="Daftar Dosen"
      />
      <IconStat
        icon={<UsersGroupRounded weight="BoldDuotone" />}
        value={props.jumlahKelas}
        label="Daftar Kelas"
      />
      <IconStat
        icon={<ClockCircle weight="BoldDuotone" />}
        value={props.jumlahSesi}
        label="Sesi"
      />
    </div>
  );
}
