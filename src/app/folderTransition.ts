// Archive -> city detail: tapping the open folder dives into it. On Archive
// the stack zooms in on the folder and blurs past it; the city page then
// zooms its photo cloud out from small to full size, with the side tab and
// the orb settling in after it. Archive plays the first half and then
// navigates; the detail page plays the second half before its first paint.
let opening = false

const easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Whether the detail page was opened by tapping the folder (read when the
// page opens; opened any other way it just appears)
export function pendingFolderOpening() {
  return opening
}

export function clearFolderOpening() {
  opening = false
}

// First half, on Archive: the stack zooms in on the open folder (marked
// data-folder) and blurs away
export async function playFolderExit(folderId: string) {
  const folder = document.querySelector<HTMLElement>(`[data-folder="${folderId}"]`)
  if (!folder || prefersReducedMotion()) return
  const stack = folder.parentElement!.parentElement as HTMLElement
  const body = folder.children[1] as HTMLElement
  // Zoom toward the upper middle of the folder's body, in the stack's own
  // points (the phone frame may be scaled to fit the window)
  const stackRect = stack.getBoundingClientRect()
  const bodyRect = body.getBoundingClientRect()
  const scale = stackRect.width / stack.offsetWidth || 1
  const origin = `${(bodyRect.left + bodyRect.width / 2 - stackRect.left) / scale}px ${(bodyRect.top - stackRect.top) / scale + 140}px`
  opening = true
  await stack
    .animate(
      [
        { transform: 'scale(1)', filter: 'blur(0)', opacity: 1, transformOrigin: origin },
        { transform: 'scale(2.6)', filter: 'blur(12px)', opacity: 0, transformOrigin: origin },
      ],
      { duration: 460, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' },
    )
    .finished.catch(() => undefined)
}

// Second half, on the detail page: the cloud zooms out from small and blurry
// to full size, then the side tab slides in and the orb rises. Returns a
// cancel that puts the page back (React may run it twice in development).
export function playFolderEnter(page: HTMLElement): () => void {
  const cloud = page.querySelector('[data-cloud-photo]')?.parentElement?.parentElement
  const animations: Animation[] = []
  const run = (node: Element | null | undefined, frames: Keyframe[], options: KeyframeAnimationOptions) => {
    if (node) animations.push(node.animate(frames, { fill: 'both', easing: easeOut, ...options }))
  }
  run(cloud, [{ transform: 'scale(0.55)', filter: 'blur(10px)', opacity: 0 }, { transform: 'none', filter: 'blur(0)', opacity: 1 }], { duration: 620 })
  run(page.querySelector('[data-side-tab]'), [{ opacity: 0, transform: 'translateX(-30px)' }, { opacity: 1, transform: 'none' }], {
    duration: 360,
    delay: 360,
  })
  run(page.querySelector('[data-filter-orb]'), [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], {
    duration: 420,
    delay: 300,
  })

  // Once it has played, drop the animations so nothing is left holding a style
  let cancelled = false
  Promise.all(animations.map((animation) => animation.finished))
    .then(() => {
      if (!cancelled) animations.forEach((animation) => animation.cancel())
    })
    .catch(() => undefined)
  return () => {
    cancelled = true
    animations.forEach((animation) => animation.cancel())
  }
}
