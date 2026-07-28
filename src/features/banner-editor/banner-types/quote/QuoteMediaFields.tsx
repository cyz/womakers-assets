import type { ChangeEvent } from 'react'
import { PhotoUploadField } from '../../components/PhotoUploadField'

type QuoteMediaFieldsProps = {
  onRemoveSpeakerPhoto: () => void
  onSpeakerNameChange: (value: string) => void
  onSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerRoleChange: (value: string) => void
  photoFeedback: string
  speakerImageUrl: string
  speakerName: string
  speakerRole: string
}

export function QuoteMediaFields({
  onRemoveSpeakerPhoto,
  onSpeakerNameChange,
  onSpeakerPhotoUpload,
  onSpeakerRoleChange,
  photoFeedback,
  speakerImageUrl,
  speakerName,
  speakerRole,
}: QuoteMediaFieldsProps) {
  return (
    <section className="control-section muted-card">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true" />
        <p className="section-label">Autoria e foto</p>
      </div>

      <label className="field-label" htmlFor="quote-name">
        Nome
      </label>
      <input
        id="quote-name"
        type="text"
        value={speakerName}
        onChange={(event) => onSpeakerNameChange(event.target.value)}
      />

      <label className="field-label" htmlFor="quote-role">
        Função
      </label>
      <input
        id="quote-role"
        type="text"
        value={speakerRole}
        onChange={(event) => onSpeakerRoleChange(event.target.value)}
      />

      <PhotoUploadField
        id="quote-image-upload"
        label="Foto da aluna"
        hint="Upload de imagem com até 8 MB. Prefira uma foto horizontal ou com espaço ao redor da pessoa."
        imageUrl={speakerImageUrl}
        feedback={photoFeedback}
        removeLabel="Remover foto"
        onPhotoUpload={onSpeakerPhotoUpload}
        onRemovePhoto={onRemoveSpeakerPhoto}
      />
    </section>
  )
}