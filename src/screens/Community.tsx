import { pages } from '../data/pages'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Community() {
  return (
    <MainLayout title={pages.community.title} activeTab="community">
      <PagePurpose>{pages.community.purpose}</PagePurpose>
    </MainLayout>
  )
}
