import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  AppIcon,
  BannerSelector,
  CollapsibleSection,
  PreviewZoomToolbar,
  RichTextEditor,
  SavedBannersPage,
  Topbar,
} from './features/banner-editor/components'
import { getBannerTypeModule } from './features/banner-editor/banner-types/registry'
import { useEditor } from './features/banner-editor/EditorContext'
import { EditorProvider } from './features/banner-editor/EditorProvider'
import { PlatformPreview } from './features/banner-editor/PlatformPreview'
import {
  useImageUpload,
  useEditorExport,
  useRichTextEditors,
  useSyncContentEditable,
} from './features/banner-editor/hooks'
import {
  platformPresets,
  SAVED_EXPORTED_IMAGES_KEY,
  type BannerOption,
  type SavedBannerAsset,
} from './features/banner-editor/model'
import {
  formatSavedAt,
  bannerOptions,
  groupedBannerOptions,
  hasTypeVariations,
  isSponsorVariation,
  loadSavedBannerAssets,
  normalizeEditorState,
} from './features/banner-editor/utils'
import './App.css'

function EditorWorkspace() {
  // Navegação baseada em hash: #editor, #salvos
  const getInitialScreen = (): 'editor' | 'salvos' => {
    if (window.location.hash === '#salvos') return 'salvos'
    return 'editor'
  }
  const [screen, setScreen] = useState(getInitialScreen())
  const [isBannerMenuOpen, setIsBannerMenuOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(['conteudo', 'midia', 'saida']))
  const isSectionOpen = (id: string) => openSections.has(id)
  const toggleSection = (id: string) =>
    setOpenSections((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  const [isExporting, setIsExporting] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [hasSelectedType, setHasSelectedType] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [previewFitWidth, setPreviewFitWidth] = useState<number | null>(null)
  const [savedBannerAssets, setSavedBannerAssets] = useState<SavedBannerAsset[]>(() => loadSavedBannerAssets())
  const {
    feedback,
    setFeedback,
    clearFeedback,
    editorState,
    commitState,
    updateField,
    undo,
    redo,
    resetToInitial,
    canUndo,
    canRedo,
    canReset,
  } = useEditor()
  const bannerMenuRef = useRef<HTMLDivElement | null>(null)
  const previewStageRef = useRef<HTMLElement | null>(null)
  const primaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const storiesPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const quoteSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const articleSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const sponsorCarouselSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const storiesQuoteSecondaryRef = useRef<HTMLDivElement | null>(null)
  const storiesArticleSecondaryRef = useRef<HTMLDivElement | null>(null)
  const storiesSponsorCarouselSecondaryRef = useRef<HTMLDivElement | null>(null)
  const quoteEditorRef = useRef<HTMLDivElement | null>(null)
  const quoteSecondEditorRef = useRef<HTMLDivElement | null>(null)
  const articleSecondEditorRef = useRef<HTMLDivElement | null>(null)
  const sponsorCarouselLeadEditorRef = useRef<HTMLDivElement | null>(null)
  const sponsorCarouselBodyEditorRef = useRef<HTMLDivElement | null>(null)
  const selectedTheme = 'WoMakers'
  const {
    selectedType,
    selectedVariation,
    selectedPlatform,
    eventTitle,
    workshopAccentColor,
    workshopBackgroundImageUrl,
    workshopBadge,
    workshopTitle,
    workshopHighlight,
    workshopHighlightColored,
    workshopBulletsIntro,
    workshopDescription,
    workshopBulletCount,
    workshopBulletOne,
    workshopBulletTwo,
    workshopBulletThree,
    workshopFooterLeftLineOne,
    workshopFooterLeftLineTwo,
    workshopFooterTag,
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
    meetupSupportText,
    meetupCta,
    eventCity,
    eventDate,
    eventLocation,
    showAnnualCta,
    annualCtaCaption,
    annualCta,
    sponsorTitle,
    sponsorLogoUrl,
    sponsorCarouselLeadText,
    sponsorCarouselImageUrl,
    sponsorCarouselBodyText,
    sponsorCarouselCta,
    quoteText,
    quoteSecondText,
    articleSecondText,
    articleSecondKeyword,
    quoteBackgroundImageUrl,
    speakerName,
    speakerRole,
    speakerTalk,
    speakerImageUrl,
    meetupBackgroundImageUrl,
    meetupPartnerLogoPrimaryUrl,
    meetupPartnerLogoSecondaryUrl,
    liveSecondSpeakerName,
    liveSecondSpeakerRole,
    liveSecondSpeakerImageUrl,
    livePartnerLogoUrl1,
    livePartnerLogoUrl2,
  } = editorState

  useEffect(() => {
    if (!isBannerMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!bannerMenuRef.current?.contains(event.target as Node)) {
        setIsBannerMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsBannerMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isBannerMenuOpen])

  useSyncContentEditable(quoteEditorRef, quoteText)
  useSyncContentEditable(articleSecondEditorRef, articleSecondText)
  useSyncContentEditable(sponsorCarouselLeadEditorRef, sponsorCarouselLeadText)
  useSyncContentEditable(sponsorCarouselBodyEditorRef, sponsorCarouselBodyText)
  useSyncContentEditable(quoteSecondEditorRef, quoteSecondText)

  useEffect(() => {
    const syncScreenFromHash = () => {
      setScreen(getInitialScreen())
    }

    syncScreenFromHash()
    window.addEventListener('hashchange', syncScreenFromHash)

    return () => {
      window.removeEventListener('hashchange', syncScreenFromHash)
    }
  }, [])

  useEffect(() => {
    const previewStage = previewStageRef.current

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    if (!previewStage) {
      return
    }

    previewStage.scrollTop = 0
  }, [screen, selectedType, selectedVariation, selectedPlatform])

  const {
    handleSpeakerPhotoUpload,
    handleSecondSpeakerPhotoUpload,
    handleThirdSpeakerPhotoUpload,
    handleFourthSpeakerPhotoUpload,
    handleSponsorLogoUpload,
    handleSponsorCarouselImageUpload,
    handleMeetupBackgroundUpload,
    handleWorkshopPartnerLogoUpload,
    handleQuoteBackgroundUpload,
    handleMeetupPartnerLogoUpload,
    handleRemoveSpeakerPhoto,
    handleRemoveSecondSpeakerPhoto,
    handleRemoveThirdSpeakerPhoto,
    handleRemoveFourthSpeakerPhoto,
    handleRemoveSponsorLogo,
    handleRemoveSponsorCarouselImage,
    handleRemoveMeetupBackground,
    handleRemoveWorkshopPartnerLogo,
    handleRemoveQuoteBackground,
    handleRemoveMeetupPartnerLogo,
    handleLiveSecondSpeakerPhotoUpload,
    handleRemoveLiveSecondSpeakerPhoto,
    handleLivePartnerLogoUpload,
    handleRemoveLivePartnerLogo,
  } = useImageUpload(updateField, setFeedback)

  const {
    handleDownloadFocusedBanner,
    handleSaveVersion,
    handleDownloadQuoteFrame,
  } = useEditorExport({
    editorState,
    savedBannerAssets,
    setSavedBannerAssets,
    setIsExporting,
    setFeedback,
    primaryPreviewFrameRef,
    storiesPreviewFrameRef,
  })

  const navigateTo = (nextScreen: 'editor' | 'salvos') => {
    const nextHash = nextScreen === 'salvos' ? '#salvos' : '#editor'

    if (window.location.hash !== nextHash) {
      window.location.assign(nextHash)
    }

    setScreen(nextScreen)
  }

  const goEditor = () => navigateTo('editor')
  const goSalvos = () => navigateTo('salvos')

  const zoomIn = () => setZoom((value) => Math.min(2, Math.round((value + 0.1) * 10) / 10))
  const zoomOut = () => setZoom((value) => Math.max(0.4, Math.round((value - 0.1) * 10) / 10))
  const zoomFit = () => setZoom(1)

  useEffect(() => {
    const stage = previewStageRef.current
    if (!stage || !hasSelectedType) {
      return
    }

    const preset = platformPresets[selectedPlatform]
    const aspect = preset.width / preset.height

    const recompute = () => {
      const styles = window.getComputedStyle(stage)
      const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
      const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
      // Reserve horizontal room for the lateral zoom bar and vertical room for
      // the per-frame download row so the whole banner always stays visible.
      const availableWidth = stage.clientWidth - paddingX - 76
      const availableHeight = stage.clientHeight - paddingY - 56
      const widthFromHeight = availableHeight * aspect
      const nextWidth = Math.max(220, Math.min(760, availableWidth, widthFromHeight))
      setPreviewFitWidth(Number.isFinite(nextWidth) ? nextWidth : null)
    }

    recompute()
    const observer = new ResizeObserver(recompute)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [hasSelectedType, selectedType, selectedVariation, selectedPlatform])

  const handleRestoreSavedBanner = (asset: SavedBannerAsset) => {
    commitState(normalizeEditorState(asset.editorState))
    setHasSelectedType(true)
    setFeedback('save', `Versão restaurada de ${formatSavedAt(asset.savedAt)}.`)
    goEditor()
  }

  const handleBannerSelect = (option: BannerOption) => {
    commitState((current) => {
      if (
        current.selectedType === option.type &&
        current.selectedVariation === option.variation &&
        current.selectedPlatform === option.platform
      ) {
        return current
      }

      return {
        ...current,
        selectedType: option.type,
        selectedVariation: option.variation,
        selectedPlatform: option.platform,
      }
    })

    setIsBannerMenuOpen(false)
    setHasSelectedType(true)
    goEditor()
  }

  // Para SavedBannersPage
  const handleEditSavedBanner = (asset: SavedBannerAsset) => {
    handleRestoreSavedBanner(asset)
  }
  const handleDeleteSavedBanner = (asset: SavedBannerAsset) => {
    const nextAssets = savedBannerAssets.filter((a) => a.id !== asset.id)
    setSavedBannerAssets(nextAssets)
    window.localStorage.setItem(SAVED_EXPORTED_IMAGES_KEY, JSON.stringify(nextAssets))
  }

  const handleResetAll = () => {
    if (!canReset) {
      return
    }

    resetToInitial()
    setHasSelectedType(false)
    setIsBannerMenuOpen(false)
    clearFeedback([
      'photo',
      'sponsor',
      'quoteBackground',
      'meetupBackground',
      'meetupLogo',
      'sponsorCarouselImage',
      'workshopPartnerLogo',
      'secondPhoto',
      'livePartnerLogo',
    ])
  }

  const handleUndo = () => {
    if (!canUndo) {
      return
    }

    undo()
    setIsBannerMenuOpen(false)
  }

  const handleRedo = () => {
    if (!canRedo) {
      return
    }

    redo()
    setIsBannerMenuOpen(false)
  }

  const isWorkshopLayout = selectedType === 'Workshop'
  const isWorkshopDualSpeakerLayout = isWorkshopLayout && selectedVariation === 'Palestrantes'
  const isOtherEventLayout =
    selectedType === 'Meetup Presencial' ||
    selectedType === 'Live' ||
    selectedType === 'Imersão'
  const isLiveLayout = selectedType === 'Live'
  const isAnnualLayout = selectedType === 'Encontro Anual'
  const isPocketLayout = selectedType === 'Encontro Pocket'
  const isQuoteLayout = selectedType === 'Quote'
  const isArticleLayout = selectedType === 'Artigo'
  const isSponsorLayout = (isPocketLayout || isAnnualLayout) && isSponsorVariation(selectedVariation)
  const isSponsorCarouselLayout = isSponsorLayout && selectedVariation === 'Patrocinador Carousel'
  const isAnnualSpeakerLayout = isAnnualLayout && selectedVariation === 'Palestrante'
  const selectedBannerOption =
    bannerOptions.find(
      (option) =>
        option.type === selectedType &&
        option.variation === selectedVariation &&
        option.platform === selectedPlatform,
    ) ?? bannerOptions[0]
  const isStoriesPlatform = selectedPlatform === 'Instagram Stories (1080x1920)'
  const activeBannerModule = getBannerTypeModule(selectedType)
  const quoteModule = activeBannerModule?.type === 'Quote' ? activeBannerModule : null
  const workshopModule = activeBannerModule?.type === 'Workshop' ? activeBannerModule : null
  const liveModule = activeBannerModule?.type === 'Live' ? activeBannerModule : null

  const {
    syncRichEditorState,
    applyRichTextFormatting,
    renderRichText,
    handleRichEditorPaste,
  } = useRichTextEditors(updateField)

  // Renderização condicional por tela
  if (screen === 'salvos') {
    return (
      <div className="saved-banners-shell">
        <SavedBannersPage
          banners={savedBannerAssets}
          onEdit={handleEditSavedBanner}
          onDelete={handleDeleteSavedBanner}
          onBack={goEditor}
        />
      </div>
    )
  }
  // Home/editor
  return (
    <div className="app-root">
      <Topbar
        onBrandClick={goEditor}
        onUndo={handleUndo}
        canUndo={canUndo}
        onRedo={handleRedo}
        canRedo={canRedo}
        onOpenSaved={goSalvos}
      />
      <div className={`app-shell ${sidebarCollapsed ? 'is-sidebar-collapsed' : ''}`.trim()}>
      <aside className={`control-panel ${sidebarCollapsed ? 'is-collapsed' : ''}`.trim()}>
        <div className="panel-collapse-row">
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed((value) => !value)}
            aria-pressed={sidebarCollapsed}
            aria-label={sidebarCollapsed ? 'Expandir painel' : 'Recolher painel'}
            title={sidebarCollapsed ? 'Expandir painel' : 'Recolher painel'}
          >
            <AppIcon name={sidebarCollapsed ? 'expand' : 'collapse'} />
          </button>
          <p className="panel-design-label">Design</p>
        </div>

        <div className="control-panel-scroll">
        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layout" />
            </span>
            <p className="section-label">Formato</p>
          </div>
          <BannerSelector
            bannerMenuRef={bannerMenuRef}
            groupedBannerOptions={groupedBannerOptions}
            hasSelectedBannerOption={hasSelectedType}
            isBannerMenuOpen={isBannerMenuOpen}
            selectedBannerOption={selectedBannerOption}
            onSelect={handleBannerSelect}
            onToggle={() => setIsBannerMenuOpen((value) => !value)}
          />
          <p className="field-hint">
            {hasSelectedType
              ? 'O tipo selecionado gera versões para Feed e Stories. A edição abaixo atualiza os dois formatos.'
              : 'Escolha um tipo de banner para liberar os campos de edição.'}
          </p>
        </section>

        {hasSelectedType ? (
          <>
        <CollapsibleSection
          icon="text"
          title={isQuoteLayout ? 'Conteúdo da citação' : isArticleLayout ? 'Trecho do artigo' : isWorkshopLayout ? 'Conteúdo do workshop' : 'Conteúdo do evento'}
          open={isSectionOpen('conteudo')}
          onToggle={() => toggleSection('conteudo')}
        >
            {isQuoteLayout || isArticleLayout ? (
              <>
                {quoteModule ? (
                  <quoteModule.ContentFields
                    isStoriesPlatform={isStoriesPlatform}
                    onQuoteBold={() => applyRichTextFormatting('quoteText', quoteEditorRef.current, 'bold')}
                    onQuoteInput={() => syncRichEditorState('quoteText', quoteEditorRef.current)}
                    onQuotePaste={(event) => handleRichEditorPaste(event, 'quoteText', quoteEditorRef.current)}
                    onQuoteSecondBold={() => applyRichTextFormatting('quoteSecondText', quoteSecondEditorRef.current, 'bold')}
                    onQuoteSecondInput={() => syncRichEditorState('quoteSecondText', quoteSecondEditorRef.current)}
                    onQuoteSecondPaste={(event) => handleRichEditorPaste(event, 'quoteSecondText', quoteSecondEditorRef.current)}
                    quoteEditorRef={quoteEditorRef}
                    quoteSecondEditorRef={quoteSecondEditorRef}
                  />
                ) : null}

                {isArticleLayout ? (
                  <>
                    <label className="field-label" htmlFor="article-highlight-text">
                      Trecho em destaque
                    </label>
                    <RichTextEditor
                      editorClassName="article-highlight-editor"
                      editorRef={quoteEditorRef}
                      id="article-highlight-text"
                      onBold={() => applyRichTextFormatting('quoteText', quoteEditorRef.current, 'bold')}
                      onInput={() => syncRichEditorState('quoteText', quoteEditorRef.current)}
                      onPaste={(event) => handleRichEditorPaste(event, 'quoteText', quoteEditorRef.current)}
                      placeholder="Digite o trecho em destaque da primeira tela"
                      toolbarLabel="Formatação do destaque do artigo"
                    />

                    <label className="field-label" htmlFor="article-second-text">
                      Conteúdo da segunda tela
                    </label>
                    <RichTextEditor
                      editorClassName="article-second-editor"
                      editorRef={articleSecondEditorRef}
                      id="article-second-text"
                      onBold={() => applyRichTextFormatting('articleSecondText', articleSecondEditorRef.current, 'bold')}
                      onInput={() => syncRichEditorState('articleSecondText', articleSecondEditorRef.current)}
                      onPaste={(event) => handleRichEditorPaste(event, 'articleSecondText', articleSecondEditorRef.current)}
                      placeholder="Digite o conselho da segunda tela"
                      toolbarLabel="Formatação da segunda tela do artigo"
                    />
                    <p className="field-hint">
                      Essa segunda tela aparece ao lado da primeira na preview e pode ser vista com scroll horizontal.
                    </p>
                  </>
                ) : null}
              </>
            ) : isWorkshopLayout ? (
              workshopModule ? (
                <workshopModule.ContentFields
                  isDualSpeaker={isWorkshopDualSpeakerLayout}
                  onWorkshopAccentColorChange={(value) => updateField('workshopAccentColor', value)}
                  onWorkshopBackgroundImageChange={(value) => updateField('workshopBackgroundImageUrl', value)}
                  onWorkshopBadgeChange={(value) => updateField('workshopBadge', value)}
                  onWorkshopBulletCountChange={(value) => updateField('workshopBulletCount', value)}
                  onWorkshopBulletOneChange={(value) => updateField('workshopBulletOne', value)}
                  onWorkshopBulletThreeChange={(value) => updateField('workshopBulletThree', value)}
                  onWorkshopBulletTwoChange={(value) => updateField('workshopBulletTwo', value)}
                  onWorkshopBulletsIntroChange={(value) => updateField('workshopBulletsIntro', value)}
                  onWorkshopDescriptionChange={(value) => updateField('workshopDescription', value)}
                  onWorkshopFooterLeftLineOneChange={(value) => updateField('workshopFooterLeftLineOne', value)}
                  onWorkshopFooterLeftLineTwoChange={(value) => updateField('workshopFooterLeftLineTwo', value)}
                  onWorkshopFooterTagChange={(value) => updateField('workshopFooterTag', value)}
                  onWorkshopHighlightChange={(value) => updateField('workshopHighlight', value)}
                  onWorkshopHighlightColoredChange={(value) => updateField('workshopHighlightColored', value)}
                  onWorkshopTitleChange={(value) => updateField('workshopTitle', value)}
                  workshopAccentColor={workshopAccentColor}
                  workshopBackgroundImageUrl={workshopBackgroundImageUrl}
                  workshopBadge={workshopBadge}
                  workshopBulletCount={workshopBulletCount}
                  workshopBulletOne={workshopBulletOne}
                  workshopBulletThree={workshopBulletThree}
                  workshopBulletTwo={workshopBulletTwo}
                  workshopBulletsIntro={workshopBulletsIntro}
                  workshopDescription={workshopDescription}
                  workshopFooterLeftLineOne={workshopFooterLeftLineOne}
                  workshopFooterLeftLineTwo={workshopFooterLeftLineTwo}
                  workshopFooterTag={workshopFooterTag}
                  workshopHighlight={workshopHighlight}
                  workshopHighlightColored={workshopHighlightColored}
                  workshopTitle={workshopTitle}
                />
              ) : null
            ) : isOtherEventLayout ? (
              <>
                <label className="field-label" htmlFor="event-date">
                  Data e horário
                </label>
                <input
                  id="event-date"
                  type="text"
                  value={eventDate}
                  onChange={(event) => updateField('eventDate', event.target.value)}
                />

                <label className="field-label" htmlFor="event-location">
                  Local
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={eventLocation}
                  onChange={(event) => updateField('eventLocation', event.target.value)}
                />

                <label className="field-label" htmlFor="meetup-support-text">
                  Frase de apoio
                </label>
                <input
                  id="meetup-support-text"
                  type="text"
                  value={meetupSupportText}
                  onChange={(event) => updateField('meetupSupportText', event.target.value)}
                />

                <label className="field-label" htmlFor="meetup-cta">
                  CTA em destaque
                </label>
                <input
                  id="meetup-cta"
                  type="text"
                  value={meetupCta}
                  onChange={(event) => updateField('meetupCta', event.target.value)}
                />
              </>
            ) : (
              <>
                <label className="field-label" htmlFor="event-title">
                  Nome do evento
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={eventTitle}
                  onChange={(event) => updateField('eventTitle', event.target.value)}
                />

                <label className="field-label" htmlFor="event-city">
                  Cidade em destaque
                </label>
                <input
                  id="event-city"
                  type="text"
                  value={eventCity}
                  onChange={(event) => updateField('eventCity', event.target.value)}
                />

                <label className="field-label" htmlFor="event-date">
                  Data
                </label>
                <input
                  id="event-date"
                  type="text"
                  value={eventDate}
                  onChange={(event) => updateField('eventDate', event.target.value)}
                />

                <label className="field-label" htmlFor="event-location">
                  Localização
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={eventLocation}
                  onChange={(event) => updateField('eventLocation', event.target.value)}
                />

                {isAnnualSpeakerLayout ? (
                  <>
                    <button
                      type="button"
                      id="annual-cta-toggle"
                      className="switch-field"
                      role="switch"
                      aria-checked={showAnnualCta}
                      onClick={() => updateField('showAnnualCta', !showAnnualCta)}
                    >
                      <span>Incluir CTA no rodapé do Encontro Anual</span>
                      <span className={`switch ${showAnnualCta ? 'is-on' : ''}`.trim()} aria-hidden="true">
                        <span />
                      </span>
                    </button>

                    {showAnnualCta ? (
                      <>
                        <label className="field-label" htmlFor="annual-cta-caption">
                          Legenda CTA
                        </label>
                        <input
                          id="annual-cta-caption"
                          type="text"
                          value={annualCtaCaption}
                          onChange={(event) => updateField('annualCtaCaption', event.target.value)}
                        />

                        <label className="field-label" htmlFor="annual-cta">
                          CTA
                        </label>
                        <input
                          id="annual-cta"
                          type="text"
                          value={annualCta}
                          onChange={(event) => updateField('annualCta', event.target.value)}
                        />
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
        </CollapsibleSection>

        <CollapsibleSection
          icon="image"
          title="Mídia"
          open={isSectionOpen('midia')}
          onToggle={() => toggleSection('midia')}
        >
          {quoteModule ? (
            <quoteModule.MediaFields
              onQuoteBackgroundUpload={handleQuoteBackgroundUpload}
              onRemoveQuoteBackground={handleRemoveQuoteBackground}
              onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
              onSpeakerNameChange={(value) => updateField('speakerName', value)}
              onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
              onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
              photoFeedback={feedback.photo}
              quoteBackgroundFeedback={feedback.quoteBackground}
              quoteBackgroundImageUrl={quoteBackgroundImageUrl}
              speakerImageUrl={speakerImageUrl}
              speakerName={speakerName}
              speakerRole={speakerRole}
            />
          ) : workshopModule ? (
            <workshopModule.MediaFields
              isDualSpeaker={isWorkshopDualSpeakerLayout}
              onPartnerLogoUpload={handleWorkshopPartnerLogoUpload}
              onRemovePartnerLogo={handleRemoveWorkshopPartnerLogo}
              onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
              onRemoveSecondSpeakerPhoto={handleRemoveSecondSpeakerPhoto}
              onRemoveThirdSpeakerPhoto={handleRemoveThirdSpeakerPhoto}
              onRemoveFourthSpeakerPhoto={handleRemoveFourthSpeakerPhoto}
              onSpeakerCountChange={(value) => updateField('workshopSpeakerCount', value)}
              onSpeakerNameChange={(value) => updateField('speakerName', value)}
              onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
              onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
              onSecondSpeakerNameChange={(value) => updateField('workshopSecondSpeakerName', value)}
              onSecondSpeakerPhotoUpload={handleSecondSpeakerPhotoUpload}
              onSecondSpeakerRoleChange={(value) => updateField('workshopSecondSpeakerRole', value)}
              onThirdSpeakerNameChange={(value) => updateField('workshopThirdSpeakerName', value)}
              onThirdSpeakerPhotoUpload={handleThirdSpeakerPhotoUpload}
              onThirdSpeakerRoleChange={(value) => updateField('workshopThirdSpeakerRole', value)}
              onFourthSpeakerNameChange={(value) => updateField('workshopFourthSpeakerName', value)}
              onFourthSpeakerPhotoUpload={handleFourthSpeakerPhotoUpload}
              onFourthSpeakerRoleChange={(value) => updateField('workshopFourthSpeakerRole', value)}
              partnerLogoFeedback={feedback.workshopPartnerLogo}
              partnerLogoUrl={workshopPartnerLogoUrl}
              photoFeedback={feedback.photo}
              secondPhotoFeedback={feedback.secondPhoto}
              secondSpeakerImageUrl={workshopSecondSpeakerImageUrl}
              secondSpeakerName={workshopSecondSpeakerName}
              secondSpeakerRole={workshopSecondSpeakerRole}
              speakerCount={workshopSpeakerCount}
              speakerImageUrl={speakerImageUrl}
              speakerName={speakerName}
              speakerRole={speakerRole}
              thirdPhotoFeedback={feedback.thirdPhoto}
              thirdSpeakerImageUrl={workshopThirdSpeakerImageUrl}
              thirdSpeakerName={workshopThirdSpeakerName}
              thirdSpeakerRole={workshopThirdSpeakerRole}
              fourthPhotoFeedback={feedback.fourthPhoto}
              fourthSpeakerImageUrl={workshopFourthSpeakerImageUrl}
              fourthSpeakerName={workshopFourthSpeakerName}
              fourthSpeakerRole={workshopFourthSpeakerRole}
            />
          ) : isArticleLayout ? (
            <section className="control-section muted-card">
              <div className="section-heading">
                <span className="section-icon" aria-hidden="true">
                  <AppIcon name="image" />
                </span>
                <p className="section-label">Autoria e retrato</p>
              </div>

              <label className="field-label" htmlFor="article-name">
                Nome
              </label>
              <input
                id="article-name"
                type="text"
                value={speakerName}
                onChange={(event) => updateField('speakerName', event.target.value)}
              />

              <label className="field-label" htmlFor="article-role">
                Cargo
              </label>
              <input
                id="article-role"
                type="text"
                value={speakerRole}
                onChange={(event) => updateField('speakerRole', event.target.value)}
              />

              <label className="field-label" htmlFor="article-cta">
                CTA da primeira tela
              </label>
              <input
                id="article-cta"
                type="text"
                value={speakerTalk}
                onChange={(event) => updateField('speakerTalk', event.target.value)}
              />

              <label className="field-label" htmlFor="article-keyword">
                Palavra-chave da segunda tela
              </label>
              <input
                id="article-keyword"
                type="text"
                value={articleSecondKeyword}
                onChange={(event) => updateField('articleSecondKeyword', event.target.value)}
              />

              <label className="field-label" htmlFor="article-image-upload">
                Foto da entrevistada
              </label>
              <input
                id="article-image-upload"
                type="file"
                accept="image/*"
                onChange={handleSpeakerPhotoUpload}
              />
              <div className="photo-actions-row">
                <p className="field-hint">
                  Upload de imagem com até 8 MB. Se ficar vazio, a preview usa um placeholder com iniciais.
                </p>
                {speakerImageUrl ? (
                  <button type="button" className="secondary-inline-action" onClick={handleRemoveSpeakerPhoto}>
                    Remover foto
                  </button>
                ) : null}
              </div>
              {feedback.photo ? <p className="field-hint upload-feedback">{feedback.photo}</p> : null}
            </section>
          ) : isLiveLayout && liveModule ? (
            <liveModule.MediaFields
              speakerName={speakerName}
              speakerRole={speakerRole}
              speakerImageUrl={speakerImageUrl}
              liveSecondSpeakerName={liveSecondSpeakerName}
              liveSecondSpeakerRole={liveSecondSpeakerRole}
              liveSecondSpeakerImageUrl={liveSecondSpeakerImageUrl}
              livePartnerLogoUrl1={livePartnerLogoUrl1}
              livePartnerLogoUrl2={livePartnerLogoUrl2}
              photoFeedback={feedback.photo}
              secondPhotoFeedback={feedback.secondPhoto}
              partnerLogoFeedback={feedback.livePartnerLogo}
              onSpeakerNameChange={(value) => updateField('speakerName', value)}
              onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
              onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
              onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
              onSecondSpeakerNameChange={(value) => updateField('liveSecondSpeakerName', value)}
              onSecondSpeakerRoleChange={(value) => updateField('liveSecondSpeakerRole', value)}
              onSecondSpeakerPhotoUpload={handleLiveSecondSpeakerPhotoUpload}
              onRemoveSecondSpeakerPhoto={handleRemoveLiveSecondSpeakerPhoto}
              onPartnerLogoUpload={handleLivePartnerLogoUpload}
              onRemovePartnerLogo={handleRemoveLivePartnerLogo}
            />
          ) : isOtherEventLayout ? (
            <section className="control-section muted-card">
              <div className="section-heading">
                <span className="section-icon" aria-hidden="true">
                  <AppIcon name="image" />
                </span>
                <p className="section-label">Background e logos</p>
              </div>

              <label className="field-label" htmlFor="meetup-background-upload">
                Foto da seção inferior
              </label>
              <input
                id="meetup-background-upload"
                type="file"
                accept="image/*"
                onChange={handleMeetupBackgroundUpload}
              />
              <div className="photo-actions-row">
                <p className="field-hint">
                  A imagem fica concentrada na faixa inferior do banner, com corte automático para preencher a seção.
                </p>
                {meetupBackgroundImageUrl ? (
                  <button type="button" className="secondary-inline-action" onClick={handleRemoveMeetupBackground}>
                    Remover fundo
                  </button>
                ) : null}
              </div>
              {feedback.meetupBackground ? <p className="field-hint upload-feedback">{feedback.meetupBackground}</p> : null}

              <label className="field-label" htmlFor="meetup-partner-logo-primary">
                Logo parceiro 1
              </label>
              <input
                id="meetup-partner-logo-primary"
                type="file"
                accept="image/*"
                onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoPrimaryUrl', 'meetupLogo', 'Logo parceiro 1 carregada')}
              />

              <label className="field-label" htmlFor="meetup-partner-logo-secondary">
                Logo parceiro 2
              </label>
              <input
                id="meetup-partner-logo-secondary"
                type="file"
                accept="image/*"
                onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoSecondaryUrl', 'meetupLogo', 'Logo parceiro 2 carregada')}
              />

              <div className="photo-actions-row meetup-actions-row">
                <p className="field-hint">
                  Os logos parceiros ficam ao lado da marca WoMakers e se ajustam de forma proporcional e centralizada.
                </p>
                <div className="inline-actions-group">
                  {meetupPartnerLogoPrimaryUrl ? (
                    <button
                      type="button"
                      className="secondary-inline-action"
                      onClick={() => handleRemoveMeetupPartnerLogo('meetupPartnerLogoPrimaryUrl', 'Logo parceiro 1')}
                    >
                      Remover logo 1
                    </button>
                  ) : null}
                  {meetupPartnerLogoSecondaryUrl ? (
                    <button
                      type="button"
                      className="secondary-inline-action"
                      onClick={() => handleRemoveMeetupPartnerLogo('meetupPartnerLogoSecondaryUrl', 'Logo parceiro 2')}
                    >
                      Remover logo 2
                    </button>
                  ) : null}
                </div>
              </div>
              {feedback.meetupLogo ? <p className="field-hint upload-feedback">{feedback.meetupLogo}</p> : null}
            </section>
          ) : isSponsorLayout ? (
            <section className="control-section muted-card">
              <div className="section-heading">
                <span className="section-icon" aria-hidden="true">
                  <AppIcon name="image" />
                </span>
                <p className="section-label">Conteúdo do patrocínio</p>
              </div>

              <label className="field-label" htmlFor="sponsor-title">
                Título do bloco
              </label>
              <input
                id="sponsor-title"
                type="text"
                value={sponsorTitle}
                onChange={(event) => updateField('sponsorTitle', event.target.value)}
              />

              <label className="field-label" htmlFor="sponsor-logo-upload">
                Logo do patrocinador
              </label>
              <input
                id="sponsor-logo-upload"
                type="file"
                accept="image/*"
                onChange={handleSponsorLogoUpload}
              />
              <div className="photo-actions-row">
                <p className="field-hint">
                  O logo fica centralizado em uma área branca de 864x480 com borda rosa na preview.
                </p>
                {sponsorLogoUrl ? (
                  <button type="button" className="secondary-inline-action" onClick={handleRemoveSponsorLogo}>
                    Remover logo
                  </button>
                ) : null}
              </div>
              {feedback.sponsor ? <p className="field-hint upload-feedback">{feedback.sponsor}</p> : null}

              {isSponsorCarouselLayout ? (
                <>
                  <label className="field-label" htmlFor="sponsor-carousel-lead-text">
                    Texto 1 da segunda arte
                  </label>
                  <RichTextEditor
                    editorClassName="sponsor-carousel-editor"
                    editorRef={sponsorCarouselLeadEditorRef}
                    id="sponsor-carousel-lead-text"
                    onBold={() =>
                      applyRichTextFormatting(
                        'sponsorCarouselLeadText',
                        sponsorCarouselLeadEditorRef.current,
                        'bold',
                      )
                    }
                    onInput={() =>
                      syncRichEditorState('sponsorCarouselLeadText', sponsorCarouselLeadEditorRef.current)
                    }
                    onPaste={(event) =>
                      handleRichEditorPaste(
                        event,
                        'sponsorCarouselLeadText',
                        sponsorCarouselLeadEditorRef.current,
                      )
                    }
                    placeholder="Digite o texto 1 da segunda arte"
                    toolbarLabel="Formatação do texto 1 da segunda arte"
                  />

                  <label className="field-label" htmlFor="sponsor-carousel-image-upload">
                    Imagem da segunda arte
                  </label>
                  <input
                    id="sponsor-carousel-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleSponsorCarouselImageUpload}
                  />
                  <div className="photo-actions-row">
                    <p className="field-hint">
                      A imagem aparece inteira no quadro de destaque, com altura ajustada de forma proporcional.
                    </p>
                    {sponsorCarouselImageUrl ? (
                      <button type="button" className="secondary-inline-action" onClick={handleRemoveSponsorCarouselImage}>
                        Remover imagem
                      </button>
                    ) : null}
                  </div>
                  {feedback.sponsorCarouselImage ? (
                    <p className="field-hint upload-feedback">{feedback.sponsorCarouselImage}</p>
                  ) : null}

                  <label className="field-label" htmlFor="sponsor-carousel-body-text">
                    Texto 2 da segunda arte
                  </label>
                  <RichTextEditor
                    editorClassName="sponsor-carousel-editor sponsor-carousel-editor-secondary"
                    editorRef={sponsorCarouselBodyEditorRef}
                    id="sponsor-carousel-body-text"
                    onBold={() =>
                      applyRichTextFormatting(
                        'sponsorCarouselBodyText',
                        sponsorCarouselBodyEditorRef.current,
                        'bold',
                      )
                    }
                    onInput={() =>
                      syncRichEditorState('sponsorCarouselBodyText', sponsorCarouselBodyEditorRef.current)
                    }
                    onPaste={(event) =>
                      handleRichEditorPaste(
                        event,
                        'sponsorCarouselBodyText',
                        sponsorCarouselBodyEditorRef.current,
                      )
                    }
                    placeholder="Digite o texto 2 da segunda arte"
                    toolbarLabel="Formatação do texto 2 da segunda arte"
                  />

                  <label className="field-label" htmlFor="sponsor-carousel-cta">
                    CTA da segunda arte
                  </label>
                  <input
                    id="sponsor-carousel-cta"
                    type="text"
                    value={sponsorCarouselCta}
                    onChange={(event) => updateField('sponsorCarouselCta', event.target.value)}
                    placeholder="Ex.: Saiba mais no nosso site"
                  />
                </>
              ) : null}
            </section>
          ) : (
            <section className="control-section muted-card">
              <div className="section-heading">
                <span className="section-icon" aria-hidden="true">
                  <AppIcon name="image" />
                </span>
                <p className="section-label">Conteúdo da palestrante</p>
              </div>

              <label className="field-label" htmlFor="speaker-name">
                Nome
              </label>
              <input
                id="speaker-name"
                type="text"
                value={speakerName}
                onChange={(event) => updateField('speakerName', event.target.value)}
              />

              <label className="field-label" htmlFor="speaker-role">
                Função
              </label>
              <input
                id="speaker-role"
                type="text"
                value={speakerRole}
                onChange={(event) => updateField('speakerRole', event.target.value)}
              />

              <label className="field-label" htmlFor="speaker-talk">
                Conteúdo
              </label>
              <input
                id="speaker-talk"
                type="text"
                value={speakerTalk}
                onChange={(event) => updateField('speakerTalk', event.target.value)}
              />

              <label className="field-label" htmlFor="speaker-image-upload">
                Foto da palestrante
              </label>
              <input
                id="speaker-image-upload"
                type="file"
                accept="image/*"
                onChange={handleSpeakerPhotoUpload}
              />
              <div className="photo-actions-row">
                <p className="field-hint">
                  Upload de imagem com até 8 MB. Se ficar vazio, a preview mostra um placeholder com iniciais.
                </p>
                {speakerImageUrl ? (
                  <button type="button" className="secondary-inline-action" onClick={handleRemoveSpeakerPhoto}>
                    Remover foto
                  </button>
                ) : null}
              </div>
              {feedback.photo ? <p className="field-hint upload-feedback">{feedback.photo}</p> : null}
            </section>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          icon="layers"
          title="Resumo de entrega"
          open={isSectionOpen('saida')}
          onToggle={() => toggleSection('saida')}
        >
            <div className="summary-chips summary-chips-compact" aria-label="Resumo de publicação">
              <span>{selectedType}</span>
              {hasTypeVariations(selectedType) ? <span>{selectedVariation}</span> : null}
              <span>{selectedPlatform}</span>
              <span>Salvar e baixar</span>
            </div>
            <p className="field-hint">
              Revise o preview ao lado e depois use as ações de exportação e salvamento abaixo para fechar a entrega.
            </p>
            <button
              type="button"
              className="primary-action is-active"
              onClick={handleSaveVersion}
              disabled={isExporting}
            >
              <AppIcon name="save" className="button-icon" />
              {isExporting ? 'Processando...' : 'Salvar versão'}
            </button>
            {feedback.save ? <p className="field-hint upload-feedback">{feedback.save}</p> : null}
        </CollapsibleSection>
          </>
        ) : (
          <div className="sidebar-empty-hint">
            <span className="sidebar-empty-icon" aria-hidden="true">
              <AppIcon name="layout" />
            </span>
            <p>Selecione um tipo de banner acima para configurar o conteúdo, a mídia e a exportação.</p>
          </div>
        )}
        </div>

        {hasSelectedType ? (
          <div className="panel-footer">
            <div className="panel-footer-row">
              <button
                type="button"
                className="ghost-button panel-footer-reset"
                onClick={handleResetAll}
                disabled={!canReset}
              >
                <AppIcon name="refresh" className="button-icon" />
                Resetar
              </button>
              <button
                type="button"
                className="panel-footer-download"
                onClick={handleDownloadFocusedBanner}
                disabled={isExporting}
              >
                <AppIcon name="download" className="button-icon" />
                <span>{isExporting ? 'Gerando...' : 'Baixar'}</span>
              </button>
            </div>
          </div>
        ) : null}
      </aside>

      <main className="preview-area">
        <section
          ref={previewStageRef}
          className="preview-stage is-preview-stack"
          style={{ '--preview-zoom': zoom } as CSSProperties}
          aria-label="Banner preview mockup"
        >
          {hasSelectedType ? (
            <div
              className="platform-preview-stack"
              style={previewFitWidth ? ({ width: `${previewFitWidth}px` } as CSSProperties) : undefined}
            >
              <section className="platform-preview-section">
                <PlatformPreview
                  platform={selectedPlatform}
                  isExporting={isExporting}
                  selectedTheme={selectedTheme}
                  renderRichText={renderRichText}
                  onDownloadFrame={handleDownloadQuoteFrame}
                  primaryPreviewFrameRef={primaryPreviewFrameRef}
                  storiesPreviewFrameRef={storiesPreviewFrameRef}
                  quoteSecondaryPreviewFrameRef={quoteSecondaryPreviewFrameRef}
                  storiesQuoteSecondaryRef={storiesQuoteSecondaryRef}
                  articleSecondaryPreviewFrameRef={articleSecondaryPreviewFrameRef}
                  storiesArticleSecondaryRef={storiesArticleSecondaryRef}
                  sponsorCarouselSecondaryPreviewFrameRef={sponsorCarouselSecondaryPreviewFrameRef}
                  storiesSponsorCarouselSecondaryRef={storiesSponsorCarouselSecondaryRef}
                />
              </section>
            </div>
          ) : (
            <div className="preview-empty-state">
              <span className="preview-empty-icon" aria-hidden="true">
                <AppIcon name="layout" />
              </span>
              <h2>Escolha um tipo de banner</h2>
              <p>Selecione um formato na barra lateral para visualizar e editar a arte por aqui.</p>
            </div>
          )}
        </section>

        {hasSelectedType ? (
          <PreviewZoomToolbar
            zoom={zoom}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onZoomFit={zoomFit}
            onDownload={handleDownloadFocusedBanner}
            isExporting={isExporting}
          />
        ) : null}

      </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <EditorProvider>
      <EditorWorkspace />
    </EditorProvider>
  )
}

export default App
