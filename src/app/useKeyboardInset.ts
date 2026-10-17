import { useEffect, useState } from 'react'

// How much of the layout viewport the on-screen keyboard covers, so a bar
// pinned to the bottom can ride on top of it. iOS Safari doesn't resize the
// page for the keyboard; it only shrinks the visual viewport.
export function useKeyboardInset() {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop
      // Ignore small differences like the collapsing Safari toolbar
      setInset(covered > 80 ? Math.round(covered) : 0)
      // Safari pans the page to reveal a focused field; keep it pinned
      if (covered > 80 && window.scrollY !== 0) window.scrollTo(0, 0)
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])

  return inset
}
