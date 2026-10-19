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

export function PencilIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <Icon className={className}>
      <path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z" />
      <path d="M13.5 7l3 3" />
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

export function DownloadIcon() {
  return (
    <Icon className="size-5">
      <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
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

export function MicIcon() {
  return (
    <Icon className="size-5">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
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
// Filled camera (SF camera.fill), for the photo prompt on Today
export const cameraFillPath =
  'M3 8.5A1.5 1.5 0 0 1 4.5 7h2.3l1.5-2h7.4l1.5 2h2.3A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5zM16.2 13a4.2 4.2 0 1 0-8.4 0a4.2 4.2 0 1 0 8.4 0z'

export function CameraFillIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <Icon className={className} stroke="none" fill="currentColor">
      <path d={cameraFillPath} fillRule="evenodd" />
      <circle cx="12" cy="13" r="2.6" />
    </Icon>
  )
}

// To-do category glyphs from Figma (SF Symbols house, shippingbox,
// creditcard and gift, node 334:11690), filled in the current text color.
// Each viewBox is the glyph's exact bounds, so it sits centered in its circle.
function Glyph({ viewBox, d }: { viewBox: string; d: string }) {
  return (
    <svg viewBox={`0 0 ${viewBox}`} fill="currentColor" aria-hidden className="size-5">
      <path d={d} />
    </svg>
  )
}

export function HomeIcon() {
  return <Glyph viewBox="21.47 18.84" d="M8.19141 17.5518V12.0059C8.19141 11.8008 8.25293 11.6367 8.37598 11.5137C8.50488 11.3848 8.6748 11.3203 8.88574 11.3203H12.5947C12.8057 11.3203 12.9697 11.3848 13.0869 11.5137C13.21 11.6367 13.2715 11.8008 13.2715 12.0059V17.5518H8.19141ZM0.905273 9.71191C0.624023 9.71191 0.401367 9.62988 0.237305 9.46582C0.0791016 9.2959 0 9.09668 0 8.86816C0 8.59277 0.114258 8.36133 0.342773 8.17383L9.50098 0.483398C9.88184 0.161133 10.292 0 10.7314 0C11.1768 0 11.5869 0.161133 11.9619 0.483398L21.1201 8.17383C21.3545 8.36133 21.4717 8.59277 21.4717 8.86816C21.4717 9.09668 21.3896 9.2959 21.2256 9.46582C21.0674 9.62988 20.8477 9.71191 20.5664 9.71191C20.4316 9.71191 20.3027 9.68262 20.1797 9.62402C20.0625 9.55957 19.9512 9.4834 19.8457 9.39551L11.1094 2.06543C10.9922 1.96582 10.8662 1.91602 10.7314 1.91602C10.6025 1.91602 10.4795 1.96582 10.3623 2.06543L1.63477 9.39551C1.52344 9.4834 1.40625 9.55957 1.2832 9.62402C1.16602 9.68262 1.04004 9.71191 0.905273 9.71191ZM16.3125 4.61426V2.5752C16.3125 2.37598 16.3711 2.21777 16.4883 2.10059C16.6113 1.9834 16.7695 1.9248 16.9629 1.9248H18.1494C18.3486 1.9248 18.5068 1.9834 18.624 2.10059C18.7412 2.21777 18.7998 2.37598 18.7998 2.5752V6.70605L16.3125 4.61426ZM4.79004 18.835C4.12207 18.835 3.60059 18.6533 3.22559 18.29C2.85645 17.9326 2.67188 17.4258 2.67188 16.7695V6.9873L4.39453 5.81836V16.251C4.39453 16.5264 4.46777 16.7373 4.61426 16.8838C4.7666 17.0303 4.97754 17.1035 5.24707 17.1035H16.2246C16.5 17.1035 16.708 17.0303 16.8486 16.8838C16.9951 16.7373 17.0684 16.5264 17.0684 16.251V5.80957L18.7998 6.9873V16.7695C18.7998 17.4199 18.6123 17.9268 18.2373 18.29C17.8682 18.6533 17.3496 18.835 16.6816 18.835H4.79004Z" />
}

export function GiftIcon() {
  return <Glyph viewBox="17.18 18.67" d="M3.81445 18.668C2.97656 18.668 2.33203 18.4482 1.88086 18.0088C1.43555 17.5752 1.21289 16.9424 1.21289 16.1104V10.8457H1.16895C0.782227 10.7402 0.489258 10.5293 0.290039 10.2129C0.0966797 9.89648 0 9.50098 0 9.02637V6.79395C0 6.20215 0.164062 5.7334 0.492188 5.3877C0.820312 5.04199 1.27148 4.86914 1.8457 4.86914H3.375C3.14062 4.62891 2.95605 4.35059 2.82129 4.03418C2.69238 3.71777 2.62793 3.375 2.62793 3.00586C2.62793 2.41992 2.76562 1.90137 3.04102 1.4502C3.32227 0.999023 3.7002 0.644531 4.1748 0.386719C4.64941 0.128906 5.17676 0 5.75684 0C6.41309 0 6.99316 0.175781 7.49707 0.527344C8.00684 0.878906 8.37012 1.37402 8.58691 2.0127C8.80371 1.37402 9.16699 0.878906 9.67676 0.527344C10.1865 0.175781 10.7637 0 11.4082 0C11.9941 0 12.5215 0.128906 12.9902 0.386719C13.4648 0.644531 13.8428 0.999023 14.124 1.4502C14.4053 1.90137 14.5459 2.41992 14.5459 3.00586C14.5459 3.375 14.4785 3.71777 14.3438 4.03418C14.2148 4.35059 14.0332 4.62891 13.7988 4.86914H15.3281C15.9199 4.86914 16.377 5.04199 16.6992 5.3877C17.0215 5.7334 17.1826 6.20215 17.1826 6.79395V9.02637C17.1826 9.50098 17.0801 9.89648 16.875 10.2129C16.6758 10.5293 16.3857 10.7402 16.0049 10.8457H15.9521V16.1104C15.9521 16.9424 15.7295 17.5752 15.2842 18.0088C14.8389 18.4482 14.2002 18.668 13.3682 18.668H3.81445ZM7.69922 17.0947V10.96H2.92676V16.0137C2.92676 16.3535 3.02051 16.6172 3.20801 16.8047C3.39551 16.998 3.66211 17.0947 4.00781 17.0947H7.69922ZM9.47461 17.0947H13.1572C13.5088 17.0947 13.7783 16.998 13.9658 16.8047C14.1533 16.6172 14.2471 16.3535 14.2471 16.0137V10.96H9.47461V17.0947ZM7.69922 9.4043V6.4248H2.30273C2.0918 6.4248 1.93945 6.47168 1.8457 6.56543C1.75781 6.65918 1.71387 6.81152 1.71387 7.02246V8.79785C1.71387 9.00879 1.75781 9.16406 1.8457 9.26367C1.93945 9.35742 2.0918 9.4043 2.30273 9.4043H7.69922ZM9.47461 9.4043H14.8799C15.085 9.4043 15.2344 9.36035 15.3281 9.27246C15.4219 9.17871 15.4688 9.02637 15.4688 8.81543V7.02246C15.4688 6.81152 15.4219 6.65918 15.3281 6.56543C15.2344 6.47168 15.085 6.4248 14.8799 6.4248H9.47461V9.4043ZM7.75195 4.86914V3.70898C7.75195 3.08789 7.57324 2.59277 7.21582 2.22363C6.8584 1.84863 6.4248 1.66113 5.91504 1.66113C5.44043 1.66113 5.05371 1.7959 4.75488 2.06543C4.45605 2.3291 4.30664 2.69531 4.30664 3.16406C4.30664 3.64453 4.49121 4.04883 4.86035 4.37695C5.23535 4.70508 5.75977 4.86914 6.43359 4.86914H7.75195ZM9.41309 4.86914H10.7402C11.4141 4.86914 11.9355 4.70508 12.3047 4.37695C12.6797 4.04883 12.8672 3.64453 12.8672 3.16406C12.8672 2.69531 12.7178 2.3291 12.4189 2.06543C12.1201 1.7959 11.7334 1.66113 11.2588 1.66113C10.749 1.66113 10.3125 1.84863 9.94922 2.22363C9.5918 2.59277 9.41309 3.08789 9.41309 3.70898V4.86914Z" />
}

export function BoxIcon() {
  return <Glyph viewBox="17.9 19.3" d="M1.26562 15.2139C0.849609 14.9795 0.533203 14.707 0.316406 14.3965C0.105469 14.0859 0 13.623 0 13.0078V5.89746C0 5.42871 0.0908203 5.03906 0.272461 4.72852C0.454102 4.41211 0.741211 4.14551 1.13379 3.92871L7.3125 0.46582C7.85742 0.155273 8.40527 0 8.95605 0C9.50684 0 10.0518 0.155273 10.5908 0.46582L16.7695 3.92871C17.1621 4.14551 17.4492 4.41211 17.6309 4.72852C17.8125 5.03906 17.9033 5.42871 17.9033 5.89746V13.0078C17.9033 13.623 17.7979 14.0859 17.5869 14.3965C17.376 14.707 17.0596 14.9795 16.6377 15.2139L9.68555 19.0986C9.43945 19.2334 9.19336 19.3008 8.94727 19.3008C8.70703 19.3008 8.4668 19.2334 8.22656 19.0986L1.26562 15.2139ZM2.21484 13.8604L8.13867 17.2002V10.1514L1.56445 6.44238V12.8496C1.56445 13.0781 1.61133 13.2715 1.70508 13.4297C1.80469 13.582 1.97461 13.7256 2.21484 13.8604ZM15.6885 13.8604C15.9287 13.7256 16.0957 13.582 16.1895 13.4297C16.2891 13.2715 16.3389 13.0781 16.3389 12.8496V6.44238L9.76465 10.1514V17.2002L15.6885 13.8604ZM8.95605 8.70996L11.4082 7.33008L4.9043 3.68262L2.46094 5.07129L8.95605 8.70996ZM13.0781 6.40723L15.4512 5.07129L9.89648 1.94238C9.27539 1.58496 8.64551 1.58496 8.00684 1.94238L6.55664 2.75977L13.0781 6.40723Z" />
}

export function CardIcon() {
  return <Glyph viewBox="20.79 15.21" d="M4.18359 11.9004C3.92578 11.9004 3.71777 11.8213 3.55957 11.6631C3.40137 11.5049 3.32227 11.3027 3.32227 11.0566V9.43066C3.32227 9.17871 3.40137 8.97656 3.55957 8.82422C3.71777 8.66602 3.92578 8.58691 4.18359 8.58691H6.33691C6.59473 8.58691 6.80273 8.66602 6.96094 8.82422C7.11914 8.97656 7.19824 9.17871 7.19824 9.43066V11.0566C7.19824 11.3027 7.11914 11.5049 6.96094 11.6631C6.80273 11.8213 6.59473 11.9004 6.33691 11.9004H4.18359ZM0.993164 5.71289V3.65625H19.8105V5.71289H0.993164ZM2.88281 15.2139C1.93359 15.2139 1.21582 14.9736 0.729492 14.4932C0.243164 14.0127 0 13.3037 0 12.3662V2.85645C0 1.91895 0.243164 1.20996 0.729492 0.729492C1.21582 0.243164 1.93359 0 2.88281 0H17.9121C18.8613 0 19.5791 0.243164 20.0654 0.729492C20.5518 1.21582 20.7949 1.9248 20.7949 2.85645V12.3662C20.7949 13.3037 20.5518 14.0127 20.0654 14.4932C19.5791 14.9736 18.8613 15.2139 17.9121 15.2139H2.88281ZM2.98828 13.4912H17.8066C18.2109 13.4912 18.5215 13.3857 18.7383 13.1748C18.9609 12.958 19.0723 12.6387 19.0723 12.2168V3.01465C19.0723 2.58691 18.9609 2.26758 18.7383 2.05664C18.5215 1.83984 18.2109 1.73145 17.8066 1.73145H2.98828C2.57812 1.73145 2.26465 1.83984 2.04785 2.05664C1.83691 2.26758 1.73145 2.58691 1.73145 3.01465V12.2168C1.73145 12.6387 1.83691 12.958 2.04785 13.1748C2.26465 13.3857 2.57812 13.4912 2.98828 13.4912Z" />
}

export function ChevronDownIcon() {
  return (
    <Icon className="size-5">
      <path d="M6 9l6 6 6-6" />
    </Icon>
  )
}

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
