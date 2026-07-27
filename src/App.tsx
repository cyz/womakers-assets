import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  AppIcon,
  BannerSelector,
  PreviewZoomToolbar,
  SavedBannersPage,
  Topbar,
} from './features/banner-editor/components'
import { useEditor } from './features/banner-editor/EditorContext'
import { EditorProvider } from './features/banner-editor/EditorProvider'
import { ContentSection } from './features/banner-editor/ContentSection'
import { MediaSection } from './features/banner-editor/MediaSection'
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
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(['conteudo', 'midia']))
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
  const [canPan, setCanPan] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const previewStackRef = useRef<HTMLDivElement | null>(null)
  const panStartRef = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })
  const [savedBannerAssets, setSavedBannerAssets] = useState<SavedBannerAsset[]>(() => loadSavedBannerAssets())
  const {
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
    sponsorCarouselLeadText,
    sponsorCarouselBodyText,
    quoteText,
    quoteSecondText,
    articleSecondText,
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

  const imageUpload = useImageUpload(updateField, setFeedback)

  const {
    handleDownloadFocusedBanner,
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
  const zoomFit = () => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const getPanBounds = () => {
    const stage = previewStageRef.current
    const stack = previewStackRef.current
    if (!stage || !stack) {
      return { maxX: 0, maxY: 0 }
    }
    const styles = window.getComputedStyle(stage)
    const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const availableWidth = stage.clientWidth - paddingX
    const availableHeight = stage.clientHeight - paddingY
    const contentWidth = stack.offsetWidth * zoom
    const contentHeight = stack.offsetHeight * zoom
    return {
      maxX: Math.max(0, (contentWidth - availableWidth) / 2),
      maxY: Math.max(0, (contentHeight - availableHeight) / 2),
    }
  }

  const handlePreviewPanStart = (event: ReactMouseEvent<HTMLElement>) => {
    if (event.button !== 0 || !canPan) {
      return
    }
    if ((event.target as HTMLElement).closest('button, a, input, textarea, select, [contenteditable="true"]')) {
      return
    }
    event.preventDefault()
    panStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      offsetX: panOffset.x,
      offsetY: panOffset.y,
    }
    setIsPanning(true)
  }

  useEffect(() => {
    if (!isPanning) {
      return
    }
    const handleMove = (event: MouseEvent) => {
      const start = panStartRef.current
      const { maxX, maxY } = getPanBounds()
      const nextX = start.offsetX + (event.clientX - start.pointerX)
      const nextY = start.offsetY + (event.clientY - start.pointerY)
      setPanOffset({
        x: Math.max(-maxX, Math.min(maxX, nextX)),
        y: Math.max(-maxY, Math.min(maxY, nextY)),
      })
    }
    const handleUp = () => setIsPanning(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPanning, zoom])

  useEffect(() => {
    const stage = previewStageRef.current
    if (!stage || !hasSelectedType) {
      setCanPan(false)
      setPanOffset({ x: 0, y: 0 })
      return
    }
    const measure = () => {
      const { maxX, maxY } = getPanBounds()
      setCanPan(maxX > 0 || maxY > 0)
      setPanOffset((current) => ({
        x: Math.max(-maxX, Math.min(maxX, current.x)),
        y: Math.max(-maxY, Math.min(maxY, current.y)),
      }))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    if (previewStackRef.current) {
      observer.observe(previewStackRef.current)
    }
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSelectedType, zoom, previewFitWidth, selectedType, selectedVariation, selectedPlatform])

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

  const selectedBannerOption =
    bannerOptions.find(
      (option) =>
        option.type === selectedType &&
        option.variation === selectedVariation &&
        option.platform === selectedPlatform,
    ) ?? bannerOptions[0]

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
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Recolher painel"
            title="Recolher painel"
          >
            <AppIcon name="collapse" />
          </button>
          <p className="panel-design-label">Design</p>
        </div>

        <div className="control-panel-scroll">
        <section className="control-section">
          <BannerSelector
            bannerMenuRef={bannerMenuRef}
            groupedBannerOptions={groupedBannerOptions}
            hasSelectedBannerOption={hasSelectedType}
            isBannerMenuOpen={isBannerMenuOpen}
            selectedBannerOption={selectedBannerOption}
            onSelect={handleBannerSelect}
            onToggle={() => setIsBannerMenuOpen((value) => !value)}
          />
        </section>

        {hasSelectedType ? (
          <>
        <ContentSection
          open={isSectionOpen('conteudo')}
          onToggle={() => toggleSection('conteudo')}
          richText={{ applyRichTextFormatting, syncRichEditorState, handleRichEditorPaste }}
          quoteEditorRef={quoteEditorRef}
          quoteSecondEditorRef={quoteSecondEditorRef}
          articleSecondEditorRef={articleSecondEditorRef}
        />

        <MediaSection
          open={isSectionOpen('midia')}
          onToggle={() => toggleSection('midia')}
          imageUpload={imageUpload}
          richText={{ applyRichTextFormatting, syncRichEditorState, handleRichEditorPaste }}
          sponsorCarouselLeadEditorRef={sponsorCarouselLeadEditorRef}
          sponsorCarouselBodyEditorRef={sponsorCarouselBodyEditorRef}
        />
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
        {sidebarCollapsed ? (
          <button
            type="button"
            className="sidebar-reopen-btn"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Abrir painel"
            title="Abrir painel"
          >
            <AppIcon name="expand" />
            Abrir painel
          </button>
        ) : null}
        <section
          ref={previewStageRef}
          className={`preview-stage is-preview-stack${isPanning ? ' is-panning' : ''}`}
          style={{ '--preview-zoom': zoom } as CSSProperties}
          aria-label="Banner preview mockup"
          data-can-pan={canPan ? 'true' : undefined}
          onMouseDown={handlePreviewPanStart}
        >
          {hasSelectedType ? (
            <div
              ref={previewStackRef}
              className="platform-preview-stack"
              style={{
                ...(previewFitWidth ? { width: `${previewFitWidth}px` } : {}),
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                transition: isPanning ? 'none' : undefined,
              } as CSSProperties}
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
