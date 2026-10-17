import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

const variants = {
  primary: 'bg-brand text-on-brand hover:brightness-95',
  stage: 'bg-stage text-on-stage hover:brightness-95',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-muted',
  ghost: 'text-ink hover:bg-surface-muted',
}

const sizes = {
  md: 'h-12 px-5 text-base',
  sm: 'h-9 px-3.5 text-sm',
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
        'inline-flex items-center justify-center gap-2 rounded-control font-display font-semibold transition disabled:opacity-40',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
