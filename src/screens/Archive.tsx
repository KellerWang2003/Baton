import { setState } from '../app/store'
import { pages } from '../data/pages'
import { FolderStack } from '../ui'
import { MainLayout } from './MainLayout'

const { title, folders } = pages.archive

export function Archive() {
  return (
    <MainLayout title={title} bleed>
      <FolderStack
        folders={folders}
        onSelect={(id) => setState({ selectedFolder: id })}
      />
    </MainLayout>
  )
}
