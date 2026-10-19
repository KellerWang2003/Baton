import { useState } from 'react'
import type { ReactNode } from 'react'
import { chloe } from '../data/people'
import {
  ArrivalGraphic,
  ArrowRightIcon,
  Avatar,
  BoxesGraphic,
  BottomSheet,
  Button,
  Card,
  CardFan,
  CheckCircle,
  Chip,
  ChoiceCard,
  FluidGlass,
  HomeGraphic,
  ListRow,
  ListSection,
  PromptCard,
  Screen,
  SegmentedControl,
  Steps,
  TextArea,
  TextField,
  VisibilityBadge,
} from '../ui'
import type { Stage } from '../flow'

const stages: Stage[] = ['moving', 'newcomer', 'local']

const textStyles = [
  ['text-large-title font-bold', 'Large title'],
  ['text-title-1 font-bold', 'Title 1'],
  ['text-title-2 font-bold', 'Title 2'],
  ['text-title-3 font-semibold', 'Title 3'],
  ['text-headline font-semibold', 'Headline'],
  ['text-body', 'Body'],
  ['text-subhead text-ink-muted', 'Subhead'],
  ['text-footnote text-ink-muted', 'Footnote'],
]

// Every building block on one screen, to check a restyle at a glance.
// Opened from the debug panel, not part of the app.
export function UiKit() {
  const [status, setStatus] = useState<Stage>('moving')
  const [segment, setSegment] = useState('mine')
  const [sheet, setSheet] = useState<'medium' | 'large' | null>(null)

  return (
    <>
      <Screen eyebrow="Prototype" title="Design system" footer={<Button block>Primary action</Button>}>
        <div className="flex flex-col gap-8 pt-2">
          <Section title="Type">
            <Card className="flex flex-col gap-1">
              {textStyles.map(([className, label]) => (
                <p key={label} className={className}>
                  {label}
                </p>
              ))}
            </Card>
          </Section>

          <Section title="Buttons">
            <div className="flex flex-col gap-2">
              <Button block>Filled</Button>
              <Button block variant="tinted">
                Tinted
              </Button>
              <Button block variant="secondary">
                Gray
              </Button>
              <Button block variant="ghost">
                Plain
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="sm" variant="tinted">
                Tinted
              </Button>
              <Button size="sm" variant="secondary">
                Gray
              </Button>
              <Button size="sm" variant="stage">
                Stage
              </Button>
              <Button size="sm" variant="destructive">
                Delete
              </Button>
            </div>
            <Button variant="glow" size="cta" block>
              Continue
              <ArrowRightIcon />
            </Button>
          </Section>

          <Section title="Segmented control (sub nav)">
            <SegmentedControl
              segments={[
                { id: 'mine', label: 'My archive' },
                { id: 'legacy', label: 'Legacy' },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </Section>

          <Section title="Bottom sheet">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setSheet('medium')}>
                Medium sheet
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setSheet('large')}>
                Large sheet
              </Button>
            </div>
          </Section>

          <ListSection header="Grouped list" footer="Footnote under a group explains the setting.">
            <ListRow title="Status" value="Moving" chevron onClick={() => {}} />
            <ListRow title="City" value="Los Angeles" chevron onClick={() => {}} />
            <ListRow title={chloe.name} subtitle={`Leaving ${chloe.from} on ${chloe.leavingOn}`} leading={<Avatar name={chloe.name} />} />
          </ListSection>

          <Section title="Chips">
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => (
                <Chip key={stage} selected={status === stage} onClick={() => setStatus(stage)}>
                  {stage[0].toUpperCase() + stage.slice(1)}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Liquid glass (React Bits Fluid Glass)">
            <div className="h-64 overflow-hidden rounded-card">
              <FluidGlass src="/archive/la-sunset.jpg" shape="blob" size={200} dispersion={0.85} />
            </div>
          </Section>

          <Section title="Card fan">
            <CardFan
              options={[
                { id: 'moving' as const, label: 'Moving soon', graphic: <BoxesGraphic /> },
                { id: 'newcomer' as const, label: 'Just arrived', graphic: <ArrivalGraphic /> },
                { id: 'local' as const, label: 'Settled in', graphic: <HomeGraphic /> },
              ]}
              value={status}
              onChange={setStatus}
            />
          </Section>

          <Section title="Choices and steps">
            <ChoiceCard title="Moving" subtitle="I'm leaving a city soon" selected={status === 'moving'} onSelect={() => setStatus('moving')} />
            <ChoiceCard title="Newcomer" subtitle="I just arrived somewhere new" selected={status === 'newcomer'} onSelect={() => setStatus('newcomer')} />
            <ListSection>
              <ListRow title="Selectable row" leading={<CheckCircle checked />} />
              <ListRow title="Done to-do" done leading={<CheckCircle checked />} />
              <ListRow title="Open to-do" leading={<CheckCircle checked={false} />} />
            </ListSection>
            <Steps count={5} current={2} className="px-1" />
          </Section>

          <Section title="Stage colors">
            {stages.map((stage) => (
              <div key={stage} data-stage={stage}>
                <PromptCard meta={stage} question="Third time this week. What keeps pulling you back?">
                  <Button variant="stage" size="sm" className="self-start">
                    Hold to record
                  </Button>
                </PromptCard>
              </div>
            ))}
          </Section>

          <Section title="Cards and badges">
            <Card className="flex items-center gap-3">
              <Avatar name={chloe.name} />
              <p className="min-w-0 flex-1 text-body">Why I love this place</p>
              <VisibilityBadge visibility="private" />
            </Card>
            <Card tone="muted" className="flex items-center justify-between">
              <p className="text-body">Best late-night tacos</p>
              <VisibilityBadge visibility="community" />
            </Card>
          </Section>

          <Section title="Fields">
            <TextField label="Moving to" placeholder="New York" />
            <TextArea label="Reflection" placeholder="Write a few lines, or just one." />
          </Section>
        </div>
      </Screen>

      <BottomSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === 'large' ? 'Large sheet' : 'Medium sheet'}
        detent={sheet ?? 'medium'}
        action={
          <button type="button" onClick={() => setSheet(null)} className="text-body font-semibold text-brand">
            Done
          </button>
        }
      >
        <ListSection>
          <ListRow title="Sheets slide up over the screen" />
          <ListRow title="Tap the dim area or Close to dismiss" />
        </ListSection>
      </BottomSheet>
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-title-3 font-semibold">{title}</h2>
      {children}
    </section>
  )
}
