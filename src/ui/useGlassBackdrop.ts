import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

// WebGL cannot sample DOM pixels. Rasterize the page below the glass when its
// content changes, then let the shader sample that texture on every drag frame.
// Scrolling the whole page moves the scene and lens together; nested scrollers
// need a fresh raster because their contents move relative to the lens.
export function useGlassBackdrop(
  overlay: RefObject<HTMLDivElement | null>,
  width: number,
  height: number,
  enabled: boolean,
) {
  const [backdrop, setBackdrop] = useState<HTMLCanvasElement>()

  useEffect(() => {
    const element = overlay.current
    const scene = element?.closest<HTMLElement>('[data-glass-scene]')
    if (!enabled || !element || !scene) return
    let alive = true
    let busy = false
    let dirty = false
    let timer = 0

    const capture = async () => {
      if (busy) {
        dirty = true
        return
      }
      busy = true
      try {
        const { default: html2canvas } = await import('html2canvas-pro')
        await document.fonts.ready
        if (!alive) return
        const scale = 2
        const page = await html2canvas(scene, {
          scale,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          onclone: (_document, clone) => {
            // The desktop phone frame is scaled to fit the window. Capture in
            // its original layout coordinates, matching the lens's artwork.
            for (let parent = clone.parentElement; parent; parent = parent.parentElement) {
              parent.style.transform = 'none'
              parent.style.overflow = 'visible'
            }
          },
        })
        if (!alive) return
        const sceneRect = scene.getBoundingClientRect()
        const lensRect = element.getBoundingClientRect()
        const layoutScale = scene.offsetWidth / sceneRect.width
        const x = (lensRect.left - sceneRect.left) * layoutScale
        const y = (lensRect.top - sceneRect.top) * layoutScale
        const canvas = document.createElement('canvas')
        canvas.width = Math.ceil(width * scale)
        canvas.height = Math.ceil(height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(page, -x * scale, -y * scale)
        setBackdrop(canvas)
      } catch (error) {
        // The lens still renders its prompt if a page image cannot be captured.
        console.warn('Unable to refresh the glass backdrop', error)
      } finally {
        busy = false
        if (alive && dirty) {
          dirty = false
          schedule()
        }
      }
    }
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => void capture(), 120)
    }
    const mutations = new MutationObserver((records) => {
      if (records.some(({ target }) => {
        const node = target instanceof Element ? target : target.parentElement
        return !node?.closest('[data-glass-overlay]')
      })) schedule()
    })
    mutations.observe(scene, { subtree: true, childList: true, characterData: true, attributes: true })
    const resize = new ResizeObserver(schedule)
    resize.observe(scene)
    scene.addEventListener('load', schedule, true)
    scene.addEventListener('scroll', schedule, true)
    schedule()
    return () => {
      alive = false
      window.clearTimeout(timer)
      mutations.disconnect()
      resize.disconnect()
      scene.removeEventListener('load', schedule, true)
      scene.removeEventListener('scroll', schedule, true)
    }
  }, [overlay, width, height, enabled])

  return enabled ? backdrop : undefined
}
