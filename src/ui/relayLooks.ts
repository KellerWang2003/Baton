// Visual treatments for Relay, compared side by side in the team-only Relay
// looks playground (Debug > Relay looks, or ?relay-looks). Each look styles the
// page, its section headings and the recommendation cards; the one picked
// there ("Use in Relay") is what the real Relay page shows.
export type RelayLook = 'flat' | 'paper' | 'scrapbook' | 'ticket' | 'postcard' | 'bands'

export const relayLooks: { id: RelayLook; name: string; blurb: string }[] = [
  { id: 'flat', name: 'Flat color', blurb: 'The first version: solid category-colored cards on plain paper.' },
  { id: 'paper', name: 'Paper', blurb: 'Same cards, but everything is paper: cream page with grain and fibers, cards with grain and a soft shadow.' },
  {
    id: 'scrapbook',
    name: 'Scrapbook',
    blurb: 'Notes taped into a journal: tilted paper scraps with washi tape on a dot-grid page. What Relay uses now (Keller, Oct 18).',
  },
  {
    id: 'ticket',
    name: 'Relay pass',
    blurb: 'Each tip is a pass handed to you: notched tickets with a tear line and a stub saying who passed it on.',
  },
  {
    id: 'postcard',
    name: 'Postcard',
    blurb: 'A postcard from someone who lived here: warm white card, a stamp in the category color and a NYC postmark.',
  },
  {
    id: 'bands',
    name: 'Color bands',
    blurb: 'A page-level take: Baton’s picks sit on a big navy band, people’s legacies on paper below.',
  },
]

// Page background behind everything (the sheet over the map too)
export const relayPage: Record<RelayLook, string> = {
  flat: 'bg-baton-paper',
  paper: 'bg-paper',
  scrapbook: 'bg-paper-dots',
  ticket: 'bg-paper-light',
  postcard: 'bg-paper',
  bands: 'bg-paper-light',
}

// Filter chips that aren't picked
export const relayChipIdle: Record<RelayLook, string> = {
  flat: 'bg-baton-chip text-ink',
  paper: 'bg-baton-paper/70 text-ink shadow-card',
  scrapbook: 'bg-baton-postcard text-ink shadow-paper',
  ticket: 'bg-baton-chip text-ink',
  postcard: 'bg-baton-postcard/80 text-ink',
  bands: 'bg-baton-chip text-ink',
}

// A section (Baton's picks, people's legacies) and its heading
export function relaySection(look: RelayLook, which: 'picks' | 'people') {
  if (look === 'bands' && which === 'picks') {
    return {
      section: '-mx-6 rounded-[40px] bg-baton-navy px-6 py-7',
      heading: 'text-baton-cream',
    }
  }
  return { section: '', heading: 'text-baton-navy' }
}
