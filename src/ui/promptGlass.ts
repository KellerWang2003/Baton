// Ways to draw the glass circle around Today's prompt, compared side by side in
// the team-only Today looks playground (Debug > Today looks, or ?today-looks).
// Keller (Oct 18): the whole circle is one big blob of liquid glass (React
// Bits Fluid Glass), tinted blue by the glass itself, no border and no images.
// "Use in Today" sets promptGlass in the store for the real page.
export type PromptGlass = 'glass' | 'glass-crisp' | 'css'

export const promptGlasses: { id: PromptGlass; name: string; blurb: string }[] = [
  {
    id: 'glass',
    name: 'Liquid glass, prompt under it',
    blurb: 'The prompt and its medium pill sit together under the glass, so moving the glass bends them. What Today uses (Keller, Oct 19).',
  },
  {
    id: 'glass-crisp',
    name: 'Liquid glass, prompt on top',
    blurb: 'The prompt and pill sit on top of the glass, so the words stay sharp but the glass bends nothing.',
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
  color: string
  // Ours: how strong the blue is at the rim, fading inward (Figma 236:1282)
  edge: number
  // Ours: a slow, small morph while it rests (Keller, Oct 19: just a little)
  breathe: number
  // Ours: the clear band and faint line around the very edge (Figma 236:1282)
  ring: number
  size: number
  refraction: number
  dispersion: number
  reflection: number
  frost: number
  tint: number
  shadow: number
  elevation: number
  interaction: GlassInteraction
  // Ours, not React Bits': with drag, how far it follows before springing back (0 = all the way, and it can be thrown)
  give: number
  smoothness: number
  wobble: number
  spin: number
  idle: boolean
  morphOnClick: boolean
  intro: boolean
}

// Keller's settings, tuned in the debug panel (Oct 19). "Follow the pointer"
// stays off: the glass would leave its spot. It nudges a little when dragged.
export const defaultGlassTuning: GlassTuning = {
  shape: 'lens',
  // Empty means brand blue (--color-baton-blue); the debug panel can pick another
  color: '',
  edge: 0.6,
  breathe: 0.1,
  ring: 1,
  size: 340,
  // Enough to bend the prompt under it, especially when the glass moves
  refraction: 0.5,
  dispersion: 1,
  reflection: 1.15,
  frost: 0,
  // No tint across the whole glass, so its middle stays white like the design
  tint: 0,
  shadow: 0.1,
  elevation: 0,
  interaction: 'drag',
  give: 0.1,
  smoothness: 1,
  wobble: 0.5,
  spin: 0.3,
  idle: false,
  morphOnClick: false,
  intro: true,
}

export const glassShapes: GlassShape[] = ['lens', 'blob', 'cube', 'pill', 'torus', 'prism', 'diamond']
export const glassInteractions: GlassInteraction[] = ['drag', 'follow', 'static']

// Sliders in the debug panel: key, label, range and step
export const glassSliders: { key: keyof GlassTuning; label: string; min: number; max: number; step: number }[] = [
  { key: 'edge', label: 'Edge glow', min: 0, max: 1, step: 0.05 },
  { key: 'breathe', label: 'Idle morph', min: 0, max: 1, step: 0.05 },
  { key: 'ring', label: 'Edge border', min: 0, max: 1, step: 0.05 },
  { key: 'size', label: 'Size', min: 160, max: 400, step: 5 },
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
