// Chloe's most recent camera roll photos, shown above the + field. Placeholder
// illustrations in public/photos until real shots replace them.
export type RecentPhoto = {
  id: string
  src: string
  alt: string
}

export const recentPhotos: RecentPhoto[] = [
  { id: 'cafe', src: '/photos/cafe.svg', alt: 'Coffee at the window seat, Lake Ave Café' },
  { id: 'palms', src: '/photos/palms.svg', alt: 'Palms at sunset on the walk home' },
  { id: 'studio', src: '/photos/studio.svg', alt: 'Her desk in the ArtCenter studio' },
  { id: 'trail', src: '/photos/trail.svg', alt: 'Eaton Canyon trail' },
  { id: 'market', src: '/photos/market.svg', alt: 'Grand Central Market' },
  { id: 'lake', src: '/photos/lake.svg', alt: 'Swan boats on Echo Park Lake' },
  { id: 'gym', src: '/photos/gym.svg', alt: 'Lake Ave Fitness' },
  { id: 'street', src: '/photos/street.svg', alt: 'Colorado Blvd at night' },
]
