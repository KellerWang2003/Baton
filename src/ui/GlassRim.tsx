import { cx } from './cx'

// The rim around a glass circle (Figma ARCHIVE_selected 236:234): the Archive's
// opened photos and Today's prompt. A thin band of glass, light gray where it
// meets the color inside and fading to white outward, then a faint solid gray
// hairline. It holds still, centered in its parent, while the glass under it
// breathes, and it's the same width on any size of circle (Figma's 342pt
// circle around 329pt of color).
const WIDTH = 6.5

export function GlassRim({ size, className }: { size: number; className?: string }) {
  // In points from the middle, so the band keeps its width at any size
  const at = (offset: number) => `${size / 2 - WIDTH + offset}px`
  return (
    <span
      aria-hidden
      data-html2canvas-ignore
      className={cx('pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border', className)}
      style={{
        width: size,
        height: size,
        // Solid, not see-through, and the gradient runs under the border too,
        // so what's under the glass never shows through the hairline
        borderColor: 'color-mix(in srgb, var(--color-ink) 14%, var(--color-surface))',
        backgroundImage: `radial-gradient(circle closest-side, transparent ${at(-0.5)}, color-mix(in srgb, var(--color-ink) 16%, var(--color-surface)) ${at(0)}, color-mix(in srgb, var(--color-ink) 7%, var(--color-surface)) ${at(2.9)}, var(--color-surface) ${at(5.5)})`,
        backgroundOrigin: 'border-box',
      }}
    />
  )
}
