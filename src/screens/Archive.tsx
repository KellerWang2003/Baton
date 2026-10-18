import { setState, useStore } from '../app/store'
import { pages } from '../data/pages'
import { SegmentedControl } from '../ui'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

const { title, segments } = pages.archive

export function Archive() {
  const { archiveSegment: segment } = useStore()
  const setSegment = (id: string) => setState({ archiveSegment: id as 'mine' | 'legacy' })
  const current = segments.find((s) => s.id === segment) ?? segments[0]

  return (
    <MainLayout title={title}>
      <div className="flex flex-col gap-2 pt-1">
        <SegmentedControl segments={segments} value={segment} onChange={setSegment} />
        <PagePurpose>{current.purpose}</PagePurpose>
      </div>
    </MainLayout>
  )
}
