import { useState } from 'react'
import { pages } from '../data/pages'
import { SegmentedControl } from '../ui'
import { MainLayout } from './MainLayout'
import { PagePurpose } from './PagePurpose'

const { title, segments } = pages.archive

export function Archive() {
  const [segment, setSegment] = useState(segments[0].id)
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
