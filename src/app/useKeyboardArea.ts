import { useEffect, useState } from 'react'

// The part of the screen the keyboard leaves visible, or null while it's down
type VisibleArea = { top: number; height: number } | null

// iOS Safari doesn't resize the page for the on-screen keyboard; it shrinks
// the visual viewport and pans it to show the focused field. Measuring the
// keyboard against window.innerHeight and nudging content by that much left a
// band above the keyboard (the page and innerHeight disagree on iOS 26), so
// the app is sized to the visual viewport itself while the keyboard is up.
export function useKeyboardArea(): VisibleArea {
  const [area, setArea] = useState<VisibleArea>(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => {
      // Ignore small differences like the collapsing Safari toolbar
      const open = window.innerHeight - viewport.height > 80
      // Safari pans the page to reveal a focused field; keep it pinned
      if (open && window.scrollY !== 0) window.scrollTo(0, 0)
      setArea(open ? { top: Math.round(viewport.offsetTop), height: Math.round(viewport.height) } : null)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  return area
}
