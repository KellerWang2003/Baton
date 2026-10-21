import { cx } from './cx'

export type StageTone = 'moving' | 'newcomer' | 'local'

// Stage colors: Moving blue (Figma TODAY 334:11626), Newcomer yellow, Local olive
const tones: Record<StageTone, string> = {
  moving: 'bg-baton-blue text-white',
  // Brand olive for text on yellow (Keller, Oct 19)
  newcomer: 'bg-baton-yellow text-baton-olive',
  local: 'bg-baton-olive text-baton-cream',
}
// Brand cream with dark text, for a pill that stands on its own (You're a Newcomer now)
const light = 'bg-baton-cream text-baton-navy'

type StageTagProps = {
  stage: StageTone
  label: string
  // lg: the size of the onboarding tag chips (40pt, 18pt text)
  size?: 'sm' | 'md' | 'lg'
  // light: brand cream with dark text instead of the stage's color
  tone?: 'stage' | 'light'
  className?: string
}

// A small pill under her profile picture saying which stage she's in
export function StageTag({ stage, label, size = 'sm', tone = 'stage', className }: StageTagProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full',
        // sm: the pill under Today's avatar, at the app's Chip size (32pt, 15pt medium; Keller Oct 21:
        // the 20pt pill from Figma TODAY 334:11626 read too small), edged in the paper color
        size === 'sm' && 'h-8 px-3.5 text-subhead font-medium shadow-pill ring-2 ring-baton-paper',
        size === 'md' && 'px-2.5 py-0.5 text-caption font-medium ring-2 ring-white',
        size === 'lg' && 'h-10 px-4 text-[18px] font-medium tracking-[-0.011em]',
        tone === 'light' ? light : tones[stage],
        className,
      )}
    >
      {label}
    </span>
  )
}
