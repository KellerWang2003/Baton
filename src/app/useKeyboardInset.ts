import { useEffect, useState } from 'react'

type KeyboardInset = {
  // How much of the layout viewport the keyboard covers, so a bar pinned to
  // the bottom can ride on top of it
  inset: number
  // How far Safari panned the page up to reveal the focused field. Content
  // that should stay put while typing moves back down by this much
  pan: number
}

// iOS Safari doesn't resize the page for the on-screen keyboard; it shrinks
// the visual viewport and pans it to show the focused field.
export function useKeyboardInset(): KeyboardInset {
  const [state, setState] = useState<KeyboardInset>({ inset: 0, pan: 0 })

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop
      const open = window.innerHeight - viewport.height > 80
      // Safari pans the page to reveal a focused field; keep it pinned
      if (open && window.scrollY !== 0) window.scrollTo(0, 0)
      setState({
        // Ignore small differences like the collapsing Safari toolbar
        inset: open ? Math.max(0, Math.round(covered)) : 0,
        pan: open ? Math.round(viewport.offsetTop) : 0,
      })
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  return state
}
