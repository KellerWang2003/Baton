import { useEffect, useRef, useState } from 'react'
import { goBack } from '../app/navigate'
import { setState, useDailyPrompt, useStore } from '../app/store'
import { pages } from '../data/pages'
import { CameraIcon, ListSection, Screen, TextArea, VisibilityBadge } from '../ui'

const copy = pages.capture

// Pushed page (no tab bar) for answering today's prompt: add photos and/or
// write a short reflection. Photo prompts open the camera first, then review here.
// Nothing is stored yet; Save just goes back.
export function Capture() {
  const dailyPrompt = useDailyPrompt()
  const { capturePhoto } = useStore()
  const [photos, setPhotos] = useState<File[]>(() => capturePhoto ? [capturePhoto] : [])
  const [text, setText] = useState('')
  useEffect(() => () => setState({ capturePhoto: null }), [])

  const addPhotos = (files: FileList | null) => {
    if (!files) return
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'))
    setPhotos((current) => [...current, ...images])
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, i) => i !== index))
  }

  const canSave = photos.length > 0 || text.trim().length > 0
  const save = (
    <button
      type="button"
      onClick={() => goBack()}
      disabled={!canSave}
      className="px-2 py-1 text-body font-medium text-brand active:opacity-50 disabled:text-ink-muted"
    >
      Save
    </button>
  )

  return (
    <Screen title={copy.title} onBack action={save}>
      <div className="flex flex-col gap-6 pt-2">
        <div className="flex flex-col gap-1 px-1" data-stage="moving">
          <p className="text-footnote font-medium text-stage">{dailyPrompt.seed}</p>
          <p className="text-title-3 font-medium text-ink">{dailyPrompt.question}</p>
        </div>

        <ListSection header={copy.photosLabel}>
          <div className="grid grid-cols-3 gap-2 p-2">
            {photos.map((photo, index) => (
              <div key={`${photo.name}-${photo.lastModified}-${index}`} className="relative aspect-square overflow-hidden rounded-tile bg-surface-muted">
                <PhotoPreview photo={photo} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label="Remove photo"
                  className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-scrim text-caption text-on-brand"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-tile bg-surface-muted text-brand active:opacity-70">
              <CameraIcon />
              <span className="text-footnote font-medium">{copy.addPhotos}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addPhotos(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
          </div>
        </ListSection>

        <TextArea
          label={copy.reflectionLabel}
          placeholder={copy.reflectionPlaceholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <div className="flex flex-col items-start gap-1.5 px-4">
          <VisibilityBadge visibility="private" />
          <p className="text-footnote text-ink-muted">{copy.privacyNote}</p>
        </div>
      </div>
    </Screen>
  )
}

function PhotoPreview({ photo }: { photo: File }) {
  const image = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const preview = URL.createObjectURL(photo)
    if (image.current) image.current.src = preview
    return () => URL.revokeObjectURL(preview)
  }, [photo])
  return <img ref={image} alt="Photo for today's prompt" className="size-full object-cover" />
}
