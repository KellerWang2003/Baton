export type StageTone = 'moving' | 'newcomer' | 'local'

// Stage colors: Moving blue (Figma TODAY 334:11626), Newcomer yellow, Local olive
export const stageTones: Record<StageTone, string> = {
  moving: 'bg-baton-blue text-white',
  // Brand olive for text on yellow (Keller, Oct 19)
  newcomer: 'bg-baton-yellow text-baton-olive',
  local: 'bg-baton-olive text-baton-cream',
}
