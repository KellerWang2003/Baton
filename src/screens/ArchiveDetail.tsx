import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { clearFolderOpening, pendingFolderOpening, playFolderEnter } from '../app/folderTransition'
import { goBack, navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { archiveMoments } from '../data/archiveMoments'
import { archiveClouds, cloudFilters } from '../data/archiveCloud'
import { pages } from '../data/pages'
import { archiveDetail, archiveFolders, olderArchive } from '../data/stages'
import { FilterOrb, FolderSideTab, ListRow, ListSection, PhotoCloud, Screen, VisibilityBadge } from '../ui'
import type { CloudCategory } from '../ui'

const { title: archiveTitle } = pages.archive

// Pushed detail page for a single city folder in Archive, opened by tapping
// the open folder. A city with a photo cloud (LA, Figma ARCHIVE_detail
// default) shows every photo from its archive as circles, with the folder's
// tab on its side at the left edge to go back and the tricolor glass orb at
// the bottom to filter them (Feeling, People, Places). Other cities still show the
// list: a private archive while she lives there, a legacy once she has left.
export function ArchiveDetail() {
  const { selectedFolder, cloudView, cloudFilter } = useStore()
  const status = useStatus()
  const folders = archiveFolders()
  // Opened straight from the debug panel or arrow keys, it shows LA (the story)
  const folder = folders.find((item) => item.id === (selectedFolder ?? 'la')) ?? folders[0]
  const cloud = archiveClouds[folder.id]
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
  const pageRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    clearFolderOpening()
    if (opening && cloud && pageRef.current) return playFolderEnter(pageRef.current)
  }, [opening, cloud])

  if (cloud) {
    return (
      // Clipped only sideways: the cloud runs up under the status bar
      <div ref={pageRef} className="relative h-full overflow-x-clip bg-baton-paper">
        <PhotoCloud
          photos={cloud}
          focus={filter}
          // Photos with a moment behind them open it (Figma ARCHIVE_selected)
          resume={resume}
          pop={!opening}
          onSelect={(photo, rect, view) => {
            if (!archiveMoments[photo.src]) return
            setState({
              selectedPhoto: photo.src,
              selectedPhotoFrom: { x: rect.left, y: rect.top, size: rect.width },
              cloudView: view,
              cloudFilter: filter,
            })
            navigate('archive-selected')
          }}
        />
        <FolderSideTab folder={folder} onClick={() => goBack('archive')} className="absolute top-6 -left-[7px]" />
        <FilterOrb filters={cloudFilters} value={filter} onChange={setFilter} />
      </div>
    )
  }

  const content = archiveDetail[folder.id]?.[status] ?? olderArchive

  return (
    <Screen
      title={folder.city}
      eyebrow={folder.dates}
      backLabel={archiveTitle}
      onBack={() => goBack('archive')}
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
