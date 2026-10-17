// Jump to a screen in the flow by id (same URL hash the toolbar uses).
export function navigate(id: string) {
  window.location.hash = `/${id}`
}
