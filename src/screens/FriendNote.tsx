import { useState } from 'react'
import { setState } from '../app/store'
import { chloe } from '../data/people'
import { Avatar, Button, Card, Screen, TextArea, TextField } from '../ui'

// Public-facing prototype destination for the link shared on Instagram.
// Like the rest of the demo, submissions live in the in-memory store.
export function FriendNote() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <Screen background="bg-baton-paper">
      <div className="mx-auto flex max-w-md flex-col gap-6 py-8">
        <p className="text-center text-headline font-semibold text-baton-navy">Baton</p>
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar name={chloe.name} src={chloe.avatar} size="md" />
          <h1 className="font-display text-title-1 font-semibold text-ink">
            {sent ? 'A little piece of LA, sealed.' : 'Leave Chloe a note'}
          </h1>
          <p className="text-body text-ink-muted">
            {sent
              ? 'Your note is waiting for Chloe. She’ll open it after she lands in New York.'
              : 'Chloe is leaving Los Angeles for New York. Send her a memory, a thank-you, or a few words for the next chapter.'}
          </p>
        </div>
        {sent ? (
          <Card className="bg-baton-blue/10 text-center">
            <p className="text-headline font-semibold">Thanks for being part of her LA story.</p>
            <p className="mt-2 text-subhead text-ink-muted">Only Chloe will see your note.</p>
          </Card>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault()
              if (!name.trim() || !message.trim()) return
              setState((s) => ({ friendNotes: [...s.friendNotes, { name: name.trim(), message: message.trim() }] }))
              setSent(true)
            }}
          >
            <TextField label="Your name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={80} autoComplete="name" placeholder="So Chloe knows who it’s from" />
            <TextArea label="Your note to Chloe" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={2000} rows={7} placeholder="I’ll always remember…" />
            <p className="px-1 text-footnote text-ink-muted">Just for Chloe. Your note stays sealed until she lands. No account needed.</p>
            <Button type="submit" block variant="blue" disabled={!name.trim() || !message.trim()}>Seal your note</Button>
          </form>
        )}
      </div>
    </Screen>
  )
}
