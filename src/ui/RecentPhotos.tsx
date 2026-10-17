import { cx } from './cx'
import { CheckCircle } from './CheckCircle'

export type PhotoItem = {
  id: string
  src: string
  alt: string
}

type RecentPhotosProps = {
  photos: PhotoItem[]
  selected: string[]
  onToggle: (photo: PhotoItem) => void
  // Slides the row in with a small stagger, like the photo shelf in Messages
  open: boolean
}

// Horizontal row of recent camera roll thumbnails. Tap one to attach it, tap
// again to take it back.
export function RecentPhotos({ photos, selected, onToggle, open }: RecentPhotosProps) {
  return (
    <div
      aria-hidden={!open}
      className={cx('flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-3 pt-2 [scrollbar-width:none]', open ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      {photos.map((photo, index) => {
        const isSelected = selected.includes(photo.id)
        return (
          <button
            key={photo.id}
            type="button"
            tabIndex={open ? 0 : -1}
            // Keep focus (and the keyboard) in the text field
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => onToggle(photo)}
            aria-pressed={isSelected}
            aria-label={photo.alt}
            style={{ transitionDelay: open ? `${120 + index * 30}ms` : '0ms' }}
            className={cx(
              'relative size-[76px] shrink-0 snap-start overflow-hidden rounded-tile bg-surface-muted shadow-card transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95',
              open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-90 opacity-0 duration-200',
            )}
          >
            <img src={photo.src} alt="" draggable={false} className="size-full object-cover" />
            <span
              className={cx(
                'absolute inset-0 rounded-tile ring-[3px] ring-inset ring-brand transition-opacity',
                isSelected ? 'opacity-100' : 'opacity-0',
              )}
            />
            <CheckCircle
              checked
              className={cx(
                'absolute bottom-1.5 right-1.5 border-on-brand transition duration-200',
                isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
              )}
            />
          </button>
        )
      })}
    </div>
  )
}
