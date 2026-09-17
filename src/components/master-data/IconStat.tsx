import type { ReactNode } from "react";
import { StatCard } from "assets-design-system";

interface IconStatProps {
  icon: ReactNode;
  value: number;
  label: string;
}

export function IconStat({ icon, value, label }: IconStatProps) {
  return (
    <StatCard
      icon={icon}
      value={value}
      label={label}
      className="flex-none w-auto"
    />
  );
}
