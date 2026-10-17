import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'
import { ArrowUpIcon, PlusIcon, SmallCameraIcon } from './icons'
import { RecentPhotos } from './RecentPhotos'
import type { PhotoItem } from './RecentPhotos'

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
  // Opening must focus the field inside the tap, or iOS won't raise the keyboard
  onOpen: () => void
  onClose: () => void
  onSubmit: (text: string, photos: string[]) => void
  // Shown as a row above the field to attach with one tap
  recentPhotos?: PhotoItem[]
  fieldRef?: (element: HTMLInputElement | null) => void
  placeholder?: string
  onSelect: (id: string) => void
}

const glass = 'border border-line/70 bg-surface/75 shadow-float backdrop-blur-xl'
// iOS spring-like curve, used for every part of the morph so they move together
const ease = 'ease-[cubic-bezier(0.32,0.72,0,1)]'
const morph = `transition-[flex-grow,flex-basis] duration-500 ${ease}`
// One layer fades out while the other fades in, both slightly scaled and blurred
const layer = (shown: boolean, delay = false) =>
  cx(
    'transition-[opacity,scale,filter] duration-300',
    ease,
    shown ? 'scale-100 opacity-100 blur-none' : 'pointer-events-none scale-75 opacity-0 blur-sm duration-150',
    shown && delay && 'delay-100',
  )

// iOS-style floating tab bar. The tabs sit in one capsule and + is its own
// round button. Tapping + morphs it into a wide input while the tabs collapse
// into one round button showing the current tab (tap it to go back). Recent
// photos rise above it; tapped ones show inside the field, which grows to fit.
export function TabBar({
  tabs,
  active,
  composing,
  onOpen,
  onClose,
  onSubmit,
  recentPhotos = [],
  fieldRef,
  placeholder,
  onSelect,
}: TabBarProps) {
  // The draft stays if she closes without sending, like Messages
  const [text, setText] = useState('')
  const [attached, setAttached] = useState<PhotoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  // Drop the keyboard whenever the field closes, however it was closed
  useEffect(() => {
    if (!composing) inputRef.current?.blur()
  }, [composing])

  const toggle = (photo: PhotoItem) =>
    setAttached((list) => (list.some((p) => p.id === photo.id) ? list.filter((p) => p.id !== photo.id) : [...list, photo]))

  const canSend = text.trim().length > 0 || attached.length > 0
  const send = () => {
    if (!canSend) return
    onSubmit(
      text.trim(),
      attached.map((photo) => photo.src),
    )
    setText('')
    setAttached([])
    onClose()
  }

  return (
    <div className="pointer-events-none flex flex-col">
      {/* Takes no room while closed, so nothing invisible covers the page */}
      <div className={cx('grid transition-[grid-template-rows] duration-500', ease, composing ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="min-h-0 overflow-hidden">
          <RecentPhotos
            photos={recentPhotos}
            selected={attached.map((photo) => photo.id)}
            onToggle={toggle}
            open={composing}
          />
        </div>
      </div>

      <nav className="flex items-end gap-3 px-4">
        {/* Tabs, collapsing into one round button for the current tab */}
        <div
          className={cx(
            'pointer-events-auto relative h-[62px] min-w-0 overflow-hidden rounded-full',
            glass,
            morph,
            composing ? 'grow-0 basis-[62px]' : 'grow basis-0',
          )}
        >
          <div className={cx('absolute inset-1 flex', layer(!composing, true))}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                tabIndex={composing ? -1 : 0}
                onClick={() => onSelect(tab.id)}
                aria-current={tab.id === active ? 'page' : undefined}
                className={cx(
                  'flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-full text-[10px] font-semibold',
                  tab.id === active ? 'bg-surface-muted text-brand' : 'text-ink',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            tabIndex={composing ? 0 : -1}
            onClick={onClose}
            aria-label={`Back to ${current.label}`}
            className={cx('absolute inset-0 flex items-center justify-center text-brand', layer(composing, true))}
          >
            {current.icon}
          </button>
        </div>

        {/* + button, growing into the field */}
        <div
          className={cx(
            'pointer-events-auto relative min-w-0 overflow-hidden rounded-[31px]',
            glass,
            morph,
            composing ? 'grow basis-0' : 'grow-0 basis-[62px]',
          )}
        >
          {/* Attached photos, inside the field above the text */}
          <div
            className={cx(
              'grid transition-[grid-template-rows] duration-300',
              ease,
              composing && attached.length > 0 ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex gap-2 overflow-x-auto px-2.5 pt-2.5 [scrollbar-width:none]">
                {attached.map((photo) => (
                  <div key={photo.id} className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
                    <img src={photo.src} alt={photo.alt} className="size-full object-cover" />
                    <button
                      type="button"
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={() => toggle(photo)}
                      aria-label="Remove photo"
                      className="absolute right-0.5 top-0.5 inline-flex size-5 items-center justify-center rounded-full bg-scrim text-caption leading-none text-on-brand"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form
            className={cx('flex h-[60px] items-center gap-1 px-2', layer(composing, true))}
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            <label className="relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-muted active:opacity-60">
              <SmallCameraIcon />
              <input
                type="file"
                accept="image/*"
                multiple
                tabIndex={composing ? 0 : -1}
                className="sr-only"
                aria-label="Add photos"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? [])
                  const added = files.map((file) => {
                    const src = URL.createObjectURL(file)
                    return { id: src, src, alt: file.name }
                  })
                  setAttached((list) => [...list, ...added])
                  event.target.value = ''
                }}
              />
            </label>
            {/* Always mounted so + can focus it during the tap */}
            <input
              ref={(element) => {
                inputRef.current = element
                fieldRef?.(element)
              }}
              value={text}
              tabIndex={composing ? 0 : -1}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && onClose()}
              placeholder={placeholder}
              enterKeyHint="send"
              // 17px keeps iOS Safari from zooming in on focus
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
            />
            <button
              type="submit"
              disabled={!canSend}
              tabIndex={composing ? 0 : -1}
              onPointerDown={(event) => event.preventDefault()}
              aria-label="Save"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition disabled:bg-surface-muted disabled:text-ink-muted"
            >
              <ArrowUpIcon />
            </button>
          </form>

          <button
            type="button"
            tabIndex={composing ? -1 : 0}
            onClick={onOpen}
            aria-label="Capture"
            className={cx('absolute inset-0 flex items-center justify-center text-brand', layer(!composing))}
          >
            <PlusIcon />
          </button>
        </div>
      </nav>
    </div>
  )
}
