import { navigate } from '../app/navigate'
import { setState, useStatus } from '../app/store'
import { archiveFolders } from '../data/stages'
import { FolderStack } from '../ui'
import { MainLayout } from './MainLayout'


// City folders. Her stage decides which city is open: LA while Moving,
// New York after the move (LA becomes her legacy).
export function Archive() {
  const status = useStatus()

  return (
    <MainLayout bleed>
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
