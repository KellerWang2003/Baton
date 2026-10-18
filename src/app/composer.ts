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
  if (field) {
    // iOS Safari ignores preventScroll and pans the page up to reveal a field
    // the keyboard will cover. Lifting the field out of view for the moment
    // of focus leaves it nothing to reveal, so the page stays where it is.
    const input = field
    input.style.transform = 'translateY(-100000px)'
    input.focus({ preventScroll: true })
    requestAnimationFrame(() => {
      input.style.transform = ''
    })
  }
  setState({ composing: true })
}
