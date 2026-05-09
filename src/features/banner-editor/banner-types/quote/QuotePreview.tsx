import type { CSSProperties, RefObject } from 'react'

import { AppIcon } from '../../components/AppIcon'
import { QuoteCard } from '../../components/QuoteCard'

type QuotePreviewProps = {
  hasSecondSlide: boolean
  isExporting: boolean
  onDownloadFrame: (frameElement: HTMLDivElement | null, fileNameSuffix: string) => void
  primaryPreviewFrameRef: RefObject<HTMLDivElement | null>
  previewStyle: CSSProperties
  primaryQuoteHtml: string
  quoteDisplayName: string
  quoteDisplayRole: string
  quoteSecondaryPreviewFrameRef: RefObject<HTMLDivElement | null>
  secondaryQuoteHtml: string
  selectedTheme: string
  speakerImageUrl: string
  speakerInitials: string
}

export function QuotePreview({
  hasSecondSlide,
  isExporting,
  onDownloadFrame,
  primaryPreviewFrameRef,
  previewStyle,
  primaryQuoteHtml,
  quoteDisplayName,
  quoteDisplayRole,
  quoteSecondaryPreviewFrameRef,
  secondaryQuoteHtml,
  selectedTheme,
  speakerImageUrl,
  speakerInitials,
}: QuotePreviewProps) {
  const layerAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/layer1x.png`
  const brandAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/brand.png`

  return (
    <div className="quote-preview-stack" aria-label="Imagens da citação">
      <article className="quote-preview-panel">
        {hasSecondSlide ? (
          <div className="quote-preview-panel-toolbar">
            <div>
              <p className="toolbar-kicker">Imagem 1</p>
              <p className="toolbar-copy">Download individual desta arte.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onDownloadFrame(primaryPreviewFrameRef.current, 'imagem-1')}
              disabled={isExporting}
            >
              <AppIcon name="download" className="button-icon" />
              {isExporting ? 'Gerando...' : 'Baixar PNG'}
            </button>
          </div>
        ) : null}

        <div
          className={`preview-frame theme-${selectedTheme.toLowerCase()} is-quote-layout is-quote-primary-frame`}
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

              <QuoteCard
                bodyClassName="quote-body"
                cardClassName="quote-card"
                html={primaryQuoteHtml}
                quoteDisplayName={quoteDisplayName}
                quoteDisplayRole={quoteDisplayRole}
              />

              <footer className="quote-brand-footer">
                <img src={brandAssetUrl} alt="WoMakers Code" className="quote-brand" />
              </footer>
            </div>
          </div>
        </div>
      </article>

      {hasSecondSlide ? (
        <article className="quote-preview-panel">
          <div className="quote-preview-panel-toolbar">
            <div>
              <p className="toolbar-kicker">Imagem 2</p>
              <p className="toolbar-copy">Download individual desta arte.</p>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onDownloadFrame(quoteSecondaryPreviewFrameRef.current, 'imagem-2')}
              disabled={isExporting}
            >
              <AppIcon name="download" className="button-icon" />
              {isExporting ? 'Gerando...' : 'Baixar PNG'}
            </button>
          </div>

          <div
            className={`preview-frame theme-${selectedTheme.toLowerCase()} is-quote-layout is-quote-secondary-frame`}
            style={previewStyle}
            ref={quoteSecondaryPreviewFrameRef}
          >
            <img
              src={layerAssetUrl}
              alt=""
              aria-hidden="true"
              className="meetup-background-overlay"
            />
            <div className="preview-content">
              <div className="quote-second-layout">
                <QuoteCard
                  bodyClassName="quote-body quote-body-secondary"
                  cardClassName="quote-card quote-card-secondary"
                  html={secondaryQuoteHtml}
                  quoteDisplayName={quoteDisplayName}
                  quoteDisplayRole={quoteDisplayRole}
                  showBadge={false}
                />

                <footer className="quote-brand-footer quote-brand-footer-secondary">
                  <img src={brandAssetUrl} alt="WoMakers Code" className="quote-brand quote-brand-secondary" />
                </footer>
              </div>
            </div>
          </div>
        </article>
      ) : null}
    </div>
  )
}