// Ways to draw the glass circle around Today's prompt, compared side by side in
// the team-only Today looks playground (Debug > Today looks, or ?today-looks).
// All but the first use React Bits Fluid Glass (FluidGlass), which bends only
// what it's given inside the circle: the prompt itself, a photo, or brand color.
// "Use in Today" sets promptGlass in the store for the real page.
export type PromptGlass = 'css' | 'lens-text' | 'lens-photo' | 'lens-color' | 'frost-color' | 'blob-photo'

export const promptGlasses: { id: PromptGlass; name: string; blurb: string }[] = [
  { id: 'css', name: 'Current', blurb: 'What Today has now: a white disc with a blue glow drawn in CSS. No Fluid Glass, for comparison.' },
  {
    id: 'lens-text',
    name: 'Lens over the prompt',
    blurb: 'The prompt is printed on paper and a clear glass lens sits on it, magnifying the words. It follows your finger.',
  },
  {
    id: 'lens-photo',
    name: 'Window onto a photo',
    blurb: 'The circle is a window onto one of her photos, with a slowly drifting lens bending it. The prompt sits on top.',
  },
  {
    id: 'lens-color',
    name: 'Lens over brand color',
    blurb: 'Pink, blue and yellow behind the glass, with a clear lens that splits the colors at its edge. The prompt sits on top.',
  },
  {
    id: 'frost-color',
    name: 'Frosted lens',
    blurb: 'Same colors, but the lens is frosted and tinted blue, softer and quieter. The prompt sits on top.',
  },
  {
    id: 'blob-photo',
    name: 'Glass blob to play with',
    blurb: 'A wobbly glass blob over her photo that you can drag around the circle.',
  },
]
