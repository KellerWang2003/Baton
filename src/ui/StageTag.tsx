import { cx } from './cx'

export type StageTone = 'moving' | 'newcomer' | 'local'

// Stage colors: Moving blue (Figma TODAY 334:11626), Newcomer yellow, Local olive
const tones: Record<StageTone, string> = {
  moving: 'bg-baton-blue text-white',
  // Brand olive for text on yellow (Keller, Oct 19)
  newcomer: 'bg-baton-yellow text-baton-olive',
  local: 'bg-baton-olive text-baton-cream',
}

type StageTagProps = {
  stage: StageTone
  label: string
  // lg: the size of the onboarding tag chips (40pt, 18pt text)
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// A small pill under her profile picture saying which stage she's in
export function StageTag({ stage, label, size = 'sm', className }: StageTagProps) {
  return (
    <span
      className={cx(
        'inline-flex items-center whitespace-nowrap rounded-full',
        // sm: the pill under Today's avatar (Figma TODAY 334:11626)
        size === 'sm' && 'h-5 px-3 text-[10px] tracking-[-0.011em] shadow-pill',
        size === 'md' && 'px-2.5 py-0.5 text-caption font-semibold ring-2 ring-white',
        size === 'lg' && 'h-10 px-4 text-[18px] font-medium tracking-[-0.011em] ring-2 ring-white',
        tones[stage],
        className,
      )}
    >
      {label}
    </span>
  )
}
