import { useState } from 'react'
import { navigate } from '../app/navigate'
import { completeSetup } from '../app/store'
import { instagram } from '../data/onboarding'
import { ArrowRightIcon, Button, Card } from '../ui'
import { OnboardingLayout } from './OnboardingLayout'

// Copy the Rolling Paper link, then open a social app to share it with friends.
export function InstagramTag() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState('')
  const [manualCopy, setManualCopy] = useState(false)
  // The prototype host links directly to the friend-facing note form.
  const link = new URL('/#/friend-note', window.location.origin).href
  const copyLink = async () => {
    setCopied(false)
    setManualCopy(false)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setStatus('Rolling Paper link copied. Paste it into your social app.')
    } catch {
      setManualCopy(true)
      setStatus('Select and copy your link below.')
    }
  }
  const shareLink = async () => {
    if (!navigator.share) {
      await copyLink()
      return
    }
    try {
      await navigator.share({ title: 'Chloe’s Rolling Paper', url: link })
      setStatus('Rolling Paper link shared.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      setStatus('Couldn’t open sharing. Copy your link and paste it into any app.')
    }
  }

  return (
    <OnboardingLayout
      title={instagram.title}
      body={instagram.body}
      onBack={() => navigate('today')}
      backLabel="Today"
      background="bg-baton-paper"
      footer={
        <Button block variant="ghost" onClick={() => {
          completeSetup('instagram')
          navigate('today')
        }}>{instagram.done}</Button>
      }
    >
      <Card className="flex flex-col gap-4 bg-baton-blue/10">
        <div className="flex flex-col gap-1">
          <h2 className="text-headline font-semibold">Your Rolling Paper link</h2>
          <p className="text-subhead text-ink-muted">Friends can leave you a private note here. No account needed.</p>
        </div>
        <input
          aria-label="Your Rolling Paper link"
          readOnly
          value={link}
          onFocus={(event) => event.currentTarget.select()}
          className="w-full min-w-0 rounded-control bg-surface px-4 py-3 text-subhead text-ink outline-none focus:ring-2 focus:ring-baton-blue"
          autoFocus={manualCopy}
        />
        <Button block variant="glow" size="cta" onClick={() => void copyLink()}>
          {copied ? 'Link copied' : 'Copy link'}
          <ArrowRightIcon />
        </Button>
      </Card>

      <section className="flex flex-col gap-3" aria-labelledby="social-options">
        <h2 id="social-options" className="px-1 text-headline font-semibold">Share it with friends</h2>
        <p className="px-1 text-subhead text-ink-muted">Copy your link, then open an app and paste it into your bio, story, or a message.</p>
        <div className="grid grid-cols-2 gap-3">
          {instagram.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-20 flex-col justify-center gap-1 rounded-card border border-line/50 bg-surface/60 px-4 py-3 transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-baton-blue"
            >
              <span className="text-headline font-semibold">{social.name}</span>
              <span className="text-footnote text-ink-muted">Open {social.name} ↗</span>
            </a>
          ))}
          <button type="button" onClick={() => void shareLink()} className="flex min-h-20 flex-col justify-center gap-1 rounded-card border border-line/50 bg-surface/60 px-4 py-3 text-left transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-baton-blue">
            <span className="text-headline font-semibold">More apps</span>
            <span className="text-footnote text-ink-muted">Share your link</span>
          </button>
        </div>
        <p role="status" className="px-1 text-footnote text-ink-muted">{status}</p>
      </section>

      <p className="px-1 text-subhead text-ink-muted">{instagram.sealed}</p>
      <Button variant="ghost" block onClick={() => navigate('friend-note')}>Preview your Rolling Paper</Button>
    </OnboardingLayout>
  )
}
