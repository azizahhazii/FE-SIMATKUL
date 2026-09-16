import type { SVGProps } from 'react'

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 2V5M16 2V5M3.5 9H20.5M5 4H19C20.1046 4 21 4.89543 21 6V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="13" r="1" fill="currentColor"/>
      <circle cx="12" cy="13" r="1" fill="currentColor"/>
      <circle cx="16" cy="13" r="1" fill="currentColor"/>
      <circle cx="8" cy="17" r="1" fill="currentColor"/>
      <circle cx="12" cy="17" r="1" fill="currentColor"/>
      <circle cx="16" cy="17" r="1" fill="currentColor"/>
    </svg>
  )
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function DocumentSendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path opacity="0.4" d="M4 7C4 4.79086 5.79086 3 8 3H13.5L19 8.5V17C19 19.2091 17.2091 21 15 21H8C5.79086 21 4 19.2091 4 17V7Z" fill="currentColor" />
      <path d="M13.5 3L19 8.5H15C14.1716 8.5 13.5 7.82843 13.5 7V3Z" fill="currentColor" />
      <path d="M8.5 14H13.5M13.5 14L11.5 12M13.5 14L11.5 16" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DocumentFailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path opacity="0.4" d="M4 7C4 4.79086 5.79086 3 8 3H13.5L19 8.5V17C19 19.2091 17.2091 21 15 21H8C5.79086 21 4 19.2091 4 17V7Z" fill="currentColor" />
      <path d="M13.5 3L19 8.5H15C14.1716 8.5 13.5 7.82843 13.5 7V3Z" fill="currentColor" />
      <path d="M9.5 12.5L12.5 15.5M12.5 12.5L9.5 15.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}