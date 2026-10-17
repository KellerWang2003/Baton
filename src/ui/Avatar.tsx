import { cx } from './cx'

const sizes = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-14 text-lg',
}

type AvatarProps = {
  name: string
  src?: string
  size?: keyof typeof sizes
  className?: string
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-muted font-display font-semibold text-on-brand',
        sizes[size],
        className,
      )}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials}
    </span>
  )
}
