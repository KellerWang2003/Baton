import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clearFolderOpening, pendingFolderOpening, playFolderEnter } from '../app/folderTransition'
import { toLocal } from '../app/localPoint'
import { markTried } from '../app/tried'
import { filterGlow } from '../ui/filterColor'
import { goBack, navigate } from '../app/navigate'
import { setState, useArchive, useStatus, useStore } from '../app/store'
import { deleteCapture } from '../app/supabase'
import { cloudFilters, emptyCloudPrompt, newYorkCloud } from '../data/archiveCloud'
import { archiveDetail, archiveFolders, olderArchive } from '../data/stages'
import { CameraBubble, FilterOrb, FolderSideTab, ListRow, ListSection, PhotoCloud, PhotoMenu, placePhotoMenu, PlusIcon, Screen, VisibilityBadge } from '../ui'
import type { CloudCategory, CloudPhoto, CloudView, PhotoMenuLayout } from '../ui'

// Pushed detail page for a single city folder in Archive, opened by tapping
// the open folder. A city with a photo cloud (LA, Figma ARCHIVE_detail
// default) shows every photo from its archive as circles, with the folder's
// tab on its side at the left edge to go back and the tricolor glass orb at
// the bottom to filter them (Feeling, People, Places). Other cities still show the
// list: a private archive while she lives there, a legacy once she has left.
// Pressing and holding a photo (or right-clicking it) lifts it into an
// iOS-style context menu with Open and Delete; Delete removes its capture
// from Supabase.
export function ArchiveDetail() {
  const { selectedFolder, cloudView, cloudFilter, addedPhotos, arrivingPhoto } = useStore()
  const status = useStatus()
  const folders = archiveFolders(status)
  // Opened straight from the debug panel or arrow keys, it shows LA (the story)
  const folder = folders.find((item) => item.id === (selectedFolder ?? 'la')) ?? folders[0]
  // LA also shows the photos added from the reflection page (Real-life)
  const { clouds } = useArchive()
  // New York falls back to its placeholder cloud until it has captures
  const base = clouds[folder.id] ?? (folder.id === 'ny' && status !== 'moving' ? newYorkCloud[status] : undefined)
  const cloud = base && folder.id === 'la' ? [...base, ...addedPhotos] : base
  // Back from an opened photo, the cloud is where she left it: same spot,
  // zoom and filter. Read once; opened any other way it starts fresh.
  const [resume] = useState(() => cloudView)
  const [filter, setFilter] = useState<CloudCategory | null>(() => (cloudView ? cloudFilter : null))
  useEffect(() => {
    setState({ cloudView: null, cloudFilter: null })
  }, [])
  // Opened by tapping the folder on Archive: the cloud zooms out to meet the
  // dive (folderTransition), played before the first paint
  const [opening] = useState(pendingFolderOpening)
  // Real-life: a photo just added from the reflection page, flying in from
  // where its orb was. Read once
  const [arriving] = useState(() => arrivingPhoto)
  const pageRef = useRef<HTMLDivElement>(null)
  // The photo held down for its context menu
  const [menu, setMenu] = useState<{ photo: CloudPhoto; rect: DOMRect; view: CloudView; layout: PhotoMenuLayout } | null>(null)
  useLayoutEffect(() => {
    clearFolderOpening()
    if (opening && base && pageRef.current) return playFolderEnter(pageRef.current)
  }, [opening, base])

  // The orb shrinks from where it was into its new spot in the cloud: a copy
  // flies there while the real circle waits hidden, then the copy is gone
  useEffect(() => {
    if (!arriving) return
    setState({ arrivingPhoto: null })
    const page = pageRef.current
    const target = page ? [...page.querySelectorAll('img')].find((image) => image.getAttribute('src') === arriving.src) : undefined
    if (!page || !target) return
    target.style.visibility = 'hidden'
    const flyer = document.createElement('div')
    const picture = document.createElement('img')
    picture.src = arriving.src
    Object.assign(picture.style, { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '9999px' })
    flyer.appendChild(picture)
    // Its color glowing in from the edge, as on the orb it was, fading as it lands
    const glow = document.createElement('div')
    Object.assign(glow.style, { position: 'absolute', inset: '0', borderRadius: '9999px', background: filterGlow(arriving.color) })
    flyer.appendChild(glow)
    Object.assign(flyer.style, { position: 'absolute', zIndex: '30', borderRadius: '9999px', pointerEvents: 'none' })
    page.appendChild(flyer)
    let animation: Animation | null = null
    // A frame for the cloud to settle where it starts
    const frame = requestAnimationFrame(() => {
      const local = toLocal(page)
      const from = local({ x: arriving.x, y: arriving.y })
      const fromEnd = local({ x: arriving.x + arriving.size, y: arriving.y + arriving.size })
      const box = target.getBoundingClientRect()
      const to = local({ x: box.left, y: box.top })
      const toEnd = local({ x: box.right, y: box.bottom })
      const timing = { duration: 1100, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' } as const
      animation = flyer.animate(
        [
          { left: `${from.x}px`, top: `${from.y}px`, width: `${fromEnd.x - from.x}px`, height: `${fromEnd.y - from.y}px` },
          { left: `${to.x}px`, top: `${to.y}px`, width: `${toEnd.x - to.x}px`, height: `${toEnd.y - to.y}px` },
        ],
        timing,
      )
      glow.animate([{ opacity: 1 }, { opacity: 0 }], timing)
      animation.finished.then(
        () => {
          target.style.visibility = ''
          flyer.remove()
        },
        () => {},
      )
    })
    return () => {
      cancelAnimationFrame(frame)
      animation?.cancel()
      flyer.remove()
      target.style.visibility = ''
    }
  }, [arriving])

  // Every photo opens, including imported photos without a written reflection.
  function openPhoto(photo: CloudPhoto, rect: DOMRect, view: CloudView) {
    setState({
      selectedPhoto: photo.src,
      selectedPhotoFrom: { x: rect.left, y: rect.top, size: rect.width },
      cloudView: view,
      cloudFilter: filter,
    })
    navigate('archive-selected')
  }

  if (cloud) {
    return (
      // Clipped only sideways: the cloud runs up under the status bar
      <div ref={pageRef} className="relative h-full overflow-x-clip bg-baton-paper">
        <PhotoCloud
          photos={cloud}
          focus={filter}
          resume={resume}
          // No pop-in while a new photo is landing, so the landing is the motion
          pop={!opening && !arriving}
          onSelect={openPhoto}
          onLongPress={(photo, rect, view) => {
            if (pageRef.current) setMenu({ photo, rect, view, layout: placePhotoMenu(rect, pageRef.current, 2) })
          }}
          hidden={menu?.photo}
        />
        {/* Nothing here yet: the prompt, and a + that opens Today's camera
            out of itself (Keller, Oct 21) */}
        {cloud.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex animate-fade-in flex-col items-center justify-center gap-5">
            <p className="text-center font-display text-callout whitespace-pre-line text-ink-faint">{emptyCloudPrompt(folder.city)}</p>
            <button
              type="button"
              aria-label="Capture a moment"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                setState({ camera: { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, size: rect.width }, composing: false })
              }}
              className="pointer-events-auto flex size-14 items-center justify-center rounded-full bg-brand text-on-brand shadow-float transition active:opacity-80"
            >
              <PlusIcon />
            </button>
          </div>
        )}
        <FolderSideTab folder={folder} onClick={() => goBack()} className="absolute top-6 -left-[7px]" />
        {cloud.length > 0 && <FilterOrb filters={cloudFilters} value={filter} onChange={(next) => { setFilter(next); if (next) markTried('archive-filter') }} />}
        {menu && (
          <PhotoMenu
            key={`${menu.photo.src}|${menu.photo.x}|${menu.photo.y}`}
            src={menu.photo.src}
            layout={menu.layout}
            onOpen={() => openPhoto(menu.photo, menu.rect, menu.view)}
            onDelete={() => void deleteCapture(folder.id, menu.photo)}
            onClose={() => setMenu(null)}
          />
        )}
        {cloud.length === 0 && <CameraBubble />}
      </div>
    )
  }

  const content = archiveDetail[folder.id]?.[status] ?? olderArchive

  return (
    <Screen
      title={folder.city}
      eyebrow={folder.dates}
      onBack
    >
      <div className="flex flex-col gap-6 pt-2">
        <p className="px-1 text-subhead text-ink-muted">{content.summary}</p>
        {content.sections.map((section) => (
          <ListSection key={section.header} header={section.header}>
            {section.entries.map((entry) => (
              <ListRow
                key={entry.title}
                title={entry.title}
                subtitle={entry.detail}
                leading={<div aria-hidden className="size-11 shrink-0 rounded-tile bg-placeholder" />}
                trailing={entry.visibility && <VisibilityBadge visibility={entry.visibility} />}
              />
            ))}
          </ListSection>
        ))}
      </div>
    </Screen>
  )
}
