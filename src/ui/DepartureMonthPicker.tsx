import { useState } from 'react'

export function DepartureMonthPicker({ value, onChange }: { value: string; onChange: (month: string) => void }) {
  const today = new Date()
  const [year, setYear] = useState(() => value ? Number(value.slice(0, 4)) : today.getFullYear())
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  return (
    <div className="departure-calendar">
      <div className="departure-month">
        <h2 aria-live="polite">{year}</h2>
        <div className="departure-month-actions">
          <button type="button" aria-label="Previous year" disabled={year <= today.getFullYear()} onClick={() => setYear(year - 1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m12 5-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" aria-label="Next year" onClick={() => setYear(year + 1)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m8 5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>
      <div className="departure-months" role="group" aria-label="Choose your expected departure month">
        {Array.from({ length: 12 }, (_, index) => {
          const date = new Date(year, index, 1)
          const month = `${year}-${String(index + 1).padStart(2, '0')}`
          return (
            <button key={month} type="button" aria-label={date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} aria-pressed={value === month} disabled={month < currentMonth} onClick={() => onChange(month)}>
              {date.toLocaleDateString('en-US', { month: 'short' })}
            </button>
          )
        })}
      </div>
    </div>
  )
}
