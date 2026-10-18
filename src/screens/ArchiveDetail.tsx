import { goBack } from '../app/navigate'
import { useStore } from '../app/store'
import { pages } from '../data/pages'
import { Screen } from '../ui'

const { title: archiveTitle, folders } = pages.archive

// Pushed detail page for a single city folder in Archive.
export function ArchiveDetail() {
  const { selectedFolder } = useStore()
  const folder = folders.find((item) => item.id === selectedFolder) ?? folders[0]

  return (
    <Screen
      title={folder.city}
      eyebrow={folder.dates}
      backLabel={archiveTitle}
      onBack={() => goBack('archive')}
    >
      <div />
    </Screen>
  )
}
