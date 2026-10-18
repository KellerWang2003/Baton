import { useEffect, useRef, useState } from 'react'
import LiquidGlass from 'liquid-glass-react'

// Apple-style Liquid Glass (refraction, specular edge, blur) from
// liquid-glass-react, laid behind a tab bar capsule or button. It fills its
// parent, which must be `relative` and have no backdrop-filter of its own.
// The refraction is an SVG filter on the backdrop: Chrome and Edge only.
export function LiquidGlassLayer() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  // The library sizes its edge layers once on mount, so it is remounted (by
  // key) whenever the parent changes size, e.g. while + morphs into the field
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width: Math.round(width), height: Math.round(height) })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {size && size.width > 0 && (
        <LiquidGlass
          key={`${size.width}x${size.height}`}
          padding="0"
          cornerRadius={size.height / 2}
          displacementScale={64}
          blurAmount={0.1}
          saturation={130}
          aberrationIntensity={2}
          elasticity={0}
          style={{ position: 'absolute', top: '50%', left: '50%' }}
        >
          <div style={{ width: size.width, height: size.height }} />
        </LiquidGlass>
      )}
    </div>
  )
}
