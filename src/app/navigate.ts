// Jump to a screen in the flow by id (same URL hash the debug panel uses).
export function navigate(id: string) {
  window.location.hash = `/${id}`
}
