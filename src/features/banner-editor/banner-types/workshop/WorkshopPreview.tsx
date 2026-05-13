type WorkshopPreviewProps = {
  isDualSpeaker: boolean
  speakerCards: Array<{
    imageUrl: string
    initials: string
    name: string
    role: string
  }>
  workshopBadge: string
  workshopBullets: string[]
  workshopBulletsIntro: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopHighlight: string
  workshopPartnerLogoUrl: string
  workshopTitle: string
}

export function WorkshopPreview({
  isDualSpeaker,
  speakerCards,
  workshopBadge,
  workshopBullets,
  workshopBulletsIntro,
  workshopDescription,
  workshopFooterLeftLineOne,
  workshopFooterLeftLineTwo,
  workshopFooterTag,
  workshopHighlight,
  workshopPartnerLogoUrl,
  workshopTitle,
}: WorkshopPreviewProps) {
  const brandAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/brand.png`

  return (
    <article className="workshop-preview-layout">
      <header className="workshop-hero-row">
        <p className="workshop-badge">{workshopBadge}</p>

        <div className="workshop-title-block">
          <h2 className="workshop-title">{workshopTitle} <span className="workshop-highlight">{workshopHighlight}</span></h2>
        </div>
      </header>

      {isDualSpeaker ? (
        <>
          <section className="workshop-speaker-section is-dual" aria-label="Palestrantes do workshop">
            <div className="workshop-speaker-grid is-dual">
              {speakerCards.map((speaker) => (
                <article key={`${speaker.name}-${speaker.role}`} className="workshop-speaker-card is-dual">
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

          {workshopBulletsIntro ? (
            <p className="workshop-dual-bullets-intro">{workshopBulletsIntro}</p>
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
        </>
      ) : (
        <div className="workshop-body-grid">
          <div className="workshop-copy-column">
            <p className="workshop-description">{workshopDescription}</p>

            <ul className="workshop-bullet-list" aria-label="Principais temas do workshop">
              {workshopBullets.map((item, index) => (
                <li key={`${index}-${item}`} className="workshop-bullet-item">
                  <span className="workshop-bullet-dot" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="workshop-speaker-column">
            <div className="workshop-speaker-stack">
              {speakerCards.map((speaker) => (
                <article key={`${speaker.name}-${speaker.role}`} className="workshop-speaker-card">
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
          </aside>
        </div>
      )}

      <footer className="workshop-footer-section">
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

        <section className="workshop-footer-copy-grid">
          <div className="workshop-footer-copy-column">
            <p>{workshopFooterLeftLineOne}</p>
            <p>{workshopFooterLeftLineTwo}</p>
          </div>

          <div className="workshop-footer-tag-column">
            <p className="workshop-footer-tag">{workshopFooterTag}</p>
          </div>
        </section>
      </footer>
    </article>
  )
}