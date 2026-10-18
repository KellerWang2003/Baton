import { cx } from './cx'

export type InlinePhotoItem = {
  alt: string
  // Missing src shows a placeholder tile
  src?: string
}

type InlinePhotoProps = {
  photos: InlinePhotoItem[]
  // hidden keeps its space in the line (for text typing in), pop animates it in
  appear?: 'shown' | 'hidden' | 'pop'
  className?: string
}

// A tiny photo set into a line of large text (the Archive lifestyle summary).
// One photo sits flat; a second one overlaps it, nudged right and tilted,
// like two prints dropped on a table.
export function InlinePhoto({ photos, appear = 'shown', className }: InlinePhotoProps) {
  const [first, second] = photos
  if (!first) return null

  return (
    <span
      className={cx(
        'relative ml-[0.05em] inline-block size-[0.95em] align-[-0.16em]',
        // The tilted second photo sticks out to the right
        second ? 'mr-[0.5em]' : 'mr-[0.18em]',
        appear === 'hidden' && 'opacity-0',
        appear === 'pop' && 'animate-photo-pop',
        className,
      )}
    >
      <Tile photo={first} />
      {second && <Tile
          photo={second}
          className={cx('translate-x-[0.3em] -translate-y-[0.05em] rotate-[7deg]', appear === 'pop' && 'animate-photo-drop')}
        />}
    </span>
  )
}

function Tile({ photo, className }: { photo: InlinePhotoItem; className?: string }) {
  const tile = 'absolute inset-0 size-full rounded-inline border-[0.5px] border-baton-cream'
  return photo.src ? (
    <img src={photo.src} alt={photo.alt} draggable={false} className={cx(tile, 'object-cover', className)} />
  ) : (
    <span role="img" aria-label={photo.alt} className={cx(tile, 'bg-placeholder', className)} />
  )
}
