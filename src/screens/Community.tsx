import { useState } from 'react'
import { setState, useStatus, useStore } from '../app/store'
import { pages } from '../data/pages'
import { communityHeader, qa, recFilters, recs } from '../data/stages'
import type { CommunitySegment, RecFilter } from '../data/stages'
import { Button, Card, Chip, ItemCard, SegmentedControl } from '../ui'
import { MainLayout } from './MainLayout'

const { segments } = pages.community

// Recommendations drawn from the legacies of lifestyle-matched leavers, and
// Q&A. Placeholder content follows her stage: Moving previews New York and can
// ask, Newcomers ask and get answers, Locals only answer.
export function Community() {
  const { communitySegment } = useStore()
  const status = useStatus()
  const [filter, setFilter] = useState<RecFilter>('places')
  const shownRecs = recs.filter((rec) => rec.kind === filter)
  const questions = qa[status]

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 pt-1">
        <SegmentedControl
          segments={segments as { id: CommunitySegment; label: string }[]}
          value={communitySegment}
          onChange={(id) => setState({ communitySegment: id })}
        />

        {communitySegment === 'recs' ? (
          <section className="flex flex-col gap-3">
            <p className="px-1 text-footnote text-ink-muted">{communityHeader[status]}</p>
            <div className="flex gap-2">
              {recFilters.map((item) => (
                <Chip key={item.id} selected={filter === item.id} onClick={() => setFilter(item.id)}>
                  {item.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {shownRecs.map((rec) => (
                <ItemCard
                  key={rec.id}
                  thumbnail
                  eyebrow={rec.from}
                  title={rec.title}
                  subtitle={`${rec.detail} · ${rec.notes} notes`}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-footnote uppercase text-ink-muted">{questions.header}</p>
              {questions.action === 'ask' && (
                <Button variant="tinted" size="sm">
                  Ask
                </Button>
              )}
            </div>
            {questions.questions.map((q) => (
              <Card key={q.id} className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-headline font-semibold text-ink">{q.question}</p>
                  <p className="text-footnote text-ink-muted">{q.asker}</p>
                </div>
                {q.answer ? (
                  <div className="flex flex-col gap-0.5 rounded-tile bg-surface-muted p-3">
                    <p className="text-body text-ink">{q.answer.text}</p>
                    <p className="text-footnote text-ink-muted">{q.answer.from}</p>
                  </div>
                ) : questions.action === 'answer' ? (
                  <Button variant="stage" size="sm" className="self-start">
                    Answer
                  </Button>
                ) : (
                  <p className="text-footnote text-ink-muted">No answer yet</p>
                )}
              </Card>
            ))}
          </section>
        )}
      </div>
    </MainLayout>
  )
}
