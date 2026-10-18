// Chloe's most recent camera roll photos, shown above the + field. Real photos
// from her LA archive for now (public/archive, public/relay).
export type RecentPhoto = {
  id: string
  alt: string
  src?: string
}

export const recentPhotos: RecentPhoto[] = [
  { id: 'sunset', alt: 'Palms at sunset over the city', src: '/archive/la-sunset.jpg' },
  { id: 'tacos', alt: 'Tacos from the truck on her street', src: '/archive/la-tacos-2.jpg' },
  { id: 'truck', alt: 'The taco truck at dusk', src: '/archive/la-tacos-1.jpg' },
  { id: 'dance', alt: 'Dancing with friends', src: '/archive/la-party-2.jpg' },
  { id: 'lunch', alt: 'Lunch in the studio', src: '/relay/placeholder.jpg' },
  { id: 'party', alt: 'A night out in red light', src: '/archive/la-party-1.jpg' },
]
