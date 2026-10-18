// Ways to draw the glass circle around Today's prompt, compared side by side in
// the team-only Today looks playground (Debug > Today looks, or ?today-looks).
// Keller (Oct 18): the whole circle is one big blob of liquid glass (React
// Bits Fluid Glass) with a blue tint at its edge, no border and no images.
// "Use in Today" sets promptGlass in the store for the real page.
export type PromptGlass = 'glass' | 'glass-crisp' | 'css'

export const promptGlasses: { id: PromptGlass; name: string; blurb: string }[] = [
  {
    id: 'glass',
    name: 'Liquid glass',
    blurb: 'The whole circle is one lens of Fluid Glass with a blue tint at its edge. The prompt sits under the glass, so it bends a little toward the rim.',
  },
  {
    id: 'glass-crisp',
    name: 'Liquid glass, prompt on top',
    blurb: 'The same glass, but the prompt sits on top of it, so the words stay perfectly sharp.',
  },
  { id: 'css', name: 'Plain disc', blurb: 'The earlier white disc with a blue glow, drawn in CSS. No Fluid Glass.' },
]
