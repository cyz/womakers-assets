import type { AppIconName } from '../../components/AppIcon'
import { AppIcon } from '../../components/AppIcon'
import type { WorkshopFooterIcon } from '../../model'

type WorkshopPreviewProps = {
  hasColorfulBackground: boolean
  isDualSpeaker: boolean
  isStoriesPlatform: boolean
  speakerCards: Array<{
    imageUrl: string
    initials: string
    name: string
    role: string
  }>
  workshopBadge: string
  workshopBullets: string[]
  workshopBulletsIntro: string
  workshopBulletsIntroHtml: { __html: string }
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterIcon: WorkshopFooterIcon
  workshopFooterTag: string
  workshopHighlight: string
  workshopHighlightColored: boolean
  workshopPartnerLogoUrl: string
  workshopTitle: string
}

export function WorkshopPreview({
  hasColorfulBackground,
  isDualSpeaker,
  isStoriesPlatform,
  speakerCards,
  workshopBadge,
  workshopBullets,
  workshopBulletsIntro,
  workshopBulletsIntroHtml,
  workshopDescription,
  workshopFooterLeftLineOne,
  workshopFooterLeftLineTwo,
  workshopFooterIcon,
  workshopFooterTag,
  workshopHighlight,
  workshopHighlightColored,
  workshopPartnerLogoUrl,
  workshopTitle,
}: WorkshopPreviewProps) {
  const brandAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/brand.png`
  const hasHighlight = workshopHighlight.trim().length > 0
  const footerIconByOption: Partial<Record<WorkshopFooterIcon, AppIconName>> = {
    Sininho: 'bell',
    Calendário: 'calendar',
    Vídeo: 'broadcast',
    Localização: 'pin',
  }
  const footerIcon = footerIconByOption[workshopFooterIcon]
  const supportingCopy = isDualSpeaker ? workshopBulletsIntro : workshopDescription
  const supportingCopyHtml = isDualSpeaker ? workshopBulletsIntroHtml : undefined

  return (
    <article className={`workshop-preview-layout ${hasColorfulBackground ? 'has-colorful-background' : ''} ${isDualSpeaker ? 'is-dual' : ''} ${isStoriesPlatform ? 'is-stories-platform' : ''}`}>
      <header className="workshop-hero-row">
        <p className="workshop-badge">{workshopBadge}</p>

        <div className="workshop-title-block">
          <h2 className="workshop-title">
            {workshopTitle}
            {hasHighlight ? (
              <span className={`workshop-highlight ${workshopHighlightColored ? '' : 'is-plain'}`}> {workshopHighlight}</span>
            ) : null}
          </h2>
        </div>
      </header>

      <section className="workshop-speaker-section is-dual" aria-label="Palestrantes do workshop">
        <div className={`workshop-speaker-grid is-dual count-${speakerCards.length}`}>
          {speakerCards.map((speaker, index) => (
            <article key={`${index}-${speaker.name}-${speaker.role}`} className="workshop-speaker-card is-dual">
              <div className="workshop-speaker-photo-shell">
                <div className="workshop-speaker-photo-frame">
                  {speaker.imageUrl ? (
                    <img src={speaker.imageUrl} alt={speaker.name} className="workshop-speaker-photo" />
                  ) : (
                    <div className="workshop-speaker-placeholder" aria-label="Workshop speaker placeholder">
                      {speaker.initials || 'WM'}
                    </div>
                  )}
                </div>
              </div>

              <div className="workshop-speaker-copy">
                <p>{speaker.name}</p>
                <strong>{speaker.role}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      {supportingCopy ? (
        <p
          className="workshop-dual-bullets-intro"
          {...(supportingCopyHtml ? { dangerouslySetInnerHTML: supportingCopyHtml } : {})}
        >
          {supportingCopyHtml ? undefined : supportingCopy}
        </p>
      ) : null}

      {workshopBullets.length > 0 ? (
        <section
          className={`workshop-bullet-section is-dual columns-${Math.min(workshopBullets.length, 3)}`}
          aria-label="Principais temas do workshop"
        >
          {workshopBullets.map((item, index) => (
            <article key={`${index}-${item}`} className="workshop-bullet-card">
              <span className="workshop-bullet-dot" aria-hidden="true" />
              <p>{item}</p>
            </article>
          ))}
        </section>
      ) : null}

      <footer className="workshop-footer-section">
        <section className="workshop-footer-copy-grid">
          <div className="workshop-footer-left-group">
            {footerIcon ? <AppIcon name={footerIcon} className="workshop-footer-icon" /> : null}
            <div className="workshop-footer-copy-column">
              <p>{workshopFooterLeftLineOne}</p>
              <p>{workshopFooterLeftLineTwo}</p>
            </div>
          </div>

          <div className="workshop-footer-tag-column">
            <p className="workshop-footer-tag">{workshopFooterTag}</p>
          </div>
        </section>

        <section className="workshop-footer-brand-row" aria-label="Marcas do workshop">
          <div className="workshop-footer-brand-slot">
            <img src={brandAssetUrl} alt="WoMakers Code" className="workshop-brand" />
          </div>

          {workshopPartnerLogoUrl ? (
            <div className="workshop-footer-brand-slot is-partner">
              <img src={workshopPartnerLogoUrl} alt="Marca parceira" className="workshop-brand workshop-brand-partner" />
            </div>
          ) : null}
        </section>
      </footer>
    </article>
  )
}