import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from './cx'
import { ArrowUpIcon, MicIcon, PlusIcon } from './icons'
import { RecentPhotos } from './RecentPhotos'
import type { PhotoItem } from './RecentPhotos'
import { useDictation } from './useDictation'
import { LiquidGlassLayer } from './LiquidGlassLayer'

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
  // Opens the field without raising the keyboard; tapping the field raises it
  onOpen: () => void
  onClose: () => void
  // photos are the ids of the selected photos
  onSubmit: (text: string, photos: string[]) => void
  // Shown as a row above the field, led by a camera tile; tap to select
  recentPhotos?: PhotoItem[]
  fieldRef?: (element: HTMLInputElement | null) => void
  placeholder?: string
  onSelect: (id: string) => void
  // Real Liquid Glass (liquid-glass-react) behind the capsule and +, instead of the frosted white
  liquidGlass?: boolean
}

// Translucent white over a blur, with only a light shadow (Figma nav, LA28 Palms 258:1523).
// Debug > Liquid glass swaps it for liquid-glass-react (LiquidGlassLayer)
const glass = 'glass'
// Icons in the bar are drawn a little smaller than the 24px line icons
const iconSize = '[&_svg]:size-5'
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

// iOS-style floating tab bar, sized to its content and centered. The tabs sit
// in one capsule and + is its own round button. Tapping + morphs it into a wide input while the tabs collapse
// into one round button showing the current tab (tap it to go back). A row of
// recent photos rises above it to select from, led by a camera tile.
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
  liquidGlass = false,
}: TabBarProps) {
  // The draft stays if she closes without sending, like Messages
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  // Photos taken from the camera tile join the front of the row
  const [taken, setTaken] = useState<PhotoItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]
  // What was typed before she started talking; speech is added after it
  const typed = useRef('')
  const dictation = useDictation((spoken) => setText(typed.current ? `${typed.current} ${spoken}` : spoken))

  // Drop the keyboard whenever the field closes, however it was closed
  useEffect(() => {
    if (!composing) inputRef.current?.blur()
  }, [composing])

  // Stop listening when the field closes
  const stopListening = dictation?.stop
  useEffect(() => {
    if (!composing) stopListening?.()
  }, [composing, stopListening])

  const toggle = (photo: PhotoItem) =>
    setSelected((ids) => (ids.includes(photo.id) ? ids.filter((id) => id !== photo.id) : [...ids, photo.id]))

  const capture = (files: File[]) => {
    const added = files.map((file) => {
      const src = URL.createObjectURL(file)
      return { id: src, src, alt: file.name }
    })
    setTaken((list) => [...added, ...list])
    setSelected((ids) => [...ids, ...added.map((photo) => photo.id)])
  }

  const canSend = text.trim().length > 0 || selected.length > 0
  const send = () => {
    if (!canSend) return
    dictation?.stop()
    onSubmit(text.trim(), selected)
    setText('')
    setSelected([])
    onClose()
  }

  return (
    <div className="pointer-events-none flex flex-col">
      {/* Takes no room while closed, so nothing invisible covers the page */}
      <div className={cx('grid transition-[grid-template-rows] duration-500', ease, composing ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="min-h-0 overflow-hidden">
          <RecentPhotos
            photos={[...taken, ...recentPhotos]}
            selected={selected}
            onToggle={toggle}
            onCapture={capture}
            open={composing}
          />
        </div>
      </div>

      <nav className="flex items-center justify-center gap-1.5 px-4">
        {/* Tabs, collapsing into one round button for the current tab */}
        <div
          className={cx(
            'pointer-events-auto relative h-[61px] min-w-0 shrink-0 overflow-hidden rounded-full',
            glass,
            morph,
            composing ? 'basis-[61px]' : 'basis-[207px]',
          )}
        >
          {liquidGlass && <LiquidGlassLayer />}
          <div className={cx('absolute inset-x-1.5 inset-y-1 flex', layer(!composing, true))}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                tabIndex={composing ? -1 : 0}
                onClick={() => onSelect(tab.id)}
                aria-current={tab.id === active ? 'page' : undefined}
                className={cx(
                  'flex h-full w-[65px] shrink-0 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-[40px] text-[10px] font-medium leading-[1.3] tracking-[-0.011em] transition-colors',
                  iconSize,
                  tab.id === active ? 'glass-pill text-baton-blue' : 'text-tab-idle',
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
            className={cx('absolute inset-0 flex items-center justify-center text-baton-blue', iconSize, layer(composing, true))}
          >
            {current.icon}
          </button>
        </div>

        {/* + button, growing into the field */}
        <div
          className={cx(
            'pointer-events-auto relative h-[58px] min-w-0 overflow-hidden rounded-full',
            glass,
            morph,
            composing ? 'grow basis-0' : 'grow-0 basis-[58px]',
          )}
        >
          {liquidGlass && <LiquidGlassLayer />}
          <form
            className={cx('flex h-full items-center gap-1 pl-5 pr-2', layer(composing, true))}
            onSubmit={(event) => {
              event.preventDefault()
              send()
            }}
          >
            {/* Always mounted so the morph can fade it in */}
            <input
              ref={(element) => {
                inputRef.current = element
                fieldRef?.(element)
              }}
              value={text}
              tabIndex={composing ? 0 : -1}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => event.key === 'Escape' && onClose()}
              placeholder={dictation?.listening ? 'Listening…' : placeholder}
              enterKeyHint="send"
              // 17px keeps iOS Safari from zooming in on focus
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
            />
            {/* Voice input. Without speech support in the browser it opens the
                keyboard, which has its own dictation key */}
            <button
              type="button"
              tabIndex={composing ? 0 : -1}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                if (!dictation) return inputRef.current?.focus()
                if (!dictation.listening) typed.current = text.trim()
                dictation.toggle()
              }}
              aria-label={dictation?.listening ? 'Stop voice input' : 'Voice input'}
              aria-pressed={dictation?.listening ?? false}
              className={cx(
                'relative inline-flex size-10 shrink-0 items-center justify-center rounded-full transition',
                dictation?.listening ? 'bg-baton-pink text-baton-navy' : 'text-ink-muted active:bg-surface-muted',
              )}
            >
              {dictation?.listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-baton-pink/60" />}
              <span className="relative">
                <MicIcon />
              </span>
            </button>
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
            className={cx('absolute inset-0 flex items-center justify-center text-tab-idle [&_svg]:size-6 [&_svg]:stroke-[1.6]', layer(!composing))}
          >
            <PlusIcon />
          </button>
        </div>
      </nav>
    </div>
  )
}
