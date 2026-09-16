import React from 'react'

export function MenuDotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Titik Kiri */}
      <circle cx="6" cy="12" r="2" fill="currentColor" />
      {/* Titik Tengah */}
      <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5" />
      {/* Titik Kanan */}
      <circle cx="18" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}