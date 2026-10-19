type SpellOutProps = {
  text: string
  // When the first letter appears, in ms after mount
  delay?: number
  // Time between letters, in ms
  step?: number
  className?: string
}

// Text that spells itself out letter by letter on mount (LA Wrapped's
// header). Letters not shown yet keep their place, so nothing shifts.
// To chain several, start the next one text.length * step later.
// Remount (change key) to play it again.
export function SpellOut({ text, delay = 0, step = 40, className }: SpellOutProps) {
  return (
    <span aria-label={text} className={className}>
      {[...text].map((letter, index) => (
        <span
          key={index}
          aria-hidden
          className="inline-block animate-letter-in whitespace-pre motion-reduce:animate-none"
          style={{ animationDelay: `${delay + index * step}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  )
}
