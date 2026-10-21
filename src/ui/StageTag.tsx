import { cx } from './cx'
import { stageTones, type StageTone } from './stageTones'

export type { StageTone }

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
        // sm: the pill under Today's avatar (Figma 617:2838, a touch bigger per Keller Oct 21): 20pt tall, 13pt medium,
        // the words centered on the glyphs rather than the line box
        size === 'sm' && 'h-5 px-2.5 pb-0.5 text-[13px] font-medium leading-none',
        size === 'md' && 'px-2.5 py-0.5 text-caption font-medium ring-2 ring-white',
        size === 'lg' && 'h-10 px-4 text-[18px] font-medium tracking-[-0.011em]',
        tone === 'light' ? light : stageTones[stage],
        className,
      )}
    >
      {label}
    </span>
  )
}
