import { setState } from './store'

// The + field lives in the tab bar, but other screens (the prompt card on
// Today) open it too. iOS Safari only raises the keyboard when focus happens
// inside the tap itself, so opening focuses the field right away instead of
// after the morph.
let field: HTMLInputElement | null = null

export function registerComposerField(element: HTMLInputElement | null) {
  field = element
}

export function openComposer() {
  field?.focus({ preventScroll: true })
  setState({ composing: true })
}
