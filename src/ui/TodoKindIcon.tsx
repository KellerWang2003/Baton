import type { ComponentType } from 'react'
import type { TodoKind } from '../data/onboarding'
import { cx } from './cx'
import { BoxIcon, CardIcon, GiftIcon, HomeIcon, MapPinIcon } from './icons'

// Each to-do category's round icon, in the colors of Today's setup cards
const kinds: Record<TodoKind, { icon: ComponentType; tone: string }> = {
  home: { icon: HomeIcon, tone: 'bg-baton-blue text-white' },
  belongings: { icon: BoxIcon, tone: 'bg-baton-pink text-baton-navy' },
  accounts: { icon: CardIcon, tone: 'bg-baton-olive text-white' },
  goodbyes: { icon: GiftIcon, tone: 'bg-baton-yellow text-baton-navy' },
  transit: { icon: MapPinIcon, tone: 'bg-baton-yellow text-baton-navy' },
}

// md: 36pt with a 19pt glyph. lg: 40pt with a 22pt glyph (Today's to-do cards
// and the category headers on the to-do picker)
const sizes = {
  md: 'size-9 [&_svg]:size-[19px]',
  lg: 'size-10 [&_svg]:size-[22px]',
}

export function TodoKindIcon({ kind, size = 'md', className }: { kind: TodoKind; size?: keyof typeof sizes; className?: string }) {
  const { icon: Glyph, tone } = kinds[kind]
  return (
    <span aria-hidden className={cx('inline-flex shrink-0 items-center justify-center rounded-full', sizes[size], tone, className)}>
      <Glyph />
    </span>
  )
}
