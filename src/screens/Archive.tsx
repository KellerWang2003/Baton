import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import { archiveFolders, archiveSummary } from '../data/stages'
import { FolderStack, TypedSummary } from '../ui'
import { MainLayout } from './MainLayout'


// City folders with LA in focus at first (Figma ARCHIVE_default). Scrolling
// vertically brings each city into focus, where it expands. Each folder shows
// a one-sentence lifestyle summary of that city with photos from her archive.
export function Archive() {
  const status = useStatus()

  return (
    <MainLayout bleed>
      {/* Remounts on a stage change so LA is in focus again */}
      <FolderStack
        key={status}
        className="bg-baton-paper"
        folders={archiveFolders()}
        initialId="la"
        onSelect={(id) => {
          setState({ selectedFolder: id })
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
