import { useState } from 'react'
import { chloe } from '../data/people'
import { Avatar, Button, Card, Chip, PromptCard, Screen, TextArea, TextField, VisibilityBadge } from '../ui'
import type { Stage } from '../flow'

const stages: Stage[] = ['moving', 'newcomer', 'local']

// Every building block on one screen, to check a restyle at a glance.
export function UiKit() {
  const [status, setStatus] = useState<Stage>('moving')

  return (
    <Screen eyebrow="Prototype" title="UI kit" footer={<Button block>Primary action</Button>}>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Buttons</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="stage">Stage</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="sm">Small</Button>
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Status chips</h2>
          <div className="flex flex-wrap gap-2">
            {stages.map((stage) => (
              <Chip key={stage} selected={status === stage} onClick={() => setStatus(stage)}>
                {stage[0].toUpperCase() + stage.slice(1)}
              </Chip>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Stage colors</h2>
          <div className="grid grid-cols-1 gap-2 @md:grid-cols-3">
            {stages.map((stage) => (
              <div key={stage} data-stage={stage}>
                <PromptCard meta={stage} question="Third time this week. What keeps pulling you back?">
                  <Button variant="stage" size="sm" className="self-start">
                    Hold to record
                  </Button>
                </PromptCard>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Cards</h2>
          <Card className="flex items-center gap-3">
            <Avatar name={chloe.name} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{chloe.name}</p>
              <p className="text-sm text-ink-muted">
                Leaving {chloe.from} on {chloe.leavingOn}
              </p>
            </div>
            <VisibilityBadge visibility="community" />
          </Card>
          <Card tone="muted" className="flex items-center justify-between">
            <p className="text-sm">Why I love this place</p>
            <VisibilityBadge visibility="private" />
          </Card>
          <Card tone="outline">
            <p className="text-sm text-ink-muted">Outline card</p>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold">Fields</h2>
          <TextField label="Moving to" placeholder="New York" />
          <TextArea label="Why I love this place" placeholder="Type or hold to record" />
        </section>
      </div>
    </Screen>
  )
}
