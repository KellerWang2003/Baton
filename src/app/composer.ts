import { setState } from './store'

// The + field lives in the tab bar, but other screens (the prompt card on
// Today) open it too. Opening doesn't raise the keyboard: she may only want to
// pick a photo, so the keyboard comes up when she taps into the field.
let field: HTMLInputElement | null = null

export function registerComposerField(element: HTMLInputElement | null) {
  field = element
}

export function openComposer() {
  // In case the field still has focus from last time
  field?.blur()
  setState({ composing: true })
}
