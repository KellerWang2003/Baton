import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

// iOS button styles: filled, tinted, gray and plain.
const variants = {
  primary: 'bg-brand text-on-brand active:opacity-80',
  tinted: 'bg-brand/15 text-brand active:opacity-70',
  secondary: 'bg-surface-muted text-brand active:opacity-70',
  ghost: 'text-brand active:opacity-50',
  stage: 'bg-stage text-on-stage active:opacity-80',
  destructive: 'bg-danger/15 text-danger active:opacity-70',
}

// md: large full-weight button (50pt, rounded rect). sm: compact capsule.
const sizes = {
  md: 'h-[50px] rounded-control px-5 text-headline',
  sm: 'h-8 rounded-full px-3.5 text-subhead',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-semibold transition disabled:opacity-40',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
