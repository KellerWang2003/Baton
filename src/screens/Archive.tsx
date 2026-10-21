import { useRef } from 'react'
import { playFolderExit } from '../app/folderTransition'
import { navigate } from '../app/navigate'
import { setState, useStatus, useStore } from '../app/store'
import { archiveFolders, archiveSummary } from '../data/stages'
import { FolderStack, TypedSummary } from '../ui'
import { ScrubberWall } from './ArchiveIdeas'
import { MainLayout } from './MainLayout'

// City folders with LA in focus at first (Figma ARCHIVE_default). Scrolling
// vertically brings each city into focus, where it expands. Each folder shows
// a one-sentence lifestyle summary of that city with photos from her archive.
// Tapping the open folder dives into it on the way to its city page
// (folderTransition).
export function Archive() {
  const status = useStatus()
  const opening = useRef(false)
  const { archiveWall } = useStore()

  if (archiveWall) {
    return (
      <MainLayout bleed>
        <ScrubberWall fill />
      </MainLayout>
    )
  }

  return (
    <MainLayout bleed>
      {/* Remounts on a stage change so her current city is in focus again */}
      <FolderStack
        key={status}
        className="bg-baton-paper"
        folders={archiveFolders(status)}
        initialId={status === 'moving' ? 'la' : 'ny'}
        onSelect={async (id) => {
          if (opening.current) return
          opening.current = true
          setState({ selectedFolder: id })
          await playFolderExit(id)
          navigate('archive-detail')
        }}
        renderActive={(folder, isActive) => {
          const summary = archiveSummary(folder.id, status)
          if (!summary) return null
          // Remounts each time the folder opens, so the sentence plays again
          return (
            <TypedSummary
              key={isActive ? 'open' : 'closed'}
              play={isActive}
              parts={summary.parts}
              className="pt-7 font-display text-summary font-normal"
            />
          )
        }}
      />
    </MainLayout>
  )
}
