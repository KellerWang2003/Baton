import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import { pages } from '../data/pages'
import { archiveFolders } from '../data/stages'
import { FolderStack } from '../ui'
import { MainLayout } from './MainLayout'

const { title } = pages.archive

// City folders. Her stage decides which city is open: LA while Moving,
// New York after the move (LA becomes her legacy).
export function Archive() {
  const status = useStatus()

  return (
    <MainLayout title={title} bleed>
      <FolderStack
        folders={archiveFolders(status)}
        onSelect={(id) => {
          setState({ selectedFolder: id })
          navigate('archive-detail')
        }}
      />
    </MainLayout>
  )
}
