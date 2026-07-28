import type { CSSProperties, RefObject } from 'react'

import { AppIcon } from './components/AppIcon'
import { EventTitle } from './components/EventTitle'
import { getBannerTypeModule } from './banner-types/registry'
import { useEditor } from './EditorContext'
import {
  articleAdviceDefaults,
  articlePreviewDefaults,
  initialEditorState,
  platformPresets,
  STORIES_PRESET,
  type MeetupLogoAsset,
  type Platform,
} from './model'
import { isSponsorVariation } from './utils'

type FrameRef = RefObject<HTMLDivElement | null>

type PlatformPreviewProps = {
  platform: Platform | 'Instagram Stories (1080x1920)'
  isExporting: boolean
  selectedTheme: string
  renderRichText: (value: string, fallbackValue?: string) => { __html: string }
  onDownloadFrame: (frameElement: HTMLDivElement | null, fileNameSuffix: string) => void
  primaryPreviewFrameRef: FrameRef
  storiesPreviewFrameRef: FrameRef
  quoteSecondaryPreviewFrameRef: FrameRef
  storiesQuoteSecondaryRef: FrameRef
  articleSecondaryPreviewFrameRef: FrameRef
  storiesArticleSecondaryRef: FrameRef
  sponsorCarouselSecondaryPreviewFrameRef: FrameRef
  storiesSponsorCarouselSecondaryRef: FrameRef
}

