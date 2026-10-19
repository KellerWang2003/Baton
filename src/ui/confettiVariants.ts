// The confetti styles for the Welcome to New York splash (Confetti.tsx),
// compared in the debug panel (Welcome confetti)
export type ConfettiVariant = 'cannons' | 'tickertape' | 'pop'

export const confettiVariants: { id: ConfettiVariant; label: string }[] = [
  { id: 'cannons', label: 'Cannons' },
  { id: 'tickertape', label: 'Ticker tape' },
  { id: 'pop', label: 'Photo pop' },
]
