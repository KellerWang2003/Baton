import { cx } from './cx'

export type StageTone = 'moving' | 'newcomer' | 'local'

// The stage colors from the stage plan: Moving pink, Newcomer yellow, Local olive
const tones: Record<StageTone, string> = {
  moving: 'bg-baton-pink text-baton-navy',
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
        'inline-flex items-center whitespace-nowrap rounded-full ring-2 ring-white',
        size === 'sm' && 'px-1.5 py-px text-[9px] leading-[1.3] font-semibold',
        size === 'md' && 'px-2.5 py-0.5 text-caption font-semibold',
        size === 'lg' && 'h-10 px-4 text-[18px] font-medium tracking-[-0.011em]',
        tones[stage],
        className,
      )}
    >
      {label}
    </span>
  )
}
