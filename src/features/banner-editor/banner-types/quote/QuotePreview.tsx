import type { CSSProperties, RefObject } from 'react'

import { QuoteCard } from '../../components/QuoteCard'

type QuotePreviewProps = {
  primaryPreviewFrameRef: RefObject<HTMLDivElement | null>
  isStoriesPlatform: boolean
  previewStyle: CSSProperties
  primaryQuoteHtml: string
  quoteDisplayName: string
  quoteDisplayRole: string
  selectedTheme: string
  speakerImageUrl: string
  speakerInitials: string
}

export function QuotePreview({
  primaryPreviewFrameRef,
  isStoriesPlatform,
  previewStyle,
  primaryQuoteHtml,
  quoteDisplayName,
  quoteDisplayRole,
  selectedTheme,
  speakerImageUrl,
  speakerInitials,
}: QuotePreviewProps) {
  const layerAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/layer1x.png`
  const brandIconAssetUrl = `${import.meta.env.BASE_URL}src/assets/icons/womakerscode-icon.png`

  return (
    <div className="quote-preview-stack" aria-label="Imagens da citação">
      <article className="quote-preview-panel">
        <div
          className={`preview-frame theme-${selectedTheme.toLowerCase()} is-quote-layout is-quote-primary-frame ${isStoriesPlatform ? 'is-stories-platform' : ''}`}
          style={previewStyle}
          ref={primaryPreviewFrameRef}
        >
          <img
            src={layerAssetUrl}
            alt=""
            aria-hidden="true"
            className="meetup-background-overlay"
          />
          <div className="preview-content">
            <div className="quote-preview-layout">
                <div className="quote-avatar-shell">
                  {speakerImageUrl ? (
                    <img src={speakerImageUrl} alt={quoteDisplayName || 'Foto da aluna'} className="quote-avatar" />
                  ) : (
                    <div className="quote-avatar-placeholder" aria-label="Placeholder da foto da aluna">
                      {speakerInitials || 'WM'}
                    </div>
                  )}
                </div>

                <div className="quote-primary-columns">
                  <QuoteCard
                    bodyClassName="quote-body"
                    cardClassName="quote-card"
                    html={primaryQuoteHtml}
                    quoteDisplayName={quoteDisplayName}
                    quoteDisplayRole={quoteDisplayRole}
                  />

                  <footer className="quote-brand-footer">
                    <img src={brandIconAssetUrl} alt="WoMakers Code" className="quote-brand" />
                  </footer>
                </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}