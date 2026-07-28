import type { ChangeEvent } from 'react'
import { PhotoUploadField } from '../../components/PhotoUploadField'

type WorkshopMediaFieldsProps = {
  onRemovePartnerLogo: () => void
  onRemoveSpeakerPhoto: () => void
  onRemoveSecondSpeakerPhoto: () => void
  onRemoveThirdSpeakerPhoto: () => void
  onRemoveFourthSpeakerPhoto: () => void
  onPartnerLogoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerCountChange: (value: number) => void
  onSpeakerNameChange: (value: string) => void
  onSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSpeakerRoleChange: (value: string) => void
  onSecondSpeakerNameChange: (value: string) => void
  onSecondSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onSecondSpeakerRoleChange: (value: string) => void
  onThirdSpeakerNameChange: (value: string) => void
  onThirdSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onThirdSpeakerRoleChange: (value: string) => void
  onFourthSpeakerNameChange: (value: string) => void
  onFourthSpeakerPhotoUpload: (event: ChangeEvent<HTMLInputElement>) => void
  onFourthSpeakerRoleChange: (value: string) => void
  partnerLogoFeedback: string
  partnerLogoUrl: string
  photoFeedback: string
  secondPhotoFeedback: string
  secondSpeakerImageUrl: string
  secondSpeakerName: string
  secondSpeakerRole: string
  speakerCount: number
  speakerImageUrl: string
  speakerName: string
  speakerRole: string
  thirdPhotoFeedback: string
  thirdSpeakerImageUrl: string
  thirdSpeakerName: string
  thirdSpeakerRole: string
  fourthPhotoFeedback: string
  fourthSpeakerImageUrl: string
  fourthSpeakerName: string
  fourthSpeakerRole: string
}

