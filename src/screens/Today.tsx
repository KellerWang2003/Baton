import { pages } from '../data/pages'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Today() {
  return (
    <MainLayout title={pages.today.title} activeTab="today">
      <PagePurpose>{pages.today.purpose}</PagePurpose>
    </MainLayout>
  )
}
