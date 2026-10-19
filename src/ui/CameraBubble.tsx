import { useEffect, useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useDailyPrompt, useStore } from '../app/store'
import { cx } from './cx'

// What the camera shows when there's no camera to use (a laptop without one, or
// permission refused), so the flow still works when recording the demo.
const placeholderPhoto = '/archive/la-sunset.jpg'

// The same iOS-like curve the tab bar morph uses
const ease = 'cubic-bezier(0.32, 0.72, 0, 1)'

// The rectangle grows from the circle around the circle's own center, so it is
// a pure shape morph: as wide as the screen allows, and as tall as fits between
// the prompt above and the shutter below
const sideMargin = 36
const rectRadius = 52
const promptTop = 56
// Where the rectangle's top may reach, under the moved prompt (three lines)
const rectTopLimit = 146
// Narrow enough to clear the close button at the top right
const promptWidth = 260
const promptFont = 24

type Box = { left: number; top: number; width: number; height: number; radius: number }

// Tapping a photo prompt's circle on Today opens the camera inside the app:
// the circle morphs into a rounded rectangle with the live camera in it, the
// prompt moves to the top, and a round button below takes the photo, which goes
// on to Capture to be saved. A small close button at the top left goes back.
export function CameraBubble() {
  const { camera } = useStore()
  const prompt = useDailyPrompt()
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [origin, setOrigin] = useState<Box | null>(null)
  const [target, setTarget] = useState<Box | null>(null)
  const [live, setLive] = useState(false)
  const [mirror, setMirror] = useState(false)
  const [flash, setFlash] = useState(false)
  // No camera to use: show the stand-in photo instead
  const [noCamera, setNoCamera] = useState(false)

  const stop = () => {
    stream.current?.getTracks().forEach((track) => track.stop())
    stream.current = null
    setLive(false)
  }

  // Open: measure where the circle is and where the rectangle goes, mount the
  // shape on the circle, then let it grow into the rectangle. Close: shrink back.
  useEffect(() => {
    const box = root.current
    if (camera && box) {
      // The phone frame can be scaled to fit the window, so convert from screen
      // pixels to the frame's own points
      const bounds = box.getBoundingClientRect()
      const scale = bounds.width / box.offsetWidth || 1
      const size = camera.size
      setOrigin({
        left: (camera.cx - bounds.left) / scale - size / 2,
        top: (camera.cy - bounds.top) / scale - size / 2,
        width: size,
        height: size,
        radius: size / 2,
      })
      const centerY = (camera.cy - bounds.top) / scale
      const height = Math.max(240, Math.round(2 * (centerY - rectTopLimit)))
      setTarget({
        left: sideMargin,
        top: Math.round(centerY - height / 2),
        width: box.offsetWidth - sideMargin * 2,
        height,
        radius: rectRadius,
      })
      setMounted(true)
      setExpanded(false)
      setNoCamera(false)
      // One frame on the circle first, so the move is animated
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)))
      return () => cancelAnimationFrame(frame)
    }
    setExpanded(false)
    stop()
    const timer = setTimeout(() => setMounted(false), 700)
    return () => clearTimeout(timer)
  }, [camera])

  // Start the camera once the rectangle is on its way
  useEffect(() => {
    if (!camera || !expanded) return
    let cancelled = false
    const devices = navigator.mediaDevices
    // No camera API at all (an insecure page, an old browser): same as refused
    const request = devices?.getUserMedia
      ? devices.getUserMedia.bind(devices)
      : () => Promise.reject(new Error('No camera'))
    request({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop())
        stream.current = media
        // Selfie-style cameras show the mirror image, like the camera app
        setMirror(media.getVideoTracks()[0]?.getSettings().facingMode !== 'environment')
        if (video.current) {
          video.current.srcObject = media
          video.current.play().then(() => !cancelled && setLive(true)).catch(() => {})
        }
      })
      .catch(() => !cancelled && setNoCamera(true))
    return () => {
      cancelled = true
    }
  }, [camera, expanded])

  // Turn the camera off if she leaves Today while it's open
  useEffect(() => stop, [])

  useEffect(() => {
    if (!camera) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setState({ camera: null })
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [camera])

  const shoot = async () => {
    if (!target) return
    const frame = video.current
    let blob: Blob | null = null
    if (live && frame?.videoWidth) {
      // Crop the picture to the rectangle, the way it's shown
      const aspect = target.width / target.height
      let sw = frame.videoWidth
      let sh = frame.videoHeight
      if (sw / sh > aspect) sw = sh * aspect
      else sh = sw / aspect
      const sx = (frame.videoWidth - sw) / 2
      const sy = (frame.videoHeight - sh) / 2
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(Math.round(sw), 1600)
      canvas.height = Math.round(canvas.width / aspect)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (mirror) {
          ctx.translate(canvas.width, 0)
          ctx.scale(-1, 1)
        }
        ctx.drawImage(frame, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      }
    }
    const picked: Blob = blob ?? (await fetch(placeholderPhoto).then((response) => response.blob()))
    setFlash(true)
    await new Promise((resolve) => setTimeout(resolve, 160))
    const photo = new File([picked], 'prompt-photo.jpg', { type: picked.type || 'image/jpeg' })
    stop()
    setState({ capturePhoto: photo, camera: null, composing: false })
    navigate('capture')
  }

  const at = expanded ? target : origin
  return (
    <div ref={root} className={cx('absolute inset-0 z-40', mounted ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!mounted}>
      {mounted && at && target && (
        <>
          {/* Paper over the rest of Today, fading in as the circle grows */}
          <div
            className="absolute inset-0 bg-baton-paper transition-opacity duration-500 motion-reduce:transition-none"
            style={{ opacity: expanded ? 1 : 0 }}
          />

          {/* The prompt, sliding up from the middle of the circle to the top */}
          <div
            className="absolute left-1/2 z-10 motion-reduce:transition-none"
            style={{
              width: promptWidth,
              top: expanded ? promptTop : origin!.top + origin!.height / 2 + 4,
              transform: `translate(-50%, ${expanded ? '0%' : '-50%'})`,
              transition: `top 650ms ${ease}, transform 650ms ${ease}`,
            }}
          >
            <p
              className="text-balance text-center font-display font-medium leading-[1.1] tracking-[-0.011em] text-baton-navy"
              style={{ fontSize: promptFont }}
            >
              {prompt.question}
            </p>
          </div>

          {/* The circle, morphing into the rounded rectangle with the camera in it */}
          <div
            className="absolute overflow-hidden bg-baton-paper motion-reduce:transition-none"
            style={{
              left: at.left,
              top: at.top,
              width: at.width,
              height: at.height,
              borderRadius: at.radius,
              transition: `left 650ms ${ease}, top 650ms ${ease}, width 650ms ${ease}, height 650ms ${ease}, border-radius 650ms ${ease}`,
            }}
          >
            {/* The live camera, or a photo when there isn't one */}
            <img
              src={placeholderPhoto}
              alt=""
              className={cx('absolute inset-0 size-full object-cover transition-opacity duration-500', noCamera ? 'opacity-100' : 'opacity-0')}
            />
            <video
              ref={video}
              playsInline
              muted
              autoPlay
              className={cx('absolute inset-0 size-full object-cover transition-opacity duration-500', live ? 'opacity-100' : 'opacity-0')}
              style={{ transform: mirror ? 'scaleX(-1)' : undefined }}
            />
            {/* The glass look: a blue rim fading inward, over the picture */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: 'inherit',
                boxShadow: 'inset 0 0 30px 6px rgb(89 161 255 / 0.5), inset 0 1px 2px rgb(255 255 255 / 0.9)',
              }}
            />
            <div className={cx('pointer-events-none absolute inset-0 bg-white transition-opacity duration-200', flash ? 'opacity-90' : 'opacity-0')} />
          </div>

          {/* Close, top left */}
          <button
            type="button"
            aria-label="Close camera"
            onClick={() => setState({ camera: null })}
            className="absolute right-[30px] top-[54px] flex size-10 items-center justify-center rounded-full bg-white text-baton-navy shadow-md transition-opacity duration-300 active:scale-95 motion-reduce:transition-none"
            style={{ opacity: expanded ? 1 : 0, transitionDelay: expanded ? '300ms' : '0ms', pointerEvents: expanded ? 'auto' : 'none' }}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {/* The shutter */}
          <button
            type="button"
            aria-label="Take photo"
            onClick={shoot}
            className="group absolute left-1/2 flex size-20 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-baton-blue/40 transition-opacity duration-300 motion-reduce:transition-none"
            style={{ top: target.top + target.height + 28, opacity: expanded ? 1 : 0, transitionDelay: expanded ? '320ms' : '0ms', pointerEvents: expanded ? 'auto' : 'none' }}
          >
            <span className="size-16 rounded-full bg-baton-blue transition-transform duration-150 group-active:scale-90" />
          </button>
        </>
      )}
    </div>
  )
}