export function WorkshopMediaFields({
  onRemovePartnerLogo,
  onRemoveSpeakerPhoto,
  onRemoveSecondSpeakerPhoto,
  onRemoveThirdSpeakerPhoto,
  onRemoveFourthSpeakerPhoto,
  onPartnerLogoUpload,
  onSpeakerCountChange,
  onSpeakerNameChange,
  onSpeakerPhotoUpload,
  onSpeakerRoleChange,
  onSecondSpeakerNameChange,
  onSecondSpeakerPhotoUpload,
  onSecondSpeakerRoleChange,
  onThirdSpeakerNameChange,
  onThirdSpeakerPhotoUpload,
  onThirdSpeakerRoleChange,
  onFourthSpeakerNameChange,
  onFourthSpeakerPhotoUpload,
  onFourthSpeakerRoleChange,
  partnerLogoFeedback,
  partnerLogoUrl,
  photoFeedback,
  secondPhotoFeedback,
  secondSpeakerImageUrl,
  secondSpeakerName,
  secondSpeakerRole,
  speakerCount,
  speakerImageUrl,
  speakerName,
  speakerRole,
  thirdPhotoFeedback,
  thirdSpeakerImageUrl,
  thirdSpeakerName,
  thirdSpeakerRole,
  fourthPhotoFeedback,
  fourthSpeakerImageUrl,
  fourthSpeakerName,
  fourthSpeakerRole,
}: WorkshopMediaFieldsProps) {
  const clampedSpeakerCount = Math.min(Math.max(speakerCount ?? 1, 1), 4)
  const additionalSpeakers = [
    {
      key: 'second',
      ordinal: 'segunda',
      name: secondSpeakerName,
      role: secondSpeakerRole,
      imageUrl: secondSpeakerImageUrl,
      feedback: secondPhotoFeedback,
      onNameChange: onSecondSpeakerNameChange,
      onRoleChange: onSecondSpeakerRoleChange,
      onPhotoUpload: onSecondSpeakerPhotoUpload,
      onRemovePhoto: onRemoveSecondSpeakerPhoto,
    },
    {
      key: 'third',
      ordinal: 'terceira',
      name: thirdSpeakerName,
      role: thirdSpeakerRole,
      imageUrl: thirdSpeakerImageUrl,
      feedback: thirdPhotoFeedback,
      onNameChange: onThirdSpeakerNameChange,
      onRoleChange: onThirdSpeakerRoleChange,
      onPhotoUpload: onThirdSpeakerPhotoUpload,
      onRemovePhoto: onRemoveThirdSpeakerPhoto,
    },
    {
      key: 'fourth',
      ordinal: 'quarta',
      name: fourthSpeakerName,
      role: fourthSpeakerRole,
      imageUrl: fourthSpeakerImageUrl,
      feedback: fourthPhotoFeedback,
      onNameChange: onFourthSpeakerNameChange,
      onRoleChange: onFourthSpeakerRoleChange,
      onPhotoUpload: onFourthSpeakerPhotoUpload,
      onRemovePhoto: onRemoveFourthSpeakerPhoto,
    },
  ].slice(0, Math.max(clampedSpeakerCount - 1, 0))

  return (
    <section className="control-section muted-card">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true" />
        <p className="section-label">Imagens</p>
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

      <PhotoUploadField
        id="workshop-speaker-photo-upload"
        label="Foto da palestrante"
        hint="Upload de imagem com até 8 MB. Se ficar vazio, a preview usa placeholder com iniciais."
        imageUrl={speakerImageUrl}
        feedback={photoFeedback}
        removeLabel="Remover foto"
        onPhotoUpload={onSpeakerPhotoUpload}
        onRemovePhoto={onRemoveSpeakerPhoto}
      />

      {additionalSpeakers.map((speaker) => (
        <div key={speaker.key} className="workshop-extra-speaker">
          <label className="field-label" htmlFor={`workshop-${speaker.key}-speaker-name`}>
            Nome da {speaker.ordinal} palestrante
          </label>
          <input
            id={`workshop-${speaker.key}-speaker-name`}
            type="text"
            value={speaker.name}
            onChange={(event) => speaker.onNameChange(event.target.value)}
          />

          <label className="field-label" htmlFor={`workshop-${speaker.key}-speaker-role`}>
            Cargo da {speaker.ordinal} palestrante
          </label>
          <input
            id={`workshop-${speaker.key}-speaker-role`}
            type="text"
            value={speaker.role}
            onChange={(event) => speaker.onRoleChange(event.target.value)}
          />

          <PhotoUploadField
            id={`workshop-${speaker.key}-speaker-photo-upload`}
            label={`Foto da ${speaker.ordinal} palestrante`}
            hint="A foto usa a mesma moldura, ajustada proporcionalmente para acomodar todos os perfis."
            imageUrl={speaker.imageUrl}
            feedback={speaker.feedback}
            removeLabel="Remover foto"
            onPhotoUpload={speaker.onPhotoUpload}
            onRemovePhoto={speaker.onRemovePhoto}
          />
        </div>
      ))}

      <div className="workshop-speaker-count-actions">
        <button
          type="button"
          className="secondary-inline-action"
          disabled={clampedSpeakerCount <= 1}
          onClick={() => onSpeakerCountChange(Math.max(clampedSpeakerCount - 1, 1))}
        >
          Remover speaker
        </button>
        <button
          type="button"
          className="secondary-inline-action workshop-primary-add-action"
          disabled={clampedSpeakerCount >= 4}
          onClick={() => onSpeakerCountChange(Math.min(clampedSpeakerCount + 1, 4))}
        >
          Adicionar speaker
        </button>
      </div>

      <PhotoUploadField
        id="workshop-partner-logo-upload"
        label="Marca parceira"
        hint="A marca parceira aparece ao lado da WoMakers no footer e se ajusta proporcionalmente."
        imageUrl={partnerLogoUrl}
        feedback={partnerLogoFeedback}
        removeLabel="Remover marca"
        onPhotoUpload={onPartnerLogoUpload}
        onRemovePhoto={onRemovePartnerLogo}
      />
    </section>
  )
}