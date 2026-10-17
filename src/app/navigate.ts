let navigatedInApp = false

// Jump to a screen in the flow by id (same URL hash the debug panel uses).
export function navigate(id: string) {
  navigatedInApp = true
  window.location.hash = `/${id}`
}

// Back to the previous screen, or to the fallback when the page was opened
// directly on this screen (so Back never leaves the prototype).
export function goBack(fallback = 'today') {
  if (navigatedInApp) window.history.back()
  else navigate(fallback)
}
