type Point = { x: number; y: number }

// Maps points in window pixels into an element's own points, through every
// CSS transform above it (the prototype's phone frame scales to fit; the
// Archive marketing mock tilts the phone in 3D, with perspective). It measures
// where the element's four corners land on screen and inverts that
// projection. The element must be positioned (relative or absolute) so the
// corner probes sit inside it.
export function toLocal(element: HTMLElement): (point: Point) => Point {
  const width = element.offsetWidth || 1
  const height = element.offsetHeight || 1
  const probe = (x: number, y: number) => {
    const dot = document.createElement('div')
    Object.assign(dot.style, { position: 'absolute', left: `${x}px`, top: `${y}px`, width: '0', height: '0' })
    element.appendChild(dot)
    const rect = dot.getBoundingClientRect()
    dot.remove()
    return { x: rect.left, y: rect.top }
  }
  // Corners in order: top left, top right, bottom right, bottom left
  const [p0, p1, p2, p3] = [probe(0, 0), probe(width, 0), probe(width, height), probe(0, height)]

  // The unit square -> screen quad projection (Heckbert), then its inverse
  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const dx3 = p0.x - p1.x + p2.x - p3.x
  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y
  const dy3 = p0.y - p1.y + p2.y - p3.y
  const den = dx1 * dy2 - dx2 * dy1 || 1
  const g = (dx3 * dy2 - dx2 * dy3) / den
  const h = (dx1 * dy3 - dx3 * dy1) / den
  const a = p1.x - p0.x + g * p1.x
  const b = p3.x - p0.x + h * p3.x
  const c = p0.x
  const d = p1.y - p0.y + g * p1.y
  const e = p3.y - p0.y + h * p3.y
  const f = p0.y
  // Inverse of [[a b c] [d e f] [g h 1]], up to scale
  const A = e - f * h
  const B = c * h - b
  const C = b * f - c * e
  const D = f * g - d
  const E = a - c * g
  const F = c * d - a * f
  const G = d * h - e * g
  const H = b * g - a * h
  const I = a * e - b * d

  return ({ x, y }) => {
    const w = G * x + H * y + I || 1
    return { x: ((A * x + B * y + C) / w) * width, y: ((D * x + E * y + F) / w) * height }
  }
}
