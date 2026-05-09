import type { ChangeEvent } from 'react'

type WorkshopMediaFieldsProps = {
  isDualSpeaker: boolean
  onRemovePartnerLogo: () => void
  onRemoveSpeakerPhoto: () => void
  onRemoveSecondSpeakerPhoto: () => void
  onPartnerLogoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerNameChange: (value: string) => void
  onSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerRoleChange: (value: string) => void
  onSecondSpeakerNameChange: (value: string) => void
  onSecondSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSecondSpeakerRoleChange: (value: string) => void
  partnerLogoFeedback: string
  partnerLogoUrl: string
  photoFeedback: string
  secondPhotoFeedback: string
  secondSpeakerImageUrl: string
  secondSpeakerName: string
  secondSpeakerRole: string
  speakerImageUrl: string
  speakerName: string
  speakerRole: string
}

export function WorkshopMediaFields({
  isDualSpeaker,
  onRemovePartnerLogo,
  onRemoveSpeakerPhoto,
  onRemoveSecondSpeakerPhoto,
  onPartnerLogoUpload,
  onSpeakerNameChange,
  onSpeakerPhotoUpload,
  onSpeakerRoleChange,
  onSecondSpeakerNameChange,
  onSecondSpeakerPhotoUpload,
  onSecondSpeakerRoleChange,
  partnerLogoFeedback,
  partnerLogoUrl,
  photoFeedback,
  secondPhotoFeedback,
  secondSpeakerImageUrl,
  secondSpeakerName,
  secondSpeakerRole,
  speakerImageUrl,
  speakerName,
  speakerRole,
}: WorkshopMediaFieldsProps) {
  return (
    <section className="control-section muted-card">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true" />
        <p className="section-label">Palestrante</p>
      </div>

      <label className="field-label" htmlFor="workshop-speaker-name">
        Nome da palestrante
      </label>
      <input
        id="workshop-speaker-name"
        type="text"
        value={speakerName}
        onChange={(event) => onSpeakerNameChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-speaker-role">
        Cargo
      </label>
      <input
        id="workshop-speaker-role"
        type="text"
        value={speakerRole}
        onChange={(event) => onSpeakerRoleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-speaker-photo-upload">
        Foto da palestrante
      </label>
      <input
        id="workshop-speaker-photo-upload"
        type="file"
        accept="image/*"
        onChange={onSpeakerPhotoUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          Upload de imagem com ate 8 MB. Se ficar vazio, a preview usa placeholder com iniciais.
        </p>
        {speakerImageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemoveSpeakerPhoto}>
            Remover foto
          </button>
        ) : null}
      </div>
      {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}

      {isDualSpeaker ? (
        <>
          <label className="field-label" htmlFor="workshop-second-speaker-name">
            Nome da segunda palestrante
          </label>
          <input
            id="workshop-second-speaker-name"
            type="text"
            value={secondSpeakerName}
            onChange={(event) => onSecondSpeakerNameChange(event.target.value)}
          />

          <label className="field-label" htmlFor="workshop-second-speaker-role">
            Cargo da segunda palestrante
          </label>
          <input
            id="workshop-second-speaker-role"
            type="text"
            value={secondSpeakerRole}
            onChange={(event) => onSecondSpeakerRoleChange(event.target.value)}
          />

          <label className="field-label" htmlFor="workshop-second-speaker-photo-upload">
            Foto da segunda palestrante
          </label>
          <input
            id="workshop-second-speaker-photo-upload"
            type="file"
            accept="image/*"
            onChange={onSecondSpeakerPhotoUpload}
          />
          <div className="photo-actions-row">
            <p className="field-hint">
              A segunda foto usa a mesma moldura com tamanho reduzido para acomodar os dois perfis.
            </p>
            {secondSpeakerImageUrl ? (
              <button type="button" className="secondary-inline-action" onClick={onRemoveSecondSpeakerPhoto}>
                Remover segunda foto
              </button>
            ) : null}
          </div>
          {secondPhotoFeedback ? <p className="field-hint upload-feedback">{secondPhotoFeedback}</p> : null}
        </>
      ) : null}

      <label className="field-label" htmlFor="workshop-partner-logo-upload">
        Marca parceira
      </label>
      <input
        id="workshop-partner-logo-upload"
        type="file"
        accept="image/*"
        onChange={onPartnerLogoUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          A marca parceira aparece ao lado da WoMakers no footer e se ajusta proporcionalmente.
        </p>
        {partnerLogoUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemovePartnerLogo}>
            Remover marca
          </button>
        ) : null}
      </div>
      {partnerLogoFeedback ? <p className="field-hint upload-feedback">{partnerLogoFeedback}</p> : null}
    </section>
  )
}