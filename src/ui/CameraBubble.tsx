import { useEffect, useRef, useState } from 'react'
import { navigate } from '../app/navigate'
import { setState, useDailyPrompt, useStore } from '../app/store'
import { cx } from './cx'
import { BackButton } from './BackButton'

// What the camera shows when there's no camera to use (a laptop without one, or
// permission refused), so the flow still works when recording the demo.
const placeholderPhoto = '/archive/la-sunset.jpg'

// The same iOS-like curve the tab bar morph uses
const ease = 'cubic-bezier(0.32, 0.72, 0, 1)'

// Where the rectangle ends up, as fractions of the 820pt under the status bar
// (Figma camera 494:2163: the prompt on top, a 329×482pt camera rectangle
// 162pt down, the shutter below). It grows out of the circle, so its center
// moves down a little as it does.
const rectTop = 162 / 820
const rectHeight = 482 / 820
const sideMargin = 36
const rectRadius = 52
const promptTop = 62
// How long the circle takes to become the rectangle
const morphMs = 650
// The prompt starts exactly as the glass shows it (see drawPrompt in
// PromptWindow: same font, line breaks and spot, magnified by the lens about
// 1.08x around its center), then slides up and settles a little smaller and
// tighter than that (Keller, Oct 21: slightly smaller, more compact)
const lensZoom = 1.08
const promptSettle = 0.96

type PromptLayout = { lines: string[]; font: number; lineHeight: number; top: number }

