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

// Fluid Glass settings for the circle, tunable live from the debug panel
// ("Today glass"), with the controls React Bits shows for the component.
// Colors stay on the brand tokens; size is the glass diameter in points.
export type GlassShape = 'lens' | 'blob' | 'cube' | 'pill' | 'torus' | 'prism' | 'diamond'
export type GlassInteraction = 'follow' | 'drag' | 'static'

export type GlassTuning = {
  shape: GlassShape
  size: number
  refraction: number
  dispersion: number
  reflection: number
  frost: number
  tint: number
  shadow: number
  elevation: number
  interaction: GlassInteraction
  // How far it follows a drag before springing back (0 = all the way, and it can be thrown)
  give: number
  smoothness: number
  wobble: number
  spin: number
  idle: boolean
  morphOnClick: boolean
}

export const defaultGlassTuning: GlassTuning = {
  shape: 'lens',
  size: 330,
  refraction: 0.7,
  dispersion: 0.3,
  reflection: 1,
  frost: 0,
  tint: 0.25,
  shadow: 0,
  elevation: 0.4,
  interaction: 'drag',
  // Keller, Oct 18: dragging it reacts just a little
  give: 0.12,
  smoothness: 0.5,
  wobble: 0.5,
  spin: 0.3,
  idle: false,
  morphOnClick: false,
}

export const glassShapes: GlassShape[] = ['lens', 'blob', 'cube', 'pill', 'torus', 'prism', 'diamond']
export const glassInteractions: GlassInteraction[] = ['drag', 'follow', 'static']

// Sliders in the debug panel: key, label, range and step
export const glassSliders: { key: keyof GlassTuning; label: string; min: number; max: number; step: number }[] = [
  { key: 'size', label: 'Size', min: 160, max: 330, step: 5 },
  { key: 'refraction', label: 'Refraction', min: 0, max: 2, step: 0.05 },
  { key: 'dispersion', label: 'Dispersion', min: 0, max: 1, step: 0.05 },
  { key: 'reflection', label: 'Reflection', min: 0, max: 2, step: 0.05 },
  { key: 'frost', label: 'Frost', min: 0, max: 1, step: 0.05 },
  { key: 'tint', label: 'Tint', min: 0, max: 1, step: 0.05 },
  { key: 'shadow', label: 'Shadow', min: 0, max: 1, step: 0.05 },
  { key: 'elevation', label: 'Elevation', min: 0, max: 1, step: 0.05 },
  { key: 'give', label: 'Drag give', min: 0, max: 1, step: 0.02 },
  { key: 'smoothness', label: 'Smoothness', min: 0, max: 1, step: 0.05 },
  { key: 'wobble', label: 'Wobble', min: 0, max: 1, step: 0.05 },
  { key: 'spin', label: 'Spin', min: 0, max: 2, step: 0.05 },
]
