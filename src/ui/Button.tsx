import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

// iOS button styles: filled, tinted, gray and plain, plus glow: the brand
// blue with a bright core (Continue on LA Wrapped, Figma 278:7144).
const variants = {
  primary: 'bg-brand text-on-brand active:opacity-80',
  blue: 'bg-baton-blue text-ink active:opacity-80',
  tinted: 'bg-brand/15 text-brand active:opacity-70',
  secondary: 'bg-surface-muted text-brand active:opacity-70',
  ghost: 'text-brand active:opacity-50',
  stage: 'bg-stage text-on-stage active:opacity-80',
  destructive: 'bg-danger/15 text-danger active:opacity-70',
  glow: 'bg-white bg-[radial-gradient(281px_111px_at_center,var(--color-cta-glow-core),var(--color-cta-glow-edge))] text-white active:opacity-80',
  onboarding: 'onboarding-continue active:opacity-80',
}

// md: large full-weight button (50pt, rounded rect). sm: compact capsule.
// cta: 52pt pill with the label on the left and an icon (arrow) on the right.
const sizes = {
  md: 'h-[50px] justify-center rounded-button px-5 text-headline font-semibold',
  sm: 'h-8 justify-center rounded-full px-3.5 text-subhead font-semibold',
  cta: 'h-[52px] justify-between rounded-button pr-5 pl-[31px] text-cta font-medium',
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
        'inline-flex items-center gap-2 transition disabled:opacity-40',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
