import { navigate } from '../app/navigate'
import { pages } from '../data/pages'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

export function Profile() {
  return (
    <MainLayout title={pages.profile.title} onBack={() => navigate('today')}>
      <PagePurpose>{pages.profile.purpose}</PagePurpose>
    </MainLayout>
  )
}
