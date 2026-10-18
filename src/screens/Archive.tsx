import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import { archiveFolders, archiveSummary } from '../data/stages'
import { BatonMark, FolderStack, InlinePhoto } from '../ui'
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
        renderActive={(folder, mutedClass) => {
          const summary = archiveSummary(folder.id, status)
          if (!summary) return null
          return (
            <div className="pt-7">
              <p className="font-display text-summary font-normal">
                {summary.parts.map((part, index) =>
                  typeof part === 'string' ? (
                    <span key={index}>{part} </span>
                  ) : (
                    <InlinePhoto key={index} photos={part} />
                  ),
                )}
              </p>
              <p className={`mt-6 flex items-center gap-2 text-subhead ${mutedClass}`}>
                <BatonMark className="size-4! text-current!" />
                {summary.note}
              </p>
            </div>
          )
        }}
      />
    </MainLayout>
  )
}
