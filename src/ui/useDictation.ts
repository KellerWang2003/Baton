import { useEffect, useRef, useState } from 'react'

// The bits of the Web Speech API this uses (Safari and Chrome prefix it)
type Recognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}
type RecognitionConstructor = new () => Recognition

const Speech: RecognitionConstructor | undefined =
  (window as unknown as { SpeechRecognition?: RecognitionConstructor }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: RecognitionConstructor }).webkitSpeechRecognition

// Voice input for a text field: what she says is added after what's typed.
// Returns null where the browser can't listen.
export function useDictation(onText: (spoken: string) => void) {
  const [listening, setListening] = useState(false)
  const recognition = useRef<Recognition | null>(null)
  const report = useRef(onText)
  useEffect(() => {
    report.current = onText
  })

  useEffect(() => () => recognition.current?.stop(), [])

  if (!Speech) return null

  const start = () => {
    const r = new Speech()
    r.lang = navigator.language || 'en-US'
    r.continuous = true
    r.interimResults = true
    r.onresult = (event) => {
      const spoken = Array.from(event.results, (result) => result[0].transcript).join('')
      report.current(spoken)
    }
    r.onend = () => setListening(false)
    recognition.current = r
    r.start()
    setListening(true)
  }

  const stop = () => {
    recognition.current?.stop()
    setListening(false)
  }

  return { listening, toggle: () => (listening ? stop() : start()), stop }
}
