import { AppIcon } from '../../components/AppIcon'

interface LiveMediaFieldsProps {
  speakerName: string
  speakerRole: string
  speakerImageUrl: string
  liveSecondSpeakerName: string
  liveSecondSpeakerRole: string
  liveSecondSpeakerImageUrl: string
  livePartnerLogoUrl1: string
  livePartnerLogoUrl2: string
  photoFeedback: string
  secondPhotoFeedback: string
  partnerLogoFeedback: string
  onSpeakerNameChange: (value: string) => void
  onSpeakerRoleChange: (value: string) => void
  onSpeakerPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveSpeakerPhoto: () => void
  onSecondSpeakerNameChange: (value: string) => void
  onSecondSpeakerRoleChange: (value: string) => void
  onSecondSpeakerPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveSecondSpeakerPhoto: () => void
  onPartnerLogoUpload: (field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2', label: string) => (event: React.ChangeEvent<HTMLInputElement>) => void
  onRemovePartnerLogo: (field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2', label: string) => void
}

export function LiveMediaFields({
  speakerName,
  speakerRole,
  speakerImageUrl,
  liveSecondSpeakerName,
  liveSecondSpeakerRole,
  liveSecondSpeakerImageUrl,
  livePartnerLogoUrl1,
  livePartnerLogoUrl2,
  photoFeedback,
  secondPhotoFeedback,
  partnerLogoFeedback,
  onSpeakerNameChange,
  onSpeakerRoleChange,
  onSpeakerPhotoUpload,
  onRemoveSpeakerPhoto,
  onSecondSpeakerNameChange,
  onSecondSpeakerRoleChange,
  onSecondSpeakerPhotoUpload,
  onRemoveSecondSpeakerPhoto,
  onPartnerLogoUpload,
  onRemovePartnerLogo,
}: LiveMediaFieldsProps) {
  return (
    <section className="control-section muted-card">
      <div className="section-heading">
        <span className="section-icon" aria-hidden="true">
          <AppIcon name="image" />
        </span>
        <p className="section-label">Palestrantes e parceiros</p>
      </div>

      <h4 className="subsection-heading">Primeira palestrante</h4>

      <label className="field-label" htmlFor="live-speaker-name">
        Nome
      </label>
      <input
        id="live-speaker-name"
        type="text"
        value={speakerName}
        onChange={(event) => onSpeakerNameChange(event.target.value)}
      />

      <label className="field-label" htmlFor="live-speaker-role">
        Cargo
      </label>
      <input
        id="live-speaker-role"
        type="text"
        value={speakerRole}
        onChange={(event) => onSpeakerRoleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="live-speaker-image">
        Foto
      </label>
      <input
        id="live-speaker-image"
        type="file"
        accept="image/*"
        onChange={onSpeakerPhotoUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          Upload de imagem com até 8 MB. Se ficar vazio, a preview usa um placeholder com iniciais.
        </p>
        {speakerImageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemoveSpeakerPhoto}>
            Remover foto
          </button>
        ) : null}
      </div>
      {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}

      <hr className="section-divider" />

      <h4 className="subsection-heading">Segunda palestrante (opcional)</h4>

      <label className="field-label" htmlFor="live-second-speaker-name">
        Nome
      </label>
      <input
        id="live-second-speaker-name"
        type="text"
        value={liveSecondSpeakerName}
        onChange={(event) => onSecondSpeakerNameChange(event.target.value)}
      />

      <label className="field-label" htmlFor="live-second-speaker-role">
        Cargo
      </label>
      <input
        id="live-second-speaker-role"
        type="text"
        value={liveSecondSpeakerRole}
        onChange={(event) => onSecondSpeakerRoleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="live-second-speaker-image">
        Foto
      </label>
      <input
        id="live-second-speaker-image"
        type="file"
        accept="image/*"
        onChange={onSecondSpeakerPhotoUpload}
      />
      <div className="photo-actions-row">
        <p className="field-hint">
          Upload de imagem com até 8 MB. Se ficar vazio, a preview usa um placeholder com iniciais.
        </p>
        {liveSecondSpeakerImageUrl ? (
          <button type="button" className="secondary-inline-action" onClick={onRemoveSecondSpeakerPhoto}>
            Remover foto
          </button>
        ) : null}
      </div>
      {secondPhotoFeedback ? <p className="field-hint upload-feedback">{secondPhotoFeedback}</p> : null}

      <hr className="section-divider" />

      <h4 className="subsection-heading">Logos de parceiros (opcional)</h4>

      <label className="field-label" htmlFor="live-partner-logo-1">
        Logo parceiro 1
      </label>
      <input
        id="live-partner-logo-1"
        type="file"
        accept="image/*"
        onChange={onPartnerLogoUpload('livePartnerLogoUrl1', 'Logo parceiro 1 carregada')}
      />

      <label className="field-label" htmlFor="live-partner-logo-2">
        Logo parceiro 2
      </label>
      <input
        id="live-partner-logo-2"
        type="file"
        accept="image/*"
        onChange={onPartnerLogoUpload('livePartnerLogoUrl2', 'Logo parceiro 2 carregada')}
      />

      <div className="photo-actions-row">
        <p className="field-hint">
          Os logos dos parceiros ficam no topo do banner junto com a marca WoMakers e se ajustam de forma proporcional.
        </p>
        <div className="inline-actions-group">
          {livePartnerLogoUrl1 ? (
            <button
              type="button"
              className="secondary-inline-action"
              onClick={() => onRemovePartnerLogo('livePartnerLogoUrl1', 'Logo parceiro 1')}
            >
              Remover logo 1
            </button>
          ) : null}
          {livePartnerLogoUrl2 ? (
            <button
              type="button"
              className="secondary-inline-action"
              onClick={() => onRemovePartnerLogo('livePartnerLogoUrl2', 'Logo parceiro 2')}
            >
              Remover logo 2
            </button>
          ) : null}
        </div>
      </div>
      {partnerLogoFeedback ? <p className="field-hint upload-feedback">{partnerLogoFeedback}</p> : null}
    </section>
  )
}
