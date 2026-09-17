import { useState, useRef, useEffect } from 'react'
import { Button, Text } from 'assets-design-system'
import { MenuDotsIcon } from '../icons/MenuDotsIcon'

import BookmarkIcon from '@solar-icons/react/school/BookMarkSquare'
import ArrowRightUp from '@solar-icons/react/arrows/ArrowRightUp'
import Key from '@solar-icons/react/security/Key'
import UserId from '@solar-icons/react/users/UserId'
import UsersGroupRounded from '@solar-icons/react/users/UsersGroupRounded'
import ClockCircle from '@solar-icons/react/time/ClockCircle'
import Pen from '@solar-icons/react/messages/Pen'
import TrashBinMinimalistic from '@solar-icons/react/ui/TrashBinMinimalistic'
import { IconStat } from './IconStat'
import type { PeriodeAkademik } from '../../types/periodeAkademik'

interface PeriodeAkademikCardProps {
  periode: PeriodeAkademik
  onOpen?: (id: string) => void
  onMoreClick?: (id: string) => void
  onEdit?: (periode: PeriodeAkademik) => void
  onDelete?: (periode: PeriodeAkademik) => void
}

export function PeriodeAkademikCard({
  periode,
  onOpen,
  onMoreClick,
  onEdit,
  onDelete,
}: PeriodeAkademikCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex w-full flex-col gap-6 rounded-3 bg-white p-6 shadow-e1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Text variant="b3" className="text-neutral-800">
            Periode Akademik
          </Text>
          <Text variant="h6" className="text-neutral-1000">
            {periode.nama}
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={menuRef}>
            <Button
              theme="primary"
              variant="outline"
              size="sm"
              aria-label="Opsi lainnya"
              iconLeft={<MenuDotsIcon className="h-6 w-6" />}
              onClick={() => {
                setIsMenuOpen(!isMenuOpen)
                onMoreClick?.(periode.id)
              }}
            />

            {isMenuOpen && (
              <div className="absolute right-0 top-11 z-20 flex w-32 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white p-2 shadow-xl backdrop-blur-sm">
                {/* Tombol Edit */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onEdit?.(periode)
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#0097A7] hover:bg-[#E0F7FA]/60 transition"
                >
                  <Pen weight="BoldDuotone" className="h-4 w-4 text-[#0097A7]" />
                  Edit
                </button>

                {/* Tombol Hapus */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onDelete?.(periode)
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                >
                  <TrashBinMinimalistic weight="BoldDuotone" className="h-4 w-4 text-red-500" />
                  Hapus
                </button>
              </div>
            )}
          </div>

          <Button
            theme="primary"
            variant="solid"
            size="sm"
            aria-label="Buka periode"
            iconLeft={<ArrowRightUp weight="LineDuotone" />}
            onClick={() => onOpen?.(periode.id)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <IconStat icon={<BookmarkIcon className="h-6 w-6" />} value={periode.jumlahKurikulum} label="Data Kurikulum" />
        <IconStat icon={<Key weight="BoldDuotone" />} value={periode.jumlahRuang} label="Daftar Ruang" />
        <IconStat icon={<UserId weight="BoldDuotone" />} value={periode.jumlahDosen} label="Daftar Dosen" />
        <IconStat icon={<UsersGroupRounded weight="BoldDuotone" />} value={periode.jumlahKelas} label="Daftar Kelas" />
        <IconStat icon={<ClockCircle weight="BoldDuotone" />} value={periode.jumlahSesi} label="Sesi" />
      </div>
    </div>
  )
}