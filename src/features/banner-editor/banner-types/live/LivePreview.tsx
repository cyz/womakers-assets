interface LivePreviewProps {
  eventTitle: string
  eventDate: string
  speakerName: string
  speakerRole: string
  speakerImageUrl: string
  supportTextHtml: string
  liveFooterLeftText: string
  liveFooterRightText: string
  liveSecondSpeakerName: string
  liveSecondSpeakerRole: string
  liveSecondSpeakerImageUrl: string
  livePartnerLogoUrl1: string
  livePartnerLogoUrl2: string
  speakerInitials: string
  secondSpeakerInitials: string
}

export function LivePreview({
  eventTitle,
  eventDate,
  speakerName,
  speakerRole,
  speakerImageUrl,
  supportTextHtml,
  liveFooterLeftText,
  liveFooterRightText,
  liveSecondSpeakerName,
  liveSecondSpeakerRole,
  liveSecondSpeakerImageUrl,
  livePartnerLogoUrl1,
  livePartnerLogoUrl2,
  speakerInitials,
  secondSpeakerInitials,
}: LivePreviewProps) {
  const brandUrl = `${import.meta.env.BASE_URL}src/assets/themes/brand.png`

  type LogoAsset = {
    id: string
    src: string
    alt: string
    className: string
  }

  const logoAssets: LogoAsset[] = [
    {
      id: 'brand',
      src: brandUrl,
      alt: 'WoMakers Code',
      className: 'live-brand-logo is-brand',
    },
    livePartnerLogoUrl1
      ? {
          id: 'partner-1',
          src: livePartnerLogoUrl1,
          alt: 'Logo de parceiro 1',
          className: 'live-brand-logo',
        }
      : null,
    livePartnerLogoUrl2
      ? {
          id: 'partner-2',
          src: livePartnerLogoUrl2,
          alt: 'Logo de parceiro 2',
          className: 'live-brand-logo',
        }
      : null,
  ].filter((logo): logo is typeof logoAssets[0] => logo !== null)

  return (
    <div className="live-preview-layout" role="article" aria-label="Imagem da live">
      {/* Top branding section */}
      <div className="live-header-top">
        <div className="live-logos-container">
          {logoAssets.map((logo) => (
            <img key={logo.id} src={logo.src} alt={logo.alt} className={logo.className} />
          ))}
        </div>
      </div>

      {/* Title with sparkles */}
      <div className="live-title-wrapper">
        <h2 className="live-event-title">
          Workshop <span className="live-sparkle">✱</span> {eventTitle.trim() || 'Claude Code'}
        </h2>
        {/* Decorative elements */}
        <div className="live-decorations">
          <div className="live-decoration-group left">
            <span className="decoration-dot">●</span>
            <span className="decoration-sparkle">✱</span>
            <span className="decoration-dots">⋮</span>
          </div>
          <div className="live-decoration-group right">
            <span className="decoration-dots">⋮</span>
            <span className="decoration-sparkle">✱</span>
            <span className="decoration-dot">●</span>
          </div>
        </div>
      </div>

      {/* Speakers cards */}
      <div className="live-speakers-container">
        <div className="live-speaker-card">
          <div className="live-speaker-image-wrapper">
            {speakerImageUrl ? (
              <img src={speakerImageUrl} alt={speakerName} className="live-speaker-image" />
            ) : (
              <div className="live-speaker-placeholder">{speakerInitials || 'SP'}</div>
            )}
          </div>
          <div className="live-speaker-info-bar">
            <h3 className="live-speaker-name">{speakerName.trim() || 'Palestrante 1'}</h3>
            {speakerRole.trim() ? <p className="live-speaker-role">{speakerRole}</p> : null}
          </div>
        </div>

        {liveSecondSpeakerName.trim() ? (
          <div className="live-speaker-card">
            <div className="live-speaker-image-wrapper">
              {liveSecondSpeakerImageUrl ? (
                <img src={liveSecondSpeakerImageUrl} alt={liveSecondSpeakerName} className="live-speaker-image" />
              ) : (
                <div className="live-speaker-placeholder">{secondSpeakerInitials || 'SP'}</div>
              )}
            </div>
            <div className="live-speaker-info-bar">
              <h3 className="live-speaker-name">{liveSecondSpeakerName.trim()}</h3>
              {liveSecondSpeakerRole.trim() ? <p className="live-speaker-role">{liveSecondSpeakerRole}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Support text section */}
      <div className="live-support-wrapper">
        <p
          className="live-support-text"
          dangerouslySetInnerHTML={{ __html: supportTextHtml || 'Crie a sua 1ª ferramenta com claude code na prática' }}
        />
      </div>

      {/* Footer section */}
      <div className="live-footer-wrapper">
        <div className="live-footer-content">
          <span>{eventDate.trim() || 'Data da live'}</span>
          <span className="live-footer-sep">·</span>
          <span>{liveFooterLeftText.trim() || 'Ao vivo e gratuito'}</span>
          <span className="live-footer-sep">·</span>
          <span>{liveFooterRightText.trim() || 'Com certificado'}</span>
        </div>
      </div>
    </div>
  )
}
