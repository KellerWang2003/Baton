import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import { archiveFolders, archiveSummary } from '../data/stages'
import { BatonMark, FolderStack, TypedSummary } from '../ui'
import { MainLayout } from './MainLayout'


// City folders. Her stage decides which city is open: LA while Moving,
// New York after the move (LA becomes her legacy). The open folder shows a
// one-sentence lifestyle summary of that city with photos from her archive.
export function Archive() {
  const status = useStatus()

  return (
    <MainLayout bleed>
      <FolderStack
        className="bg-baton-paper"
        folders={archiveFolders(status)}
        onSelect={(id) => {
          setState({ selectedFolder: id })
          navigate('archive-detail')
        }}
        renderActive={(folder, mutedClass, isActive) => {
          const summary = archiveSummary(folder.id, status)
          if (!summary) return null
          // Remounts each time the folder opens, so the sentence types out again
          return (
            <TypedSummary
              key={isActive ? 'open' : 'closed'}
              play={isActive}
              parts={summary.parts}
              className="pt-7 font-display text-summary font-normal"
            >
              <p className={`mt-6 flex items-center gap-2 text-subhead ${mutedClass}`}>
                <BatonMark className="size-4! text-current!" />
                {summary.note}
              </p>
            </TypedSummary>
          )
        }}
      />
    </MainLayout>
  )
}
