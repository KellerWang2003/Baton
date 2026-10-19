import { useState } from 'react'
import { goBack } from '../app/navigate'
import { setState, useStore } from '../app/store'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { findLeaver, relayCategory, relayCopy, relayItems, relayPlaceholderAvatar, relayPlaceholderPhoto } from '../data/relay'
import { ArrowRightIcon, Avatar, BatonMark, BottomSheet, Button, Chip, MapPinIcon, Screen, TextArea, ToneTile } from '../ui'

// Pushed page for one Relay pick or tip: the full story, who it came from,
// and notes people left on it. Notes go on a recommendation, never on a whole
// legacy.
export function RelayDetail() {
  const { selectedRec, relayNotes } = useStore()
  const item = relayItems.find((rec) => rec.id === selectedRec) ?? relayItems[0]
  const leaver = item.source.kind === 'leaver' ? findLeaver(item.source.leaver) : undefined
  const mine = relayNotes[item.id] ?? []
  const category = relayCategory(item.category)
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState('')

  const post = () => {
    const text = draft.trim()
    if (!text) return
    setState((s) => ({ relayNotes: { ...s.relayNotes, [item.id]: [...(s.relayNotes[item.id] ?? []), text] } }))
    setDraft('')
    setWriting(false)
  }

  return (
    <div className="relative h-full">
      <Screen
        background="bg-baton-paper"
        backLabel={pages.community.title}
        onBack={() => goBack('community')}
        footer={
          <Button block variant="glow" size="cta" onClick={() => setWriting(true)}>
            {relayCopy.leaveNote}
            <ArrowRightIcon />
          </Button>
        }
      >
        <div className="flex flex-col gap-6 pt-1">
          <ToneTile
            tone={category.tone}
            src={item.photo ?? relayPlaceholderPhoto}
            alt={item.title}
            label={category.label}
            className="aspect-[4/3] w-full rounded-rec"
          />

          <div className="flex flex-col gap-3 px-1">
            <h1 className="font-display text-large-title font-bold text-baton-navy">{item.title}</h1>
            {item.quote && <p className="font-display text-title-2 text-baton-navy">“{item.quote}”</p>}
            {item.place && (
              <p className="flex items-center gap-1 text-subhead text-ink-muted">
                <MapPinIcon className="size-4 shrink-0" />
                {item.place}
              </p>
            )}
            <p className="text-body text-ink">{item.body}</p>
          </div>

          {/* Who it came from */}
          <div className="flex items-center gap-3 rounded-card bg-surface p-4">
            {leaver ? (
              <>
                <Avatar name={leaver.name} src={relayPlaceholderAvatar} />
                <div className="min-w-0">
                  <p className="text-headline font-semibold text-baton-navy">{relayCopy.legacy(leaver.name)}</p>
                  <p className="text-footnote text-ink-muted">
                    {leaver.left} · {leaver.match}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-baton-cream">
                  <BatonMark className="size-6! text-baton-navy!" />
                </span>
                <div className="min-w-0">
                  <p className="text-headline font-semibold text-baton-navy">{relayCopy.pickedBy}</p>
                  <p className="text-footnote text-ink-muted">{item.source.kind === 'baton' && item.source.why}</p>
                </div>
              </>
            )}
          </div>

          <section className="flex flex-col gap-2.5">
            <h2 className="px-1 font-display text-title-3 font-bold text-baton-navy">
              {relayCopy.notesHeader}
              <span className="ml-1.5 font-normal text-ink-muted">{item.notes.length + mine.length}</span>
            </h2>
            {item.notes.length + mine.length === 0 && <p className="px-1 text-subhead text-ink-muted">{relayCopy.noNotes}</p>}
            {[
              ...item.notes,
              ...mine.map((text) => ({ from: relayCopy.you, detail: relayCopy.youDetail, text })),
            ].map((note, index) => (
              <div key={index} className="flex gap-3 rounded-card bg-surface p-4 animate-fade-in">
                <Avatar name={note.from === relayCopy.you ? chloe.name : note.from} src={note.from === relayCopy.you ? chloe.avatar : undefined} size="sm" />
                <div className="min-w-0">
                  <p className="text-subhead">
                    <span className="font-semibold text-baton-navy">{note.from}</span>
                    <span className="text-ink-muted"> · {note.detail}</span>
                  </p>
                  <p className="text-body text-ink">{note.text}</p>
                </div>
              </div>
            ))}
          </section>
        </div>
      </Screen>

      <BottomSheet
        open={writing}
        onClose={() => setWriting(false)}
        title={relayCopy.noteSheetTitle}
        action={
          <button type="button" onClick={post} disabled={!draft.trim()} className="text-body font-semibold text-brand disabled:opacity-30">
            {relayCopy.notePost}
          </button>
        }
      >
        <div className="flex flex-col gap-3 pt-2">
          <p className="px-1 text-subhead text-ink-muted">On “{item.title}”</p>
          <div className="flex flex-wrap gap-2">
            {relayCopy.noteStarters.map((starter) => (
              <Chip key={starter} onClick={() => setDraft((text) => (text ? text : `${starter}: `))}>
                {starter}
              </Chip>
            ))}
          </div>
          <TextArea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={relayCopy.notePlaceholder} />
        </div>
      </BottomSheet>
    </div>
  )
}
