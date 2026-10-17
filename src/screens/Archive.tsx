import { pages } from '../data/pages'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Archive() {
  return (
    <MainLayout title={pages.archive.title} activeTab="archive">
      <PagePurpose>{pages.archive.purpose}</PagePurpose>
    </MainLayout>
  )
}