// Line breaks and size of the prompt the way PromptWindow's drawPrompt sets
// them (kept in step with it by hand): regular weight, up to three lines, 23pt
// shrinking to 18pt, balanced, in a column 110pt narrower than the glass; and
// where its block's top sits relative to the circle's center, under the icon.
function promptLayout(question: string, size: number, centerY: number): PromptLayout {
  const ctx = document.createElement('canvas').getContext('2d')!
  const family = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
  const wrapAt = (width: number) => {
    const out: string[] = []
    let line = ''
    for (const word of question.split(' ')) {
      const next = line ? `${line} ${word}` : word
      if (line && ctx.measureText(next).width > width) {
        out.push(line)
        line = word
      } else line = next
    }
    if (line) out.push(line)
    return out
  }
  const balanced = (maxWidth: number) => {
    let lines = wrapAt(maxWidth)
    for (let width = maxWidth; width > maxWidth * 0.6; width -= 4) {
      const tighter = wrapAt(width)
      if (tighter.length > lines.length) break
      lines = tighter
    }
    return lines
  }
  // PROMPT_SIZE in PromptWindow
  let font = 23
  let lines: string[] = []
  for (; font >= 18; font--) {
    ctx.font = `400 ${font}px ${family}`
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${-0.011 * font}px`
    lines = balanced(size - 110)
    if (lines.length <= 3) break
  }
  font = Math.max(font, 18)
  const lineHeight = Math.round(font * 1.2)
  const iconSize = 24
  const iconGap = 16
  const groupHeight = iconSize + iconGap + lines.length * lineHeight
  const top = centerY - groupHeight / 2 + iconSize + iconGap - size * 0.035
  return { lines, font, lineHeight, top }
}

type Box = { left: number; top: number; width: number; height: number; radius: number }

// The shape as a clip over the whole screen, so the morph only repaints: the
// camera underneath stays the rectangle's size the whole time instead of being
// resized every frame
const clipTo = (box: Box, width: number, height: number) =>
  `inset(${box.top}px ${width - box.left - box.width}px ${height - box.top - box.height}px ${box.left}px round ${box.radius}px)`

// Tapping the prompt's circle on Today opens the camera inside the app
// (always the live camera, Keller Oct 21; the green screen is gone):
// the circle morphs into a rounded rectangle with the live camera in it, the
// prompt moves to the top, and a round button below takes the photo, which goes
// on to the sticky-note reflection page. A small close button at the top left goes back.
export function CameraBubble() {
  const { camera, realLife } = useStore()
  const prompt = useDailyPrompt()
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  // The rounded rectangle the camera shows in
  const picture = useRef<HTMLDivElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [origin, setOrigin] = useState<Box | null>(null)
  const [target, setTarget] = useState<Box | null>(null)
  const [text, setText] = useState<PromptLayout | null>(null)
  const [screen, setScreen] = useState({ width: 0, height: 0 })
  // The rectangle has finished growing, so the camera can fade in without
  // competing with the morph
  const [settled, setSettled] = useState(false)
  const [live, setLive] = useState(false)
  const [mirror, setMirror] = useState(false)
  const [flash, setFlash] = useState(false)
  // No camera to use: show the stand-in photo instead
  const [noCamera, setNoCamera] = useState(false)
  // Which camera: the back one first, flipped to the front one on phones
  const [facing, setFacing] = useState<'environment' | 'user'>('environment')
  // A phone with more than one camera, so the flip button shows
  const [canFlip, setCanFlip] = useState(false)
  const library = useRef<HTMLInputElement>(null)
  // While flipping, the last frame holds still over the camera: iOS briefly
  // draws the new stream at its own size, unclipped, before it fits the
  // rectangle (Keller, Oct 21)
  const still = useRef<HTMLCanvasElement>(null)
  const [switching, setSwitching] = useState(false)

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
      setText(promptLayout(prompt.question, size, (camera.cy - bounds.top) / scale))
      setScreen({ width: box.offsetWidth, height: box.offsetHeight })
      setTarget({
        left: sideMargin,
        top: Math.round(box.offsetHeight * rectTop),
        width: box.offsetWidth - sideMargin * 2,
        height: Math.round(box.offsetHeight * rectHeight),
        radius: rectRadius,
      })
      setMounted(true)
      setExpanded(false)
      setSettled(false)
      setNoCamera(false)
      setFacing('environment')
      // One frame on the circle first, so the move is animated
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setExpanded(true))
      })
      const timer = setTimeout(() => setSettled(true), morphMs + 40)
      return () => {
        cancelAnimationFrame(frame)
        clearTimeout(timer)
      }
    }
    setExpanded(false)
    setSettled(false)
    stop()
    const timer = setTimeout(() => setMounted(false), morphMs + 50)
    return () => clearTimeout(timer)
  }, [camera, prompt.question])

  // Ask for the camera straight away, so it's warmed up by the time the
  // rectangle has grown; it only shows once it has (settled)
  useEffect(() => {
    if (!camera) return
    let cancelled = false
    // Flipping: let go of the other camera first
    stream.current?.getTracks().forEach((track) => track.stop())
    const devices = navigator.mediaDevices
    // No camera API at all (an insecure page, an old browser): same as refused
    const request = devices?.getUserMedia
      ? devices.getUserMedia.bind(devices)
      : () => Promise.reject(new Error('No camera'))
    request({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 1600 } }, audio: false })
      .then((media) => {
        if (cancelled) return media.getTracks().forEach((track) => track.stop())
        stream.current = media
        // Selfie-style cameras show the mirror image, like the camera app
        setMirror(media.getVideoTracks()[0]?.getSettings().facingMode !== 'environment')
        // Only on phones (a touch screen with more than one camera)
        if (matchMedia('(pointer: coarse)').matches) {
          devices
            .enumerateDevices()
            .then((all) => !cancelled && setCanFlip(all.filter((device) => device.kind === 'videoinput').length > 1))
            .catch(() => {})
        }
        // The video mounts with the shape, which can be a frame after an
        // already-granted camera answers
        const attach = () => {
          if (cancelled) return
          if (!video.current) return requestAnimationFrame(attach)
          video.current.srcObject = media
          const shown = video.current
          shown
            .play()
            .then(() => {
              if (cancelled) return
              setLive(true)
              // Let go of the still frame once the new camera has drawn a frame
              // at its settled size
              const reveal = () => setTimeout(() => !cancelled && setSwitching(false), 120)
              if ('requestVideoFrameCallback' in shown) shown.requestVideoFrameCallback(() => reveal())
              else reveal()
            })
            .catch(() => {})
        }
        attach()
      })
      .catch(() => {
        if (cancelled) return
        setNoCamera(true)
        setSwitching(false)
      })
    return () => {
      cancelled = true
    }
  }, [camera, facing])

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
    finish(new File([picked], 'prompt-photo.jpg', { type: picked.type || 'image/jpeg' }))
  }

  // The photo, taken or picked from her library, goes on to be saved
  const finish = (photo: File) => {
    stop()
    // Where the picture is, so the reflection page can turn it into its orb
    const shown = picture.current?.getBoundingClientRect()
    const captureFrom = shown ? { x: shown.left, y: shown.top, width: shown.width, height: shown.height } : null
    setState({ capturePhoto: photo, camera: null, composing: false, captureFrom })
    // Always on to the sticky note, where what it's about is read (Keller,
    // Oct 21: never the old Capture page)
    navigate('reflection')
  }

  // Freeze the current frame over the camera, then switch to the other one
  const flip = () => {
    const frame = video.current
    const canvas = still.current
    if (live && frame?.videoWidth && canvas) {
      canvas.width = frame.videoWidth
      canvas.height = frame.videoHeight
      canvas.style.transform = mirror ? 'scaleX(-1)' : ''
      canvas.getContext('2d')?.drawImage(frame, 0, 0)
      setSwitching(true)
    }
    setFacing((side) => (side === 'environment' ? 'user' : 'environment'))
  }

  const at = expanded ? target : origin
  const curve = `${morphMs}ms ${ease}`
  return (
    <div ref={root} className={cx('absolute inset-0 z-40', mounted ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!mounted}>
      {mounted && at && target && (
        <>
          {/* Paper over the rest of Today, fading in as the circle grows */}
          <div
            className="absolute inset-0 bg-baton-paper transition-opacity duration-500 motion-reduce:transition-none"
            style={{ opacity: expanded ? 1 : 0 }}
          />

          {/* The prompt: set exactly where the glass shows it, then it slides up
              and settles a little smaller while the circle becomes the rectangle.
              Moved with a transform only, so it stays smooth */}
          {text && origin && (
            <div
              className="absolute top-0 left-0 z-10 will-change-transform motion-reduce:transition-none"
              style={{
                transform: expanded
                  ? `translate(${screen.width / 2}px, ${promptTop}px) translateX(-50%) scale(${promptSettle})`
                  : `translate(${origin.left + origin.width / 2}px, ${origin.top + origin.height / 2 + (text.top - origin.top - origin.height / 2) * lensZoom}px) translateX(-50%) scale(${lensZoom})`,
                transformOrigin: '50% 0',
                transition: `transform ${curve}`,
              }}
            >
              <p
                className="whitespace-nowrap text-center font-display font-normal tracking-[-0.011em] text-baton-navy"
                style={{ fontSize: text.font, lineHeight: `${text.lineHeight}px` }}
              >
                {text.lines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* The circle, morphing into the rounded rectangle with the camera in it.
              The layer covers the screen and only its clip changes, from the
              circle to the rectangle; the camera inside is already the
              rectangle's size */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Close camera"
            // Tapping the rectangle closes the camera and goes back to Today
            // (Keller, Oct 19)
            onClick={() => expanded && setState({ camera: null })}
            onKeyDown={(event) => event.key === 'Enter' && expanded && setState({ camera: null })}
            className="absolute inset-0 cursor-pointer bg-baton-paper motion-reduce:transition-none"
            style={{ clipPath: clipTo(at, screen.width, screen.height), transition: `clip-path ${curve}` }}
          >
            <div
              ref={picture}
              // Its own layer with a mask, so iOS clips the video to the corners
              className="absolute isolate overflow-hidden"
              style={{
                left: target.left,
                top: target.top,
                width: target.width,
                height: target.height,
                borderRadius: target.radius,
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                transform: 'translateZ(0)',
              }}
            >
              {/* The live camera, or a photo when there isn't one, faded in once
                  the rectangle has grown */}
              <img
                src={placeholderPhoto}
                alt=""
                className={cx('absolute inset-0 size-full object-cover transition-opacity duration-500', noCamera && settled ? 'opacity-100' : 'opacity-0')}
              />
              <video
                ref={video}
                playsInline
                muted
                autoPlay
                className={cx(
                  'absolute inset-0 size-full object-cover',
                  // Hidden at once while flipping, faded back in after
                  switching ? 'opacity-0' : 'transition-opacity duration-500',
                  live && settled && !switching ? 'opacity-100' : 'opacity-0',
                )}
                style={{ transform: mirror ? 'scaleX(-1)' : undefined }}
              />
              <canvas
                ref={still}
                className={cx('absolute inset-0 size-full object-cover', switching ? 'opacity-100' : 'opacity-0 transition-opacity duration-300')}
              />
              <div className={cx('pointer-events-none absolute inset-0 bg-white transition-opacity duration-200', flash ? 'opacity-90' : 'opacity-0')} />
            </div>
          </div>

          {/* Real-life only: a way back to Today without tapping the picture */}
          {realLife && (
            <div
              className="absolute top-1 left-4 z-10 transition-opacity duration-300"
              style={{ opacity: expanded ? 1 : 0, pointerEvents: expanded ? 'auto' : 'none' }}
            >
              <BackButton onClick={() => setState({ camera: null })} label="Back to Today" />
            </div>
          )}

          {/* Her photo library on the left, the shutter, and flipping the camera
              on the right (phones only; Keller, Oct 21) */}
          <div
            className="absolute inset-x-0 flex items-center justify-center gap-10 transition-opacity duration-300 motion-reduce:transition-none"
            style={{ bottom: 56, opacity: expanded ? 1 : 0, transitionDelay: expanded ? '320ms' : '0ms', pointerEvents: expanded ? 'auto' : 'none' }}
          >
            <button
              type="button"
              aria-label="Choose from library"
              onClick={() => library.current?.click()}
              className="flex size-12 items-center justify-center rounded-full text-baton-blue transition-transform duration-150 active:scale-90"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <circle cx="8.5" cy="10" r="1.6" />
                <path d="M21 15.5l-5-5-8.5 8.5" />
              </svg>
            </button>
            <input
              ref={library}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) finish(file)
              }}
            />
            <button
              type="button"
              aria-label="Take photo"
              onClick={shoot}
              className="group flex size-20 items-center justify-center rounded-full border-[3px] border-baton-blue/40"
            >
              <span className="size-16 rounded-full bg-baton-blue transition-transform duration-150 group-active:scale-90" />
            </button>
            {/* Holds the shutter in the middle when there's nothing to flip */}
            <button
              type="button"
              aria-label="Flip camera"
              onClick={flip}
              className={cx(
                'flex size-12 items-center justify-center rounded-full text-baton-blue transition-transform duration-150 active:scale-90',
                !canFlip && 'invisible',
              )}
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5" />
                <path d="M20 4v4.5h-4.5" />
                <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5" />
                <path d="M4 20v-4.5h4.5" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
