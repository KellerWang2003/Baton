import type { SVGProps } from 'react'

// Placeholder line icons (24px, currentColor). Swap for the final set later.
function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-6"
      {...props}
    />
  )
}

export function TodayIcon() {
  return (
    <Icon>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </Icon>
  )
}

export function ArchiveIcon() {
  return (
    <Icon>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" />
    </Icon>
  )
}

// Relay tab: the baton handed over, from the Figma nav (public/brand/relay-tab.svg).
// Drawn as a mask so it takes the tab's text color like the line icons.
export function RelayIcon() {
  return <span aria-hidden className="block size-5 bg-current [mask:url(/brand/relay-tab.svg)_center/contain_no-repeat]" />
}

export function PlusIcon() {
  return (
    <Icon strokeWidth={2.2} className="size-7">
      <path d="M12 5v14M5 12h14" />
    </Icon>
  )
}

export function ChevronLeftIcon() {
  return (
    <Icon strokeWidth={2.4} className="size-6">
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  )
}

export function ChevronRightIcon() {
  return (
    <Icon strokeWidth={2.2} className="size-4">
      <path d="M9 5l7 7-7 7" />
    </Icon>
  )
}

export function CameraIcon() {
  return (
    <Icon className="size-7">
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.5-2h7.4l1.5 2h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icon>
  )
}

export function CheckIcon() {
  return (
    <Icon strokeWidth={3} className="size-3.5">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Icon>
  )
}

export function MapPinIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </Icon>
  )
}

export function PhotosIcon() {
  return (
    <Icon className="size-10" strokeWidth={1.5}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.8" />
      <path d="M21 15.5l-5-5-8.5 8.5" />
    </Icon>
  )
}

// Placeholder graphics for the status cards. Swap for real illustrations later.
export function BoxesGraphic() {
  return (
    <Icon className="size-12" strokeWidth={1.4}>
      <rect x="3" y="11" width="9" height="9" rx="1" />
      <rect x="12" y="11" width="9" height="9" rx="1" />
      <rect x="7.5" y="3" width="9" height="8" rx="1" />
      <path d="M7.5 11v2.5M16.5 11v2.5M12 3v2.5" />
    </Icon>
  )
}

export function ArrivalGraphic() {
  return (
    <Icon className="size-12" strokeWidth={1.4}>
      <path d="M3 20h18" />
      <path d="M4 13.5l3.2 1 3-2.5-6-5.5 2-.6 8.3 4 3.7-1.2a1.6 1.6 0 0 1 1 3L6.5 16.5 3.5 14z" />
    </Icon>
  )
}

export function HomeGraphic() {
  return (
    <Icon className="size-12" strokeWidth={1.4}>
      <path d="M4 10.5L12 4l8 6.5V20H4z" />
      <path d="M10 20v-5h4v5" />
    </Icon>
  )
}

export function ArrowUpIcon() {
  return (
    <Icon strokeWidth={2.4} className="size-5">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Icon>
  )
}

export function SmallCameraIcon() {
  return (
    <Icon className="size-6">
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.5-2h7.4l1.5 2h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icon>
  )
}

// Small icons for the setup cards on Today
export function PlaneIcon() {
  return (
    <Icon className="size-5">
      <path d="M10.5 13.5L3 11l1.5-1.5 7.5 1 4.5-4.5a2.1 2.1 0 0 1 3 3L15 13.5l1 7.5-1.5 1.5-2.5-7.5-3.5 3.5V21l-1.5-1.5-1-2.5-2.5-1L3 14.5h2.5z" />
    </Icon>
  )
}

export function ListIcon() {
  return (
    <Icon className="size-5">
      <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </Icon>
  )
}

export function AtIcon() {
  return (
    <Icon className="size-5">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M15.5 12v1.5a2.5 2.5 0 0 0 5 0V12a8.5 8.5 0 1 0-3.3 6.7" />
    </Icon>
  )
}

export function StackIcon() {
  return (
    <Icon className="size-5">
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <path d="M5 9v9.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" />
    </Icon>
  )
}

export function ArrowRightIcon() {
  return (
    <Icon strokeWidth={2.4} className="size-5">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  )
}

export function SearchIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <Icon strokeWidth={2.2} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </Icon>
  )
}

export function NoteIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <Icon strokeWidth={2} className={className}>
      <path d="M4.5 6a1.5 1.5 0 0 1 1.5-1.5h12A1.5 1.5 0 0 1 19.5 6v8.5A1.5 1.5 0 0 1 18 16h-8l-4 3.5V16a1.5 1.5 0 0 1-1.5-1.5z" />
    </Icon>
  )
}

export function MapIcon() {
  return (
    <Icon className="size-5">
      <path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2zM9 4.5v13M15 6.5v13" />
    </Icon>
  )
}
