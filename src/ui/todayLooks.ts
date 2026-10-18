// Visual treatments for Today, compared side by side in the team-only Today
// looks playground (Debug > Today looks, or ?today-looks). All follow the Figma
// Today frame (LA28 Palms 236:1282): the greeting, today's prompt inside a
// round liquid-glass window with its medium labeled above it, and everything
// else (setup cards, to-dos, suggestions) on a panel of another color below.
export type TodayLook = 'figma' | 'sky' | 'night' | 'blobs' | 'window' | 'sun'

// light: dark text on a light background; dark: cream text on a dark one
export type Tone = 'light' | 'dark'

export type TodayLookStyle = {
  id: TodayLook
  name: string
  blurb: string
  // Page behind the greeting and the circle
  page: string
  pageTone: Tone
  // Something for the glass to sit on: colored blobs, or a photo
  backdrop?: 'blobs' | 'photo' | 'sun'
  // The outer hairline ring, and the glass disc itself
  ring: string
  glass: string
  // Ink inside the glass
  glassTone: Tone
  // The small "Photo" / "Write" pill above the circle
  label: string
  // Bottom panel and the cards on it
  panel: string
  panelTone: Tone
  card: string
  setupCard: string
}

// Shared liquid-glass recipe: a frosted fill over a blur, a bright rim on top,
// a softer one below and a glow pooled at the edge.
const glassBase = 'backdrop-blur-xl backdrop-saturate-150'

export const todayLooks: TodayLookStyle[] = [
  {
    id: 'figma',
    name: 'Figma',
    blurb: 'As drawn: paper page, a white glass disc with a blue glow at its edge, and a cream panel below.',
    page: 'bg-baton-paper',
    pageTone: 'light',
    ring: 'border border-line/60',
    glass: `${glassBase} bg-white/70 shadow-[inset_0_0_42px_10px_color-mix(in_oklab,var(--color-baton-blue)_75%,transparent),inset_0_2px_2px_white,0_18px_40px_rgb(0_0_0/0.06)]`,
    glassTone: 'light',
    label: 'bg-baton-blue/15 text-baton-blue',
    panel: 'bg-baton-cream',
    panelTone: 'light',
    card: 'bg-white/80',
    setupCard: 'border-[1.5px] border-dashed border-baton-navy/25',
  },
  {
    id: 'sky',
    name: 'Blue sky',
    blurb: 'The top of the page is brand blue fading down to paper. The glass is mostly clear, so it reads as a window onto the sky.',
    page: 'bg-linear-to-b from-baton-blue via-baton-blue/60 to-baton-paper',
    pageTone: 'light',
    ring: 'border border-white/50',
    glass: `${glassBase} bg-white/25 shadow-[inset_0_2px_3px_white,inset_0_-8px_24px_rgb(255_255_255/0.45),inset_0_0_30px_rgb(255_255_255/0.35),0_24px_48px_color-mix(in_oklab,var(--color-baton-blue)_35%,transparent)]`,
    glassTone: 'light',
    label: 'bg-white/40 text-baton-navy backdrop-blur',
    panel: 'bg-baton-cream',
    panelTone: 'light',
    card: 'bg-white/80',
    setupCard: 'border-[1.5px] border-dashed border-baton-navy/25',
  },
  {
    id: 'night',
    name: 'Night',
    blurb: 'Navy page, the glass glowing pink and blue from inside like a lamp. Cream panel below.',
    page: 'bg-baton-navy',
    pageTone: 'dark',
    ring: 'border border-white/15',
    glass: `${glassBase} bg-white/8 shadow-[inset_0_2px_2px_rgb(255_255_255/0.5),inset_18px_-18px_50px_color-mix(in_oklab,var(--color-baton-pink)_55%,transparent),inset_-18px_18px_50px_color-mix(in_oklab,var(--color-baton-blue)_70%,transparent),0_0_60px_color-mix(in_oklab,var(--color-baton-blue)_30%,transparent)]`,
    glassTone: 'dark',
    label: 'bg-white/10 text-baton-cream',
    panel: 'bg-baton-cream',
    panelTone: 'light',
    card: 'bg-white/80',
    setupCard: 'border-[1.5px] border-dashed border-baton-navy/25',
  },
  {
    id: 'blobs',
    name: 'Color behind glass',
    blurb: 'Soft pink, yellow and blue shapes drift behind the circle, so the glass actually has something to blur. Navy panel below.',
    page: 'bg-baton-paper',
    pageTone: 'light',
    backdrop: 'blobs',
    ring: 'border border-white/70',
    glass: `${glassBase} bg-white/35 shadow-[inset_0_2px_3px_white,inset_0_-10px_30px_rgb(255_255_255/0.5),inset_0_0_24px_rgb(255_255_255/0.6),0_20px_40px_rgb(0_0_0/0.06)]`,
    glassTone: 'light',
    label: 'bg-baton-navy text-baton-cream',
    panel: 'bg-baton-navy',
    panelTone: 'dark',
    card: 'bg-white/8',
    setupCard: 'border-[1.5px] border-dashed border-baton-cream/30',
  },
  {
    id: 'window',
    name: 'Photo window',
    blurb: 'One of her own photos fills the top, blurred; the circle is a lens that shows it clear and dimmed under the prompt. Olive panel below.',
    page: 'bg-baton-olive',
    pageTone: 'dark',
    backdrop: 'photo',
    ring: 'border border-white/30',
    glass: 'shadow-[inset_0_2px_2px_rgb(255_255_255/0.7),inset_0_0_36px_rgb(255_255_255/0.35),0_24px_48px_rgb(0_0_0/0.25)]',
    glassTone: 'dark',
    label: 'bg-white/25 text-white backdrop-blur',
    panel: 'bg-baton-olive',
    panelTone: 'dark',
    card: 'bg-baton-cream/10',
    setupCard: 'border-[1.5px] border-dashed border-baton-cream/30',
  },
  {
    id: 'sun',
    name: 'Sun',
    blurb: 'Yellow page with a warm sun behind the circle; the glass picks up its glow. Blue panel below.',
    page: 'bg-baton-yellow/60',
    pageTone: 'light',
    backdrop: 'sun',
    ring: 'border border-white/60',
    glass: `${glassBase} bg-white/30 shadow-[inset_0_2px_3px_white,inset_0_0_40px_8px_rgb(255_255_255/0.55),0_24px_48px_color-mix(in_oklab,var(--color-baton-olive)_18%,transparent)]`,
    glassTone: 'light',
    label: 'bg-white/60 text-baton-olive',
    panel: 'bg-baton-blue',
    panelTone: 'light',
    card: 'bg-white/85',
    setupCard: 'border-[1.5px] border-dashed border-white/80',
  },
]
