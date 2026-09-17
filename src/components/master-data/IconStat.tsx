import type { ReactNode } from 'react'
import { StatCard } from 'assets-design-system'

function IconBox({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-12 items-center justify-center rounded-2 bg-[#FDF1E8] p-2.5 text-[#D16E05] [&>svg]:size-full">
      {children}
    </span>
  )
}

interface IconStatProps {
  icon: ReactNode
  value: number
  label: string
}

export function IconStat({ icon, value, label }: IconStatProps) {
  return <StatCard icon={<IconBox>{icon}</IconBox>} value={value} label={label} />
}