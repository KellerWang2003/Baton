// Archive folder colors and tab outline, shared by FolderStack and the small
// folders on "You're a Newcomer now".
import type { ArchiveFolder } from './FolderStack'

// Brand colors from the Figma Archive frame (LA28 Palms, 256:196).
// body is the text color for content inside the folder, fade the gradient
// over the bottom of the stack when the folder reaches the bottom edge.
export const folderTones: Record<
  ArchiveFolder['tone'],
  { fill: string; fillText: string; title: string; dates: string; body: string; fade: string }
> = {
  olive: {
    // --folder-fill lets content inside (inline photo outlines) match the folder
    fill: 'bg-baton-olive [--folder-fill:var(--color-baton-olive)]',
    fillText: 'text-baton-olive',
    title: 'text-baton-yellow',
    dates: 'text-on-baton-olive-muted',
    body: 'text-baton-cream',
    fade: 'from-baton-olive/0 to-baton-olive',
  },
  blue: {
    fill: 'bg-baton-blue [--folder-fill:var(--color-baton-blue)]',
    fillText: 'text-baton-blue',
    title: 'text-baton-cream',
    dates: 'text-on-baton-blue-muted',
    body: 'text-baton-cream',
    fade: 'from-baton-blue/0 to-baton-blue',
  },
  cream: {
    fill: 'bg-baton-cream [--folder-fill:var(--color-baton-cream)]',
    fillText: 'text-baton-cream',
    title: 'text-baton-navy',
    dates: 'text-on-baton-cream-muted',
    body: 'text-baton-navy',
    fade: 'from-baton-cream/0 to-baton-cream',
  },
  // The rest of the brand palette (Figma brand frame, 223:175), so folders vary
  pink: {
    fill: 'bg-baton-pink [--folder-fill:var(--color-baton-pink)]',
    fillText: 'text-baton-pink',
    title: 'text-baton-navy',
    dates: 'text-baton-navy/60',
    body: 'text-baton-navy',
    fade: 'from-baton-pink/0 to-baton-pink',
  },
  yellow: {
    fill: 'bg-baton-yellow [--folder-fill:var(--color-baton-yellow)]',
    fillText: 'text-baton-yellow',
    // Brand olive for text on yellow (Keller, Oct 19)
    title: 'text-baton-olive',
    dates: 'text-baton-olive/70',
    body: 'text-baton-olive',
    fade: 'from-baton-yellow/0 to-baton-yellow',
  },
  navy: {
    fill: 'bg-baton-navy [--folder-fill:var(--color-baton-navy)]',
    fillText: 'text-baton-navy',
    title: 'text-baton-pink',
    dates: 'text-baton-cream/60',
    body: 'text-baton-cream',
    fade: 'from-baton-navy/0 to-baton-navy',
  },
}

// Folder tab outline (see FolderStack for the edge variant)
export const TAB_PATH =
  'M0 52C6.2252 52 11.8852 48.3893 14.5092 42.7441L30.0751 9.2559C32.6991 3.6108 38.3587 0 44.5839 0H180.786C189.336 0 196.376 6.7238 196.769 15.2656L197.756 36.7347C198.148 45.2765 205.188 52 213.739 52V53H0Z'
export const TAB_WIDTH = 214
