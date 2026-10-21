import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { goBack } from '../app/navigate'
import { setState, useStore } from '../app/store'
import { pages } from '../data/pages'
import { chloe } from '../data/people'
import { findLeaver, relayCategory, relayCopy, relayItems, relayPlaceholderAvatar, relayPlaceholderPhoto } from '../data/relay'
import { ArrowRightIcon, Avatar, BatonMark, Button, Chip, cx, MapPinIcon, Scrap, Screen } from '../ui'

// Notes lean a little, alternating
const noteTilts = [-2, 1.6, -1.2, 2.2]

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
  const notesEnd = useRef<HTMLDivElement>(null)
  const [posted, setPosted] = useState(0)

  const post = () => {
    const text = draft.trim()
    if (!text) return
    setState((s) => ({ relayNotes: { ...s.relayNotes, [item.id]: [...(s.relayNotes[item.id] ?? []), text] } }))
    setDraft('')
    setWriting(false)
    setPosted((count) => count + 1)
  }

  // Once her note is stuck on, bring it into view as it slaps down
  useEffect(() => {
    if (posted) notesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [posted])

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
          {/* The card she tapped, opened up: the same scrapbook scrap in its category color */}
          <Scrap tone={category.tone} className="mt-3 flex flex-col gap-3">
            <img src={item.photo ?? relayPlaceholderPhoto} alt={item.title} draggable={false} className="aspect-[4/3] w-full rounded-tile object-cover" />
            <div className="flex flex-col gap-1 px-1.5">
              <p className="text-caption font-medium opacity-60">{category.label}</p>
              <h1 className="font-display text-title-1 font-medium">{item.title}</h1>
              {item.place && (
                <p className="flex items-center gap-1 text-subhead opacity-70">
                  <MapPinIcon className="size-4 shrink-0" />
                  {item.place}
                </p>
              )}
            </div>
          </Scrap>

          <div className="flex flex-col gap-3 px-1">
            {item.quote && <p className="font-display text-title-2 text-baton-navy">“{item.quote}”</p>}
            <p className="text-body text-ink">{item.body}</p>
          </div>

          {/* Who it came from */}
          <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-card">
            {leaver ? (
              <>
                <Avatar name={leaver.name} src={relayPlaceholderAvatar} />
                <div className="min-w-0">
                  <p className="text-headline font-medium text-baton-navy">{relayCopy.legacy(leaver.name)}</p>
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
                  <p className="text-headline font-medium text-baton-navy">{relayCopy.pickedBy}</p>
                  <p className="text-footnote text-ink-muted">{item.source.kind === 'baton' && item.source.why}</p>
                </div>
              </>
            )}
          </div>

          <section className="flex flex-col gap-4">
            <h2 className="font-display text-title-3 font-medium text-baton-navy">
              {relayCopy.notesHeader}
              <span className="ml-1.5 font-normal text-ink-muted">{item.notes.length + mine.length}</span>
            </h2>
            {item.notes.length + mine.length === 0 && <p className="text-subhead text-ink-muted">{relayCopy.noNotes}</p>}
            {[
              ...item.notes,
              ...mine.map((text) => ({ from: relayCopy.you, detail: relayCopy.youDetail, text })),
            ].map((note, index) => (
              // Post-its like her Archive notes, tilting either way; one she just
              // left slaps down
              <div
                key={index}
                className={cx(
                  'flex gap-3 rounded-[10px] bg-note-yellow p-4 shadow-moment-note',
                  index >= item.notes.length ? 'animate-note-stick' : 'rotate-(--note-tilt)',
                )}
                style={{ '--note-tilt': `${noteTilts[index % noteTilts.length]}deg` } as CSSProperties}
              >
                <Avatar name={note.from === relayCopy.you ? chloe.name : note.from} src={note.from === relayCopy.you ? chloe.avatar : undefined} size="sm" />
                <div className="min-w-0">
                  <p className="text-subhead">
                    <span className="font-medium text-baton-navy">{note.from}</span>
                    <span className="text-ink-muted"> · {note.detail}</span>
                  </p>
                  <p className="text-body text-baton-navy">{note.text}</p>
                </div>
              </div>
            ))}
            <div ref={notesEnd} className="h-4" />
          </section>
        </div>
      </Screen>

      {writing && <NoteComposer title={item.title} draft={draft} setDraft={setDraft} onPost={post} onClose={() => setWriting(false)} />}
    </div>
  )
}

// Leaving a note: a blank post-it like the ones on the page slaps down over the
// blurred page, and she writes straight onto it. Stick it on adds it to the
// notes, where it lands in place.
function NoteComposer({ title, draft, setDraft, onPost, onClose }: { title: string; draft: string; setDraft: (text: string) => void; onPost: () => void; onClose: () => void }) {
  const field = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // After the note has landed, so the keyboard doesn't jolt it
    const timer = window.setTimeout(() => field.current?.focus({ preventScroll: true }), 450)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="absolute inset-0 z-40 flex flex-col px-gutter pt-[calc(var(--status-bar,0px)+48px)] pb-8">
      <button type="button" aria-label={relayCopy.noteCancel} onClick={onClose} className="absolute inset-0 animate-fade-in bg-baton-paper/80 backdrop-blur-md" />
      <div
        className="relative flex min-h-64 animate-note-stick flex-col gap-3 rounded-[10px] bg-note-yellow p-5 shadow-float"
        style={{ '--note-tilt': '-1.5deg' } as CSSProperties}
      >
        <div className="flex items-center gap-2.5">
          <Avatar name={chloe.name} src={chloe.avatar} size="sm" />
          <p className="min-w-0 truncate text-subhead text-ink-muted">{relayCopy.noteOn(title)}</p>
        </div>
        <textarea
          ref={field}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={relayCopy.notePlaceholder}
          aria-label={relayCopy.leaveNote}
          className="min-h-0 flex-1 resize-none bg-transparent font-display text-moment-note text-baton-navy outline-none placeholder:text-baton-navy/35"
        />
      </div>
      <div className="relative mt-6 flex flex-wrap justify-center gap-2 animate-fade-in">
        {relayCopy.noteStarters.map((starter) => (
          <Chip key={starter} onClick={() => setDraft(draft ? draft : `${starter}: `)} className="bg-surface shadow-sm">
            {starter}
          </Chip>
        ))}
      </div>
      <div className="relative mt-auto flex flex-col items-center gap-3 animate-fade-in">
        <Button block variant="glow" size="cta" onClick={onPost} disabled={!draft.trim()}>
          {relayCopy.notePost}
          <ArrowRightIcon />
        </Button>
        <button type="button" onClick={onClose} className="text-body text-ink-muted">
          {relayCopy.noteCancel}
        </button>
      </div>
    </div>
  )
}
