import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'
import { ArrowUpIcon, PlusIcon, SmallCameraIcon } from './icons'

export type TabItem = {
  id: string
  label: string
  icon?: ReactNode
}

type TabBarProps = {
  tabs: TabItem[]
  active?: string
  // The + button morphs into this text field (like search in iOS 26 tab bars)
  composing: boolean
  onComposeChange: (open: boolean) => void
  onSubmit: (text: string, photos: number) => void
  placeholder?: string
  onSelect: (id: string) => void
}

const glass = 'border border-line/70 bg-surface/75 shadow-float backdrop-blur-xl'
const morph = 'transition-[flex-grow,flex-basis] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]'

// iOS-style floating tab bar. The tabs sit in one capsule and + is its own
// round button. Tapping + morphs it into a wide input while the tabs collapse
// into one round button showing the current tab (tap it to go back).
export function TabBar({ tabs, active, composing, onComposeChange, onSubmit, placeholder, onSelect }: TabBarProps) {
  const [text, setText] = useState('')
  const [photos, setPhotos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  // Bring the keyboard up once the field has grown
  useEffect(() => {
    if (!composing) return
    const timer = setTimeout(() => inputRef.current?.focus(), 250)
    return () => clearTimeout(timer)
  }, [composing])

  const close = () => {
    setText('')
    setPhotos(0)
    onComposeChange(false)
  }
  const canSend = text.trim().length > 0 || photos > 0
  const send = () => {
    if (!canSend) return
    onSubmit(text.trim(), photos)
    close()
  }

  return (
    <nav className="pointer-events-none flex items-center gap-3 px-4 pb-6">
      <div
        className={cx(
          'pointer-events-auto flex h-[62px] min-w-0 items-center overflow-hidden rounded-full p-1',
          glass,
          morph,
          composing ? 'grow-0 basis-[62px]' : 'grow basis-0',
        )}
      >
        {composing ? (
          <button
            type="button"
            onClick={close}
            aria-label={`Back to ${current.label}`}
            className="flex size-full items-center justify-center rounded-full text-brand"
          >
            {current.icon}
          </button>
        ) : (
          tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-current={tab.id === active ? 'page' : undefined}
              className={cx(
                'flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-semibold',
                tab.id === active ? 'bg-surface-muted text-brand' : 'text-ink',
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))
        )}
      </div>

      <div
        className={cx(
          'pointer-events-auto flex h-[62px] min-w-0 items-center overflow-hidden rounded-full',
          glass,
          morph,
          composing ? 'grow basis-0' : 'grow-0 basis-[62px]',
        )}
      >
        {composing ? (
          <form
            className="flex size-full items-center gap-1 pl-2 pr-2"
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <label className="relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted active:opacity-60">
              <SmallCameraIcon />
              {photos > 0 && (
                <span className="absolute -right-0.5 -top-0.5 inline-flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-on-brand">
                  {photos}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-label="Add photos"
                onChange={(event) => {
                  setPhotos((n) => n + (event.target.files?.length ?? 0))
                  event.target.value = ''
                }}
              />
            </label>
            <input
              ref={inputRef}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && close()}
              placeholder={placeholder}
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Save"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition disabled:bg-surface-muted disabled:text-ink-muted"
            >
              <ArrowUpIcon />
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => onComposeChange(true)}
            aria-label="Capture"
            className="inline-flex size-full items-center justify-center text-brand"
          >
            <PlusIcon />
          </button>
        )}
      </div>
    </nav>
  )
}
