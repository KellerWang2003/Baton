import type { ReactNode } from 'react'

type DeviceFrameProps = {
  framed: boolean
  children: ReactNode
}

// Framed: a 390x844 phone centered on the page, for recording the demo.
// Unframed: the app fills the window and responds to its width.
// Both are size containers, so screens should use container variants
// (@md:, @lg:) rather than viewport ones (md:, lg:).
export function DeviceFrame({ framed, children }: DeviceFrameProps) {
  if (!framed) {
    return <div className="@container h-full w-full bg-canvas">{children}</div>
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div className="relative flex h-[844px] max-h-full w-[390px] flex-col overflow-hidden rounded-[52px] border-[10px] border-ink bg-canvas shadow-float">
        <div className="flex h-11 shrink-0 items-center justify-between px-7 text-sm font-semibold text-ink">
          <span>9:41</span>
          <span aria-hidden className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-ink" />
          <span aria-hidden>●●●</span>
        </div>
        <div className="@container min-h-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
