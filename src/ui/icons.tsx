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

export function CommunityIcon() {
  return (
    <Icon>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18.5 14.5a6.5 6.5 0 0 1 3 5.5" />
    </Icon>
  )
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
