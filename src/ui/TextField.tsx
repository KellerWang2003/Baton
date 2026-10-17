import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cx } from './cx'

const fieldClass =
  'w-full rounded-control bg-surface-muted px-4 py-3 text-base text-ink placeholder:text-ink-muted outline-none focus:ring-2 focus:ring-stage'

type FieldProps = {
  label?: string
  hint?: string
  className?: string
}

export function TextField({
  label,
  hint,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} className={className}>
      <input id={id} {...props} className={fieldClass} />
    </Field>
  )
}

export function TextArea({
  label,
  hint,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Field id={id} label={label} hint={hint} className={className}>
      <textarea id={id} rows={4} {...props} className={cx(fieldClass, 'resize-none')} />
    </Field>
  )
}

function Field({ id, label, hint, className, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}