export function PlatformPreview({
  platform,
  isExporting,
  selectedTheme,
  renderRichText,
  onDownloadFrame: handleDownloadQuoteFrame,
  primaryPreviewFrameRef,
  storiesPreviewFrameRef,
  quoteSecondaryPreviewFrameRef,
  storiesQuoteSecondaryRef,
  articleSecondaryPreviewFrameRef,
  storiesArticleSecondaryRef,
  sponsorCarouselSecondaryPreviewFrameRef,
  storiesSponsorCarouselSecondaryRef,
}: PlatformPreviewProps) {
  const { editorState } = useEditor()
  const {
    selectedType,
    selectedVariation,
    eventTitle,
    eventCity,
    eventDate,
    eventLocation,
    sponsorTitle,
    sponsorLogoUrl,
    speakerName,
    speakerRole,
    speakerContentType,
    speakerTalk,
    speakerImageUrl,
    quoteText,
    quoteSecondText,
    quoteBackgroundImageUrl,
    articleSecondText,
    articleSecondKeyword,
    sponsorCarouselLeadText,
    sponsorCarouselImageUrl,
    sponsorCarouselBodyText,
    sponsorCarouselCta,
    meetupSupportText,
    meetupCta,
    meetupBackgroundImageUrl,
    meetupPartnerLogoPrimaryUrl,
    meetupPartnerLogoSecondaryUrl,
    workshopAccentColor,
    workshopBackgroundImageUrl,
    workshopBadge,
    workshopBulletCount,
    workshopBulletOne,
    workshopBulletTwo,
    workshopBulletThree,
    workshopBulletsIntro,
    workshopDescription,
    workshopFooterLeftLineOne,
    workshopFooterLeftLineTwo,
    workshopFooterTag,
    workshopHighlight,
    workshopHighlightColored,
    workshopPartnerLogoUrl,
    workshopSpeakerCount,
    workshopSecondSpeakerName,
    workshopSecondSpeakerRole,
    workshopSecondSpeakerImageUrl,
    workshopThirdSpeakerName,
    workshopThirdSpeakerRole,
    workshopThirdSpeakerImageUrl,
    workshopFourthSpeakerName,
    workshopFourthSpeakerRole,
    workshopFourthSpeakerImageUrl,
    workshopTitle,
    liveSupportText,
    liveSupportTextBold,
    liveSupportTextCapslock,
    liveFooterLeftText,
    liveFooterRightText,
    liveSecondSpeakerName,
    liveSecondSpeakerRole,
    liveSecondSpeakerImageUrl,
    livePartnerLogoUrl1,
    livePartnerLogoUrl2,
    showAnnualCta,
    annualCtaUrl,
    annualCtaUrlBold,
  } = editorState

  const isWorkshopLayout = selectedType === 'Workshop'
  const isWorkshopDualSpeakerLayout = isWorkshopLayout && workshopSpeakerCount > 1
  const isOtherEventLayout =
    selectedType === 'Meetup Presencial' ||
    selectedType === 'Live' ||
    selectedType === 'Imersão'
  const isLiveLayout = selectedType === 'Live'
  const isAnnualLayout = selectedType === 'Encontro Anual'
  const isPocketLayout = selectedType === 'Encontro Pocket'
  const isArticleLayout = selectedType === 'Artigo'
  const isSponsorLayout = (isPocketLayout || isAnnualLayout) && isSponsorVariation(selectedVariation)
  const isSponsorCarouselLayout = isSponsorLayout && selectedVariation === 'Patrocinador Carousel'
  const isAnnualSponsorLayout = isAnnualLayout && isSponsorVariation(selectedVariation)
  const isAnnualSpeakerLayout = isAnnualLayout && selectedVariation === 'Palestrante'
  const isPocketSpeakerLayout = isPocketLayout && selectedVariation === 'Palestrante'
  const hasEventDetails = eventDate.trim() || eventLocation.trim()
  const eventTitleFitKey = `${selectedType}|${selectedVariation}|${platform}`
  const hasMeetupSupportText = meetupSupportText.trim().length > 0
  const hasMeetupCta = meetupCta.trim().length > 0
  const hasSponsorCarouselCta = sponsorCarouselCta.trim().length > 0
  const hasSpeakerTalk = speakerTalk.trim().length > 0

  const previewBackgroundAsset =
    selectedType === 'Encontro Anual' && (selectedVariation === 'Palestrante' || isAnnualSponsorLayout)
      ? 'bg-matrix.png'
      : 'bg-code.png'
  const articleSpeakerName =
    speakerName.trim() && speakerName !== initialEditorState.speakerName
      ? speakerName.trim()
      : articlePreviewDefaults.speakerName
  const articleSpeakerRole =
    speakerRole.trim() && speakerRole !== initialEditorState.speakerRole
      ? speakerRole.trim()
      : articlePreviewDefaults.speakerRole
  const articleQuoteText =
    quoteText.trim() && quoteText !== initialEditorState.quoteText
      ? quoteText
      : articlePreviewDefaults.quoteText
  const articleCta =
    speakerTalk.trim() && speakerTalk !== initialEditorState.speakerTalk
      ? speakerTalk.trim()
      : articlePreviewDefaults.speakerTalk
  const articleAdviceText =
    articleSecondText.trim() && articleSecondText !== initialEditorState.articleSecondText
      ? articleSecondText
      : articleAdviceDefaults.text
  const articleAdviceKeyword = articleSecondKeyword.trim() || articleAdviceDefaults.keyword

  const meetupPhotoSectionStyle = {
    backgroundImage: meetupBackgroundImageUrl
      ? `linear-gradient(180deg, rgba(4, 4, 4, 0.02) 0%, rgba(4, 4, 4, 0.12) 100%), url(${meetupBackgroundImageUrl})`
      : 'linear-gradient(180deg, rgba(30, 32, 36, 0.22), rgba(8, 8, 8, 0.38))',
  } as CSSProperties

  const meetupLogoAssets: MeetupLogoAsset[] = [
    {
      id: 'brand',
      src: `${import.meta.env.BASE_URL}src/assets/themes/brand.png`,
      alt: 'WoMakers Code',
      className: 'meetup-brand-logo is-brand',
    },
    meetupPartnerLogoPrimaryUrl
      ? {
          id: 'partner-primary',
          src: meetupPartnerLogoPrimaryUrl,
          alt: 'Logo de parceiro 1',
          className: 'meetup-brand-logo',
        }
      : null,
    meetupPartnerLogoSecondaryUrl
      ? {
          id: 'partner-secondary',
          src: meetupPartnerLogoSecondaryUrl,
          alt: 'Logo de parceiro 2',
          className: 'meetup-brand-logo',
        }
      : null,
  ].filter((logo): logo is MeetupLogoAsset => logo !== null)

  const speakerInitials = speakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const articleInitials = articleSpeakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const isStoriesPlatformForPreview = platform === 'Instagram Stories (1080x1920)'
  const activePrimaryRef = isStoriesPlatformForPreview ? storiesPreviewFrameRef : primaryPreviewFrameRef
  const activeQuoteSecondaryRef = isStoriesPlatformForPreview ? storiesQuoteSecondaryRef : quoteSecondaryPreviewFrameRef
  const activeArticleSecondaryRef = isStoriesPlatformForPreview ? storiesArticleSecondaryRef : articleSecondaryPreviewFrameRef
  const activeSponsorCarouselSecondaryRef = isStoriesPlatformForPreview ? storiesSponsorCarouselSecondaryRef : sponsorCarouselSecondaryPreviewFrameRef
  const presetForPreview = isStoriesPlatformForPreview ? STORIES_PRESET : platformPresets[platform]
  const activeBannerModuleForPreview = getBannerTypeModule(selectedType)
  const quoteModuleForPreview = activeBannerModuleForPreview?.type === 'Quote' ? activeBannerModuleForPreview : null
  const workshopModuleForPreview = activeBannerModuleForPreview?.type === 'Workshop' ? activeBannerModuleForPreview : null
  const liveModuleForPreview = activeBannerModuleForPreview?.type === 'Live' ? activeBannerModuleForPreview : null
  const quoteDerivedStateForPreview = quoteModuleForPreview
    ? quoteModuleForPreview.getDerivedState({
        initialSpeakerName: initialEditorState.speakerName,
        isStoriesPlatform: isStoriesPlatformForPreview,
        preset: presetForPreview,
        quoteBackgroundImageUrl,
        quoteSecondText,
        speakerName,
        speakerRole,
      })
    : null
  const workshopDerivedStateForPreview = workshopModuleForPreview
    ? workshopModuleForPreview.getDerivedState({
        isDualSpeaker: isWorkshopDualSpeakerLayout,
        preset: presetForPreview,
        speakerName,
        speakerRole,
        speakerImageUrl,
        workshopAccentColor,
        workshopBackgroundImageUrl,
        workshopBadge,
        workshopBulletCount,
        workshopBulletOne,
        workshopBulletThree,
        workshopBulletTwo,
        workshopBulletsIntro,
        workshopDescription,
        workshopFooterLeftLineOne,
        workshopFooterLeftLineTwo,
        workshopFooterTag,
        workshopHighlight,
        workshopHighlightColored,
        workshopPartnerLogoUrl,
        workshopSpeakerCount,
        workshopSecondSpeakerImageUrl,
        workshopSecondSpeakerName,
        workshopSecondSpeakerRole,
        workshopThirdSpeakerImageUrl,
        workshopThirdSpeakerName,
        workshopThirdSpeakerRole,
        workshopFourthSpeakerImageUrl,
        workshopFourthSpeakerName,
        workshopFourthSpeakerRole,
        workshopTitle,
      })
    : null
  const liveDerivedStateForPreview = liveModuleForPreview
    ? liveModuleForPreview.getDerivedState({
        liveSupportText,
        liveSupportTextBold,
        liveSupportTextCapslock,
        liveSecondSpeakerName,
        preset: presetForPreview,
      })
    : null
  const previewStyleForPreview = {
    '--preview-aspect-ratio': `${presetForPreview.width} / ${presetForPreview.height}`,
    backgroundImage: isArticleLayout || isWorkshopLayout || isOtherEventLayout
      ? 'none'
      : `url(${import.meta.env.BASE_URL}src/assets/themes/${previewBackgroundAsset})`,
    backgroundColor: isOtherEventLayout || isWorkshopLayout
      ? '#040404'
      : isArticleLayout
        ? '#111111'
        : isAnnualLayout
          ? '#0f172a'
          : '#080808',
  } as CSSProperties
  const quotePrimaryHtmlForPreview = renderRichText(quoteText, initialEditorState.quoteText).__html
  const quoteSecondaryHtmlForPreview = renderRichText(quoteSecondText, quoteText || initialEditorState.quoteText).__html

  return (
    <article className="platform-preview-panel">
      {quoteModuleForPreview && quoteDerivedStateForPreview ? (
        <quoteModuleForPreview.Preview
          hasSecondSlide={quoteDerivedStateForPreview.hasSecondSlide}
          isExporting={isExporting}
          showDownloadControls={true}
          isStoriesPlatform={isStoriesPlatformForPreview}
          onDownloadFrame={handleDownloadQuoteFrame}
          primaryPreviewFrameRef={activePrimaryRef}
          previewStyle={quoteDerivedStateForPreview.previewStyle}
          primaryQuoteHtml={quotePrimaryHtmlForPreview}
          quoteDisplayName={quoteDerivedStateForPreview.quoteDisplayName}
          quoteDisplayRole={quoteDerivedStateForPreview.quoteDisplayRole}
          quoteSecondaryPreviewFrameRef={activeQuoteSecondaryRef}
          secondaryQuoteHtml={quoteSecondaryHtmlForPreview}
          selectedTheme={selectedTheme}
          speakerImageUrl={speakerImageUrl}
          speakerInitials={quoteDerivedStateForPreview.speakerInitials}
        />
      ) : isArticleLayout ? (
        <div className="article-preview-stack" aria-label="Imagens do artigo">
          <article className="article-preview-panel">
            <div className="article-preview-panel-toolbar">
                <div>
                  <p className="toolbar-kicker">Imagem 1</p>
                  <p className="toolbar-copy">Download individual desta arte.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleDownloadQuoteFrame(activePrimaryRef.current, 'imagem-1')}
                  disabled={isExporting}
                >
                  <AppIcon name="download" className="button-icon" />
                  {isExporting ? 'Gerando...' : 'Baixar PNG'}
                </button>
              </div>

            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} is-article-layout is-article-primary-frame ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
              style={previewStyleForPreview}
              ref={activePrimaryRef}
            >
              <div className="preview-content">
                <article className="article-slide article-slide-primary">
                  <div className="article-primary-layout">
                    <div className="article-preview-layout">
                      <section className="article-copy-column">
                        <header className="article-heading-block">
                          <h2 className="article-name">{articleSpeakerName}</h2>
                          <p className="article-role">{articleSpeakerRole}</p>
                        </header>

                        <blockquote className="article-quote-block">
                          <p className="article-quote-copy" dangerouslySetInnerHTML={renderRichText(articleQuoteText, articlePreviewDefaults.quoteText)} />
                        </blockquote>

                        <footer className="article-footer">
                          <div className="article-cta-card">
                            <span className="article-linkedin-badge" aria-hidden="true">
                              in
                            </span>
                            <p>{articleCta}</p>
                          </div>

                          <img
                            src={`${import.meta.env.BASE_URL}src/assets/themes/brand.png`}
                            alt="WoMakers Code"
                            className="article-brand"
                          />
                        </footer>
                      </section>

                      <section className="article-portrait-column" aria-label={articleSpeakerName}>
                        <div className="article-photo-shell">
                          <div className="article-photo-frame">
                            <div className="article-photo-media">
                              {speakerImageUrl ? (
                                <img src={speakerImageUrl} alt={articleSpeakerName} className="article-photo" />
                              ) : (
                                <div className="article-photo-placeholder" aria-label="Article photo placeholder">
                                  {articleInitials || 'RP'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </article>

          <article className="article-preview-panel">
            <div className="article-preview-panel-toolbar">
                <div>
                  <p className="toolbar-kicker">Imagem 2</p>
                  <p className="toolbar-copy">Download individual desta arte.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleDownloadQuoteFrame(activeArticleSecondaryRef.current, 'imagem-2')}
                  disabled={isExporting}
                >
                  <AppIcon name="download" className="button-icon" />
                  {isExporting ? 'Gerando...' : 'Baixar PNG'}
                </button>
              </div>

            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} is-article-layout is-article-secondary-frame ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
              style={previewStyleForPreview}
              ref={activeArticleSecondaryRef}
            >
              <div className="preview-content">
                <article className="article-slide article-slide-advice">
                  <div className="article-advice-layout">
                    <header className="article-advice-header">
                      <div className="article-advice-title-row">
                        <h2 className="article-advice-title">{articleAdviceDefaults.title}</h2>
                      </div>
                      <p className="article-advice-subtitle">
                        da <strong>{articleSpeakerName}</strong> para você
                      </p>
                    </header>

                    <section className="article-advice-card">
                      <div className="article-advice-copy" dangerouslySetInnerHTML={renderRichText(articleAdviceText, articleAdviceDefaults.text)} />
                    </section>

                    <footer className="article-advice-footer">
                      <p>
                        Comente <strong>{articleAdviceKeyword}</strong> para receber
                        <br />
                        o link da entrevista completa
                      </p>
                    </footer>
                  </div>
                </article>
              </div>
            </div>
          </article>
        </div>
      ) : isSponsorCarouselLayout ? (
        <div className="sponsor-carousel-preview-stack" aria-label="Imagens do patrocinador carousel">
          <article className="sponsor-carousel-preview-panel">
            <div className="sponsor-carousel-preview-panel-toolbar">
                <div>
                  <p className="toolbar-kicker">Imagem 1</p>
                  <p className="toolbar-copy">Primeira arte do carousel com a logo do patrocinador.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleDownloadQuoteFrame(activePrimaryRef.current, 'imagem-1')}
                  disabled={isExporting}
                >
                  <AppIcon name="download" className="button-icon" />
                  {isExporting ? 'Gerando...' : 'Baixar PNG'}
                </button>
              </div>

            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketLayout ? 'is-pocket-sponsor' : ''} ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
              style={previewStyleForPreview}
              ref={activePrimaryRef}
            >
              <div className="preview-content">
                <header className="event-header">
                  <EventTitle
                    isAnnual={isAnnualLayout}
                    eventTitle={eventTitle}
                    eventCity={eventCity}
                    fitKey={eventTitleFitKey}
                  />

                  {(!isAnnualSponsorLayout || isPocketLayout) && hasEventDetails ? (
                    <div className="event-details-pill">
                      {eventDate.trim() ? (
                        <span className="event-detail-item">
                          <span className="event-dot" aria-hidden="true" />
                          <span>{eventDate}</span>
                        </span>
                      ) : null}
                      {eventLocation.trim() ? (
                        <span className="event-detail-item">
                          <span className="event-dot" aria-hidden="true" />
                          <span>{eventLocation}</span>
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </header>

                <section className="pocket-sponsor-section" aria-label={selectedVariation}>
                  <h3 className="pocket-sponsor-title">
                    <img
                      src={`${import.meta.env.BASE_URL}src/assets/icons/spark-pink.png`}
                      alt=""
                      aria-hidden="true"
                      className="pocket-sponsor-spark"
                    />
                    <span>{sponsorTitle.trim() || initialEditorState.sponsorTitle}</span>
                    <img
                      src={`${import.meta.env.BASE_URL}src/assets/icons/spark-pink.png`}
                      alt=""
                      aria-hidden="true"
                      className="pocket-sponsor-spark"
                    />
                  </h3>
                  <div className="pocket-sponsor-frame">
                    {sponsorLogoUrl ? (
                      <img src={sponsorLogoUrl} alt="Logo do patrocinador" className="pocket-sponsor-logo" />
                    ) : (
                      <div className="pocket-sponsor-placeholder">Logo do patrocinador</div>
                    )}
                  </div>
                </section>

                {isAnnualSponsorLayout && hasEventDetails ? (
                  <div className="event-details-pill">
                    {eventDate.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventDate}</span>
                      </span>
                    ) : null}
                    {eventLocation.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventLocation}</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="pocket-brand-footer">
                  <img
                    src={`${import.meta.env.BASE_URL}src/assets/themes/brand.png`}
                    alt="WoMakers Code"
                    className="pocket-brand"
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="sponsor-carousel-preview-panel">
            <div className="sponsor-carousel-preview-panel-toolbar">
                <div>
                  <p className="toolbar-kicker">Imagem 2</p>
                  <p className="toolbar-copy">Segunda arte do carousel com bloco estático, texto, imagem e CTA.</p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleDownloadQuoteFrame(activeSponsorCarouselSecondaryRef.current, 'imagem-2')}
                  disabled={isExporting}
                >
                  <AppIcon name="download" className="button-icon" />
                  {isExporting ? 'Gerando...' : 'Baixar PNG'}
                </button>
              </div>

            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} is-sponsor-carousel-secondary-frame ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
              style={{
                ...previewStyleForPreview,
                backgroundImage: 'none',
                backgroundColor: '#ffffff',
              }}
              ref={activeSponsorCarouselSecondaryRef}
            >
              <div className="preview-content">
                <article className="sponsor-carousel-slide-secondary">
                  <section className="sponsor-carousel-card">
                    <div className="sponsor-carousel-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>

                    <div
                      className="sponsor-carousel-richtext sponsor-carousel-richtext-lead"
                      dangerouslySetInnerHTML={renderRichText(
                        sponsorCarouselLeadText,
                        initialEditorState.sponsorCarouselLeadText,
                      )}
                    />

                    <figure className="sponsor-carousel-image-shell">
                      {sponsorCarouselImageUrl ? (
                        <img
                          src={sponsorCarouselImageUrl}
                          alt="Imagem da segunda arte do patrocinador"
                          className="sponsor-carousel-image"
                        />
                      ) : (
                        <div className="sponsor-carousel-image-placeholder">
                          Imagem de destaque do patrocinador
                        </div>
                      )}
                    </figure>

                    <div
                      className="sponsor-carousel-richtext sponsor-carousel-richtext-body"
                      dangerouslySetInnerHTML={renderRichText(
                        sponsorCarouselBodyText,
                        initialEditorState.sponsorCarouselBodyText,
                      )}
                    />

                    <footer className="sponsor-carousel-cta-row">
                      <p className={`sponsor-carousel-cta-pill ${hasSponsorCarouselCta ? '' : 'is-placeholder'}`.trim()}>
                        {hasSponsorCarouselCta ? sponsorCarouselCta.trim() : 'CTA'}
                      </p>
                    </footer>
                  </section>
                </article>
              </div>
            </div>
          </article>
        </div>
      ) : liveModuleForPreview && liveDerivedStateForPreview ? (
        <>
          <div
            className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSpeakerLayout ? 'is-annual-speaker' : ''} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketSpeakerLayout ? 'is-pocket-speaker' : ''} ${isPocketLayout && isSponsorLayout ? 'is-pocket-sponsor' : ''} ${isLiveLayout ? 'is-live-layout' : ''} ${isOtherEventLayout && !isLiveLayout ? 'is-meetup-layout' : ''} ${isWorkshopLayout ? 'is-workshop-layout' : ''} ${isArticleLayout ? 'is-article-layout' : ''} ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
            style={liveDerivedStateForPreview.previewStyle}
            ref={activePrimaryRef}
          >
            <div className="preview-content">
              <liveModuleForPreview.Preview
              eventTitle={eventTitle}
              eventDate={eventDate}
              speakerName={speakerName}
              speakerRole={speakerRole}
              speakerTalk={speakerTalk}
              speakerImageUrl={speakerImageUrl}
              supportTextHtml={liveDerivedStateForPreview.supportText}
              liveFooterLeftText={liveFooterLeftText}
              liveFooterRightText={liveFooterRightText}
              liveSecondSpeakerName={liveSecondSpeakerName}
              liveSecondSpeakerRole={liveSecondSpeakerRole}
              liveSecondSpeakerImageUrl={liveSecondSpeakerImageUrl}
              livePartnerLogoUrl1={livePartnerLogoUrl1}
              livePartnerLogoUrl2={livePartnerLogoUrl2}
              speakerInitials={speakerInitials}
              secondSpeakerInitials={liveDerivedStateForPreview.secondSpeakerInitials}
            />
          </div>
        </div>
        </>
      ) : workshopModuleForPreview && workshopDerivedStateForPreview ? (
        <>
          <div
            className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isWorkshopLayout ? 'is-workshop-layout' : ''} ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
            style={workshopDerivedStateForPreview.previewStyle}
            ref={activePrimaryRef}
          >
            <div className="preview-content">
              <workshopModuleForPreview.Preview
              isDualSpeaker={workshopDerivedStateForPreview.isDualSpeaker}
              isStoriesPlatform={isStoriesPlatformForPreview}
              speakerCards={workshopDerivedStateForPreview.speakerCards}
              workshopBadge={workshopDerivedStateForPreview.workshopBadge}
              workshopBullets={workshopDerivedStateForPreview.workshopBullets}
              workshopBulletsIntro={workshopDerivedStateForPreview.workshopBulletsIntro}
              workshopDescription={workshopDerivedStateForPreview.workshopDescription}
              workshopFooterLeftLineOne={workshopDerivedStateForPreview.workshopFooterLeftLineOne}
              workshopFooterLeftLineTwo={workshopDerivedStateForPreview.workshopFooterLeftLineTwo}
              workshopFooterTag={workshopDerivedStateForPreview.workshopFooterTag}
              workshopHighlight={workshopDerivedStateForPreview.workshopHighlight}
              workshopHighlightColored={workshopDerivedStateForPreview.workshopHighlightColored}
              workshopPartnerLogoUrl={workshopDerivedStateForPreview.workshopPartnerLogoUrl}
              workshopTitle={workshopDerivedStateForPreview.workshopTitle}
            />
          </div>
        </div>
        </>
      ) : (
        <>
          <div
            className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualLayout ? 'is-annual-layout' : ''} ${isAnnualSpeakerLayout ? 'is-annual-speaker' : ''} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketSpeakerLayout ? 'is-pocket-speaker' : ''} ${isPocketLayout && isSponsorLayout ? 'is-pocket-sponsor' : ''} ${isOtherEventLayout && !isLiveLayout ? 'is-meetup-layout' : ''} ${isStoriesPlatformForPreview ? 'is-stories-platform' : ''}`}
            style={previewStyleForPreview}
            ref={activePrimaryRef}
          >
          <div className="preview-content">
            {isAnnualSpeakerLayout ? (
              <section className="annual-speaker-title-section">
                <EventTitle
                  isAnnual={isAnnualLayout}
                  eventTitle={eventTitle}
                  eventCity={eventCity}
                  fitKey={eventTitleFitKey}
                />
              </section>
            ) : !isOtherEventLayout ? (
              <header className="event-header">
                <EventTitle
                  isAnnual={isAnnualLayout}
                  eventTitle={eventTitle}
                  eventCity={eventCity}
                  fitKey={eventTitleFitKey}
                />

                {(!isSponsorLayout || isPocketLayout) && hasEventDetails ? (
                  <div className="event-details-pill">
                    {eventDate.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventDate}</span>
                      </span>
                    ) : null}
                    {eventLocation.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventLocation}</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </header>
            ) : null}

            {isSponsorLayout ? (
              <section className="pocket-sponsor-section" aria-label={selectedVariation}>
                <h3 className="pocket-sponsor-title">
                  <img
                    src={`${import.meta.env.BASE_URL}src/assets/icons/spark-pink.png`}
                    alt=""
                    aria-hidden="true"
                    className="pocket-sponsor-spark"
                  />
                  <span>{sponsorTitle.trim() || initialEditorState.sponsorTitle}</span>
                  <img
                    src={`${import.meta.env.BASE_URL}src/assets/icons/spark-pink.png`}
                    alt=""
                    aria-hidden="true"
                    className="pocket-sponsor-spark"
                  />
                </h3>
                <div className="pocket-sponsor-frame">
                  {sponsorLogoUrl ? (
                    <img src={sponsorLogoUrl} alt="Logo do patrocinador" className="pocket-sponsor-logo" />
                  ) : (
                    <div className="pocket-sponsor-placeholder">Logo do patrocinador</div>
                  )}
                </div>
              </section>
            ) : !isOtherEventLayout ? (
              <div className="speaker-section">
                <div className="speaker-photo-shell">
                  <div className="speaker-photo-ring" aria-hidden="true" />
                  <div className="speaker-photo-frame">
                    {speakerImageUrl ? (
                      <img src={speakerImageUrl} alt={speakerName} className="speaker-photo" />
                    ) : (
                      <div className="speaker-photo-placeholder" aria-label="Speaker photo placeholder">
                        {speakerInitials || 'WM'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="speaker-copy">
                  {isAnnualSpeakerLayout ? (
                    <img
                      src={`${import.meta.env.BASE_URL}src/assets/themes/brand.png`}
                      alt="WoMakers Code"
                      className="speaker-brand"
                    />
                  ) : null}
                  <div className="speaker-identity-block">
                    <h3 className="speaker-name">{speakerName || 'Nome da palestrante'}</h3>
                    <p className="speaker-role">{speakerRole || 'Cargo / empresa'}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {isPocketSpeakerLayout && hasSpeakerTalk ? (
              <section className="speaker-content-block" aria-label="Conteudo da palestra">
                <div className="event-details-pill speaker-content-type-pill" aria-label="Tipo do conteudo">
                  <span className="event-detail-item">
                    <span className="event-dot" aria-hidden="true" />
                    <span>{speakerContentType}</span>
                  </span>
                </div>
                <p className="speaker-talk">{speakerTalk.trim()}</p>
              </section>
            ) : null}

            {isPocketSpeakerLayout ? (
              <div className="pocket-brand-footer">
                <img
                  src={`${import.meta.env.BASE_URL}src/assets/themes/brand.png`}
                  alt="WoMakers Code"
                  className="pocket-brand"
                />
              </div>
            ) : null}

            {isAnnualSpeakerLayout && hasSpeakerTalk ? (
              <section className="annual-speaker-content-section" aria-label="Conteúdo da apresentação">
                <div className="event-details-pill annual-speaker-content-type-pill" aria-label="Tipo do conteudo">
                  <span className="event-detail-item">
                    <span className="event-dot" aria-hidden="true" />
                    <span>{speakerContentType}</span>
                  </span>
                </div>
                <p className="speaker-talk">{speakerTalk.trim()}</p>
              </section>
            ) : null}

            {isAnnualSpeakerLayout && showAnnualCta ? (
              <section className="annual-cta-footer">
                {(eventDate.trim() || eventLocation.trim()) ? (
                  <div className="event-details-pill annual-cta-pill">
                    {eventDate.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventDate}</span>
                      </span>
                    ) : null}
                    {eventLocation.trim() ? (
                      <span className="event-detail-item">
                        <span className="event-dot" aria-hidden="true" />
                        <span>{eventLocation}</span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
                {(annualCtaUrl.trim() || annualCtaUrlBold.trim()) ? (
                  <p className="annual-cta-text">
                    <span>{annualCtaUrl.trim()}</span>
                    {annualCtaUrlBold.trim() ? <strong>{annualCtaUrlBold.trim()}</strong> : null}
                  </p>
                ) : null}
              </section>
            ) : null}

            {isOtherEventLayout ? (
              <section className="meetup-preview-layout">
                <section className="meetup-top-section">
                  <header className="meetup-logos-header">
                    <div
                      className="meetup-logo-row"
                      style={{ '--meetup-logo-count': `${meetupLogoAssets.length}` } as CSSProperties}
                    >
                      {meetupLogoAssets.map((logo) => (
                        <div key={logo.id} className="meetup-logo-slot">
                          <img src={logo.src} alt={logo.alt} className={logo.className} />
                        </div>
                      ))}
                    </div>
                  </header>

                  <div className="meetup-copy-block">
                    <h2 className="meetup-event-name">{eventTitle.trim() || 'Nome do evento'}</h2>

                    {hasEventDetails ? (
                      <div className="meetup-meta-row">
                        {eventDate.trim() ? <span>{eventDate.trim()}</span> : null}
                        {eventDate.trim() && eventLocation.trim() ? <span className="meetup-meta-dot" aria-hidden="true" /> : null}
                        {eventLocation.trim() ? <span>{eventLocation.trim()}</span> : null}
                      </div>
                    ) : null}

                    {hasMeetupSupportText ? (
                      <p className="meetup-support-text">{meetupSupportText.trim()}</p>
                    ) : null}

                    {hasMeetupCta ? (
                      <div className="meetup-cta-row">
                        <p className="meetup-cta-pill">{meetupCta.trim()}</p>
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="meetup-bottom-section meetup-photo-section" style={meetupPhotoSectionStyle}>
                  <div className="meetup-photo-gradient" aria-hidden="true" />
                </section>
              </section>
            ) : null}
          </div>
        </div>
        </>
      )}
    </article>
  )
}
