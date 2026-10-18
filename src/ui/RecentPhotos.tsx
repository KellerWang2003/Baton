import { cx } from './cx'
import { CheckCircle } from './CheckCircle'
import { CameraIcon } from './icons'

export type PhotoItem = {
  id: string
  alt: string
  // Without one the tile is a gray placeholder
  src?: string
}

type RecentPhotosProps = {
  photos: PhotoItem[]
  selected: string[]
  onToggle: (photo: PhotoItem) => void
  // A photo just taken with the camera tile
  onCapture: (files: File[]) => void
  // Slides the row in with a small stagger, like the photo shelf in Messages
  open: boolean
}

// Sized so three tiles and the edge of a fourth show, hinting the row scrolls
const tile =
  'relative aspect-square shrink-0 basis-[calc((100%-36px)/3)] snap-start overflow-hidden rounded-tile transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95'

// Horizontal row of recent camera roll photos, led by a camera tile. Tap a
// photo to select it, tap again to unselect.
export function RecentPhotos({ photos, selected, onToggle, onCapture, open }: RecentPhotosProps) {
  const shown = (index: number) => ({
    style: { transitionDelay: open ? `${120 + index * 30}ms` : '0ms' },
    className: open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-90 opacity-0 duration-200',
  })

  return (
    <div
      aria-hidden={!open}
      className={cx(
        'flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-5 pt-2 [scrollbar-width:none]',
        open ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <label
        style={shown(0).style}
        className={cx(tile, shown(0).className, 'flex cursor-pointer items-center justify-center bg-surface text-ink shadow-card')}
      >
        <CameraIcon />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          tabIndex={open ? 0 : -1}
          className="sr-only"
          aria-label="Take a photo"
          onChange={(event) => {
            onCapture(Array.from(event.target.files ?? []))
            event.target.value = ''
          }}
        />
      </label>

      {photos.map((photo, index) => {
        const isSelected = selected.includes(photo.id)
        const { style, className } = shown(index + 1)
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
            style={style}
            className={cx(tile, className, 'bg-placeholder')}
          >
            {photo.src && <img src={photo.src} alt="" draggable={false} className="size-full object-cover" />}
            <span
              className={cx(
                'absolute inset-0 rounded-tile ring-[3px] ring-inset ring-brand transition-opacity',
                isSelected ? 'opacity-100' : 'opacity-0',
              )}
            />
            <CheckCircle
              checked={isSelected}
              className={cx('absolute bottom-2 right-2', isSelected ? 'border-on-brand' : 'border-surface')}
            />
          </button>
        )
      })}
    </div>
  )
}
