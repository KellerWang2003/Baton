import { cx } from './cx'

export type ArchiveFolder = {
  id: string
  city: string
  dates: string
  tabAlign: 'left' | 'center' | 'right'
  dateAlign: 'left' | 'right'
  active?: boolean
  tone: 'active' | 'mid' | 'light'
}

type FolderStackProps = {
  folders: ArchiveFolder[]
  onSelect?: (id: string) => void
  className?: string
}

const toneStyles: Record<
  ArchiveFolder['tone'],
  { fill: string; fillText: string; title: string; dates: string }
> = {
  active: {
    fill: 'bg-brand',
    fillText: 'text-brand',
    title: 'text-on-brand',
    dates: 'text-on-brand/75',
  },
  mid: {
    fill: 'bg-placeholder',
    fillText: 'text-placeholder',
    title: 'text-ink',
    dates: 'text-ink/65',
  },
  light: {
    fill: 'bg-surface-muted',
    fillText: 'text-surface-muted',
    title: 'text-accent',
    dates: 'text-ink-muted',
  },
}

const tabPositionStyles: Record<ArchiveFolder['tabAlign'], string> = {
  left: 'ml-6 mr-auto',
  center: 'mx-auto',
  right: 'ml-auto mr-6',
}

// Stacked city folders for the Archive screen. The active folder expands to take
// the primary height, while past legacy folders tuck compactly at the bottom
// like passes in Apple Wallet.
export function FolderStack({ folders, onSelect, className }: FolderStackProps) {
  return (
    <div className={cx('isolate flex flex-1 flex-col pt-3', className)}>
      {folders.map((folder, index) => {
        const isLast = index === folders.length - 1
        const styles = toneStyles[folder.tone]

        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelect?.(folder.id)}
            style={{ zIndex: index + 1 }}
            className={cx(
              'group relative flex w-full flex-col text-left transition-transform duration-200 ease-out active:scale-[0.99]',
              index > 0 && '-mt-13 drop-shadow-[0_-6px_16px_rgb(0_0_0/0.08)]',
              folder.active ? 'flex-1 min-h-[280px]' : isLast ? 'h-[230px] shrink-0' : 'h-[190px] shrink-0',
            )}
          >
            {/* Protruding folder tab with sloped sides and concave shoulder fillets */}
            <div className={cx('relative -mb-px flex h-[52px] items-stretch', tabPositionStyles[folder.tabAlign])}>
              <svg
                viewBox="0 0 28 52"
                aria-hidden="true"
                className={cx('h-[52px] w-7 shrink-0 fill-current', styles.fillText)}
              >
                <path d="M 0 52 C 10 52, 12 46, 14 36 L 17 16 C 18.5 6, 22 0, 28 0 L 28 52 Z" />
              </svg>
              <div
                className={cx(
                  '-mx-px flex min-w-[116px] items-center justify-center px-3 pt-1',
                  styles.fill,
                )}
              >
                <span className={cx('font-display text-large-title font-medium tracking-tight', styles.title)}>
                  {folder.city}
                </span>
              </div>
              <svg
                viewBox="0 0 28 52"
                aria-hidden="true"
                className={cx('h-[52px] w-7 shrink-0 fill-current', styles.fillText)}
              >
                <path d="M 28 52 C 18 52, 16 46, 14 36 L 11 16 C 9.5 6, 6 0, 0 0 L 0 52 Z" />
              </svg>
            </div>

            {/* Folder body */}
            <div
              className={cx(
                'flex flex-1 flex-col rounded-t-card px-7 pt-5',
                styles.fill,
              )}
            >
              <span
                className={cx(
                  'font-body text-title-3 font-normal tracking-tight',
                  styles.dates,
                  folder.dateAlign === 'right' ? 'self-end text-right' : 'self-start text-left',
                )}
              >
                {folder.dates}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
