import { goBack } from '../app/navigate'
import { useStatus, useStore } from '../app/store'
import { pages } from '../data/pages'
import { archiveDetail, archiveFolders, olderArchive } from '../data/stages'
import { ListRow, ListSection, Screen, VisibilityBadge } from '../ui'

const { title: archiveTitle } = pages.archive

// Pushed detail page for a single city folder in Archive. What's inside
// depends on her stage: a private archive while she lives there, a legacy
// (public and private pieces, notes on them) once she has left.
export function ArchiveDetail() {
  const { selectedFolder } = useStore()
  const status = useStatus()
  const folders = archiveFolders(status)
  const folder = folders.find((item) => item.id === selectedFolder) ?? folders[0]
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
