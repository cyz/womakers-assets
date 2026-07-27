import type { ChangeEvent } from 'react'
import { PhotoUploadField } from '../../components/PhotoUploadField'

type QuoteMediaFieldsProps = {
  onQuoteBackgroundUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onRemoveQuoteBackground: () => void
  onRemoveSpeakerPhoto: () => void
  onSpeakerNameChange: (value: string) => void
  onSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerRoleChange: (value: string) => void
  photoFeedback: string
  quoteBackgroundFeedback: string
  quoteBackgroundImageUrl: string
  speakerImageUrl: string
  speakerName: string
  speakerRole: string
}

export function QuoteMediaFields({
  onQuoteBackgroundUpload,
  onRemoveQuoteBackground,
  onRemoveSpeakerPhoto,
  onSpeakerNameChange,
  onSpeakerPhotoUpload,
  onSpeakerRoleChange,
  photoFeedback,
  quoteBackgroundFeedback,
  quoteBackgroundImageUrl,
  speakerImageUrl,
  speakerName,
  speakerRole,
}: QuoteMediaFieldsProps) {
  return (
    <section className="control-section muted-card">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true" />
        <p className="section-label">Autoria e background</p>
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
        hint="Upload de imagem com até 8 MB. A foto aparece arredondada acima do bloco do depoimento."
        imageUrl={speakerImageUrl}
        feedback={photoFeedback}
        removeLabel="Remover foto"
        onPhotoUpload={onSpeakerPhotoUpload}
        onRemovePhoto={onRemoveSpeakerPhoto}
      />

      <PhotoUploadField
        id="quote-background-upload"
        label="Imagem de fundo"
        hint="A imagem cobre o fundo do banner e recebe o layer oficial por cima para manter o enquadramento."
        imageUrl={quoteBackgroundImageUrl}
        feedback={quoteBackgroundFeedback}
        removeLabel="Remover fundo"
        onPhotoUpload={onQuoteBackgroundUpload}
        onRemovePhoto={onRemoveQuoteBackground}
      />
    </section>
  )
}