import type { ChangeEvent } from 'react'

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
        Funcao
      </label>
      <input
        id="quote-role"
        type="text"
        value={speakerRole}
        onChange={(event) => onSpeakerRoleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="quote-image-upload">
        Foto da aluna
      </label>
      <input
        id="quote-image-upload"
        type="file"
        accept="image/*"
        onChange={onSpeakerPhotoUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          Upload de imagem com ate 8 MB. A foto aparece arredondada acima do bloco do depoimento.
        </p>
        {speakerImageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemoveSpeakerPhoto}>
            Remover foto
          </button>
        ) : null}
      </div>
      {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}

      <label className="field-label" htmlFor="quote-background-upload">
        Imagem de fundo
      </label>
      <input
        id="quote-background-upload"
        type="file"
        accept="image/*"
        onChange={onQuoteBackgroundUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          A imagem cobre o fundo do banner e recebe o layer oficial por cima para manter o enquadramento.
        </p>
        {quoteBackgroundImageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemoveQuoteBackground}>
            Remover fundo
          </button>
        ) : null}
      </div>
      {quoteBackgroundFeedback ? <p className="field-hint upload-feedback">{quoteBackgroundFeedback}</p> : null}
    </section>
  )
}