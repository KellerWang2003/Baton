// Chloe's most recent camera roll photos, shown above the + field. Gray
// placeholder tiles for now; alt text says what each one would be.
export type RecentPhoto = {
  id: string
  alt: string
  src?: string
}

export const recentPhotos: RecentPhoto[] = [
  { id: 'cafe', alt: 'Coffee at the window seat, Lake Ave Café' },
  { id: 'palms', alt: 'Palms at sunset on the walk home' },
  { id: 'studio', alt: 'Her desk in the ArtCenter studio' },
  { id: 'trail', alt: 'Eaton Canyon trail' },
  { id: 'market', alt: 'Grand Central Market' },
  { id: 'lake', alt: 'Swan boats on Echo Park Lake' },
  { id: 'gym', alt: 'Lake Ave Fitness' },
  { id: 'street', alt: 'Colorado Blvd at night' },
]
