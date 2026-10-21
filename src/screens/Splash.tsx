import { useEffect, useRef } from 'react'
import { navigate } from '../app/navigate'
import { splash } from '../data/onboarding'

// Chrome on a Mac draws <video> through its own color path, so the video's
// blue comes out a shade off the page's and shows as a square. Copying each
// frame onto a canvas keeps it in the same colors as the page.
function SplashVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const v = video.current
    const ctx = canvas.current?.getContext('2d')
    if (!v || !ctx) return
    let frame = 0
    const draw = () => {
      if (v.readyState >= 2) ctx.drawImage(v, 0, 0, ctx.canvas.width, ctx.canvas.height)
      if (!v.paused && !v.ended) frame = requestAnimationFrame(draw)
    }
    const start = () => {
      cancelAnimationFrame(frame)
      draw()
    }
    v.addEventListener('loadeddata', draw)
    v.addEventListener('play', start)
    v.addEventListener('ended', draw)
    return () => {
      cancelAnimationFrame(frame)
      v.removeEventListener('loadeddata', draw)
      v.removeEventListener('play', start)
      v.removeEventListener('ended', draw)
    }
  }, [])

  return (
    <>
      <canvas ref={canvas} width={512} height={512} className="onboarding-welcome-video" aria-hidden />
      <video ref={video} src={src} autoPlay muted playsInline preload="auto" className="onboarding-welcome-source" aria-hidden />
    </>
  )
}

export function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => navigate('today'), 2600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button type="button" onClick={() => navigate('today')} className="onboarding-step onboarding-welcome" aria-label="Welcome to Baton. Next: Today">
      <div className="onboarding-welcome-content">
        {splash.video ? <SplashVideo src={splash.video} /> : <img className="onboarding-welcome-video" src={splash.poster} alt="" />}
        <h1 className="onboarding-welcome-title">{splash.welcome}</h1>
      </div>
    </button>
  )
}
