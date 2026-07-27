import { memo, type ChangeEvent } from 'react'

interface PhotoUploadFieldProps {
  id: string
  label: string
  hint: string
  imageUrl: string
  feedback: string
  removeLabel: string
  onPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onRemovePhoto: () => void
}

export const PhotoUploadField = memo(function PhotoUploadField({
  id,
  label,
  hint,
  imageUrl,
  feedback,
  removeLabel,
  onPhotoUpload,
  onRemovePhoto,
}: PhotoUploadFieldProps) {
  return (
    <>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <input id={id} type="file" accept="image/*" onChange={onPhotoUpload} />
      <div className="photo-actions-row">
        <p className="field-hint">{hint}</p>
        {imageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemovePhoto}>
            {removeLabel}
          </button>
        ) : null}
      </div>
      {feedback ? <p className="field-hint upload-feedback">{feedback}</p> : null}
    </>
  )
})
