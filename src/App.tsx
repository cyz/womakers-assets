import type { ChangeEvent, CSSProperties } from 'react'
import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import { AppIcon } from './features/banner-editor/components/AppIcon'
import { getBannerTypeModule } from './features/banner-editor/banner-types/registry'
import { BannerSelector } from './features/banner-editor/components/BannerSelector'
import { RichTextEditor } from './features/banner-editor/components/RichTextEditor'
import {
  MAX_IMAGE_FILE_SIZE,
  MAX_SAVED_EXPORTED_IMAGES,
  articleAdviceDefaults,
  articlePreviewDefaults,
  initialEditorState,
  platformPresets,
  SAVED_EDITOR_STATE_KEY,
  SAVED_EXPORTED_IMAGES_KEY,
  type BannerOption,
  type EditorState,
  type MeetupLogoAsset,
  type SavedBannerAsset,
} from './features/banner-editor/model'
import {
  bannerOptions,
  buildBannerFileName,
  createSavedBannerId,
  formatSavedAt,
  getBannerOptionLabel,
  getBannerOptionGroupLabel,
  getPlatformDimensions,
  groupedBannerOptions,
  hasTypeVariations,
  isEditorStateEqual,
  isSponsorVariation,
  loadSavedBannerAssets,
  loadSavedEditorState,
  normalizeEditorState,
  sanitizeQuoteHtml,
} from './features/banner-editor/utils'
import './App.css'
const downloadImage = (imageDataUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = imageDataUrl
  link.download = fileName
  link.click()
}

const convertImageFileToDataUrl = async (file: File) => {
  const fileDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Nao foi possivel ler a imagem selecionada.'))
    }

    reader.onerror = () => reject(new Error('Nao foi possivel ler a imagem selecionada.'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image()

    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () => reject(new Error('Nao foi possivel processar a imagem selecionada.'))
    nextImage.src = fileDataUrl
  })

  const maxDimension = 1600
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Nao foi possivel preparar a imagem para salvamento.')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.88)
}

function App() {
  const [editorState, setEditorState] = useState<EditorState>(() => loadSavedEditorState())
  const [undoStack, setUndoStack] = useState<EditorState[]>([])
  const [redoStack, setRedoStack] = useState<EditorState[]>([])
  const [isBannerMenuOpen, setIsBannerMenuOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [savedBannerAssets, setSavedBannerAssets] = useState<SavedBannerAsset[]>(() => loadSavedBannerAssets())
  const [saveFeedback, setSaveFeedback] = useState('')
  const [photoFeedback, setPhotoFeedback] = useState('')
  const [sponsorFeedback, setSponsorFeedback] = useState('')
  const [quoteBackgroundFeedback, setQuoteBackgroundFeedback] = useState('')
  const [meetupBackgroundFeedback, setMeetupBackgroundFeedback] = useState('')
  const [meetupLogoFeedback, setMeetupLogoFeedback] = useState('')
  const [sponsorCarouselImageFeedback, setSponsorCarouselImageFeedback] = useState('')
  const bannerMenuRef = useRef<HTMLDivElement | null>(null)
  const primaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const quoteSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const articleSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
  const sponsorCarouselSecondaryPreviewFrameRef = useRef<HTMLDivElement | null>(null)
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

  useEffect(() => {
    const editor = quoteEditorRef.current

    if (!editor) {
      return
    }

    const normalizedQuote = sanitizeQuoteHtml(quoteText)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalizedQuote) {
      editor.innerHTML = normalizedQuote
    }
  }, [quoteText])

  useEffect(() => {
    const editor = articleSecondEditorRef.current

    if (!editor) {
      return
    }

    const normalizedAdvice = sanitizeQuoteHtml(articleSecondText)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalizedAdvice) {
      editor.innerHTML = normalizedAdvice
    }
  }, [articleSecondText])

  useEffect(() => {
    const editor = sponsorCarouselLeadEditorRef.current

    if (!editor) {
      return
    }

    const normalizedLeadText = sanitizeQuoteHtml(sponsorCarouselLeadText)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalizedLeadText) {
      editor.innerHTML = normalizedLeadText
    }
  }, [sponsorCarouselLeadText])

  useEffect(() => {
    const editor = sponsorCarouselBodyEditorRef.current

    if (!editor) {
      return
    }

    const normalizedBodyText = sanitizeQuoteHtml(sponsorCarouselBodyText)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalizedBodyText) {
      editor.innerHTML = normalizedBodyText
    }
  }, [sponsorCarouselBodyText])

  useEffect(() => {
    const editor = quoteSecondEditorRef.current

    if (!editor) {
      return
    }

    const normalizedSecondQuote = sanitizeQuoteHtml(quoteSecondText)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalizedSecondQuote) {
      editor.innerHTML = normalizedSecondQuote
    }
  }, [quoteSecondText])

  const commitState = (updater: EditorState | ((current: EditorState) => EditorState)) => {
    setEditorState((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater

      if (isEditorStateEqual(current, next)) {
        return current
      }

      setUndoStack((stack) => [...stack, current])
      setRedoStack([])
      setSaveFeedback('')
      return next
    })
  }

  const updateField = <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => {
    commitState((current) => {
      if (current[key] === value) {
        return current
      }

      return {
        ...current,
        [key]: value,
      }
    })
  }

  const uploadEditorImage = async (
    event: ChangeEvent<HTMLInputElement>,
    field:
      | 'speakerImageUrl'
      | 'sponsorLogoUrl'
      | 'sponsorCarouselImageUrl'
      | 'quoteBackgroundImageUrl'
      | 'meetupBackgroundImageUrl'
      | 'meetupPartnerLogoPrimaryUrl'
      | 'meetupPartnerLogoSecondaryUrl',
    setFeedback: (message: string) => void,
    successMessage: string,
  ) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setFeedback('Selecione apenas arquivos de imagem.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setFeedback('A imagem deve ter no maximo 8 MB.')
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await convertImageFileToDataUrl(file)
      updateField(field, dataUrl)
      setFeedback(`${successMessage}: ${file.name}`)
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : 'Nao foi possivel carregar a foto selecionada.',
      )
    }

    event.target.value = ''
  }

  const handleSpeakerPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(event, 'speakerImageUrl', setPhotoFeedback, 'Foto carregada')
  }

  const handleSponsorLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(event, 'sponsorLogoUrl', setSponsorFeedback, 'Logo do patrocinador carregada')
  }

  const handleSponsorCarouselImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(
      event,
      'sponsorCarouselImageUrl',
      setSponsorCarouselImageFeedback,
      'Imagem da segunda arte carregada',
    )
  }

  const handleMeetupBackgroundUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(event, 'meetupBackgroundImageUrl', setMeetupBackgroundFeedback, 'Fundo carregado')
  }

  const handleQuoteBackgroundUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(event, 'quoteBackgroundImageUrl', setQuoteBackgroundFeedback, 'Fundo carregado')
  }

  const handleMeetupPartnerLogoUpload =
    (field: 'meetupPartnerLogoPrimaryUrl' | 'meetupPartnerLogoSecondaryUrl', setFeedback: (message: string) => void, label: string) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, field, setFeedback, label)
    }

  const handleRemoveSpeakerPhoto = () => {
    updateField('speakerImageUrl', '')
    setPhotoFeedback('Foto removida.')
  }

  const handleRemoveSponsorLogo = () => {
    updateField('sponsorLogoUrl', '')
    setSponsorFeedback('Logo do patrocinador removida.')
  }

  const handleRemoveSponsorCarouselImage = () => {
    updateField('sponsorCarouselImageUrl', '')
    setSponsorCarouselImageFeedback('Imagem da segunda arte removida.')
  }

  const handleRemoveMeetupBackground = () => {
    updateField('meetupBackgroundImageUrl', '')
    setMeetupBackgroundFeedback('Fundo removido.')
  }

  const handleRemoveQuoteBackground = () => {
    updateField('quoteBackgroundImageUrl', '')
    setQuoteBackgroundFeedback('Fundo removido.')
  }

  const handleRemoveMeetupPartnerLogo = (
    field: 'meetupPartnerLogoPrimaryUrl' | 'meetupPartnerLogoSecondaryUrl',
    label: string,
  ) => {
    updateField(field, '')
    setMeetupLogoFeedback(`${label} removida.`)
  }

  const exportFrameImage = async (frameElement: HTMLDivElement | null) => {
    if (!frameElement) {
      throw new Error('Nao foi possivel localizar a preview para exportacao.')
    }

    const pixelRatio = Math.min(
      3,
      Math.max(1, preset.width / Math.max(frameElement.clientWidth, 1)),
    )

    return toPng(frameElement, {
      cacheBust: true,
      pixelRatio,
    })
  }

  const exportCurrentBannerImage = async () => exportFrameImage(primaryPreviewFrameRef.current)

  const createSavedBannerAsset = async (): Promise<SavedBannerAsset> => ({
    id: createSavedBannerId(),
    fileName: buildBannerFileName(editorState),
    imageDataUrl: await exportCurrentBannerImage(),
    savedAt: new Date().toISOString(),
    editorState,
  })

  const handleSaveVersion = async () => {
    setIsExporting(true)

    try {
      const nextAsset = await createSavedBannerAsset()
      const nextAssets = [nextAsset, ...savedBannerAssets].slice(0, MAX_SAVED_EXPORTED_IMAGES)

      window.localStorage.setItem(SAVED_EDITOR_STATE_KEY, JSON.stringify(editorState))
      window.localStorage.setItem(SAVED_EXPORTED_IMAGES_KEY, JSON.stringify(nextAssets))
      setSavedBannerAssets(nextAssets)
      setSaveFeedback('Imagem e versao salvas no navegador.')
    } catch (error) {
      setSaveFeedback(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel salvar a imagem. Tente novamente.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadCurrentBanner = async () => {
    setIsExporting(true)

    try {
      const fileName = buildBannerFileName(editorState)
      const imageDataUrl = await exportCurrentBannerImage()
      downloadImage(imageDataUrl, fileName)
      setSaveFeedback('Download iniciado.')
    } catch (error) {
      setSaveFeedback(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel gerar o download da imagem.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadQuoteFrame = async (
    frameElement: HTMLDivElement | null,
    fileNameSuffix: string,
  ) => {
    setIsExporting(true)

    try {
      const fileName = buildBannerFileName(editorState).replace('.png', `-${fileNameSuffix}.png`)
      const imageDataUrl = await exportFrameImage(frameElement)
      downloadImage(imageDataUrl, fileName)
      setSaveFeedback('Download iniciado.')
    } catch (error) {
      setSaveFeedback(
        error instanceof Error
          ? error.message
          : 'Nao foi possivel gerar o download da imagem.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadSavedBanner = (asset: SavedBannerAsset) => {
    downloadImage(asset.imageDataUrl, asset.fileName)
    setSaveFeedback('Download iniciado.')
  }

  const handleRestoreSavedBanner = (asset: SavedBannerAsset) => {
    commitState(normalizeEditorState(asset.editorState))
    setSaveFeedback(`Versao restaurada de ${formatSavedAt(asset.savedAt)}.`)
  }

  const selectedBannerOption =
    bannerOptions.find(
      (option) =>
        option.type === selectedType &&
        option.variation === selectedVariation &&
        option.platform === selectedPlatform,
    ) ?? bannerOptions[0]

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
  }

  const handleResetAll = () => {
    if (isEditorStateEqual(editorState, initialEditorState)) {
      return
    }

    setUndoStack((stack) => [...stack, editorState])
    setRedoStack([])
    setEditorState(initialEditorState)
    setIsBannerMenuOpen(false)
    setPhotoFeedback('')
    setSponsorFeedback('')
    setQuoteBackgroundFeedback('')
    setMeetupBackgroundFeedback('')
    setMeetupLogoFeedback('')
    setSponsorCarouselImageFeedback('')
  }

  const handleUndo = () => {
    const previousState = undoStack[undoStack.length - 1]

    if (!previousState) {
      return
    }

    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [editorState, ...stack])
    setEditorState(previousState)
    setIsBannerMenuOpen(false)
  }

  const handleRedo = () => {
    const [nextState, ...remainingStates] = redoStack

    if (!nextState) {
      return
    }

    setRedoStack(remainingStates)
    setUndoStack((stack) => [...stack, editorState])
    setEditorState(nextState)
    setIsBannerMenuOpen(false)
  }

  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0
  const canReset = !isEditorStateEqual(editorState, initialEditorState)
  const isOtherEventLayout =
    selectedType === 'Meetup Presencial' ||
    selectedType === 'Live' ||
    selectedType === 'Workshop' ||
    selectedType === 'Imersão'
  const isAnnualLayout = selectedType === 'Encontro Anual'
  const isPocketLayout = selectedType === 'Encontro Pocket'
  const isQuoteLayout = selectedType === 'Quote'
  const isArticleLayout = selectedType === 'Artigo'
  const isSponsorLayout = (isPocketLayout || isAnnualLayout) && isSponsorVariation(selectedVariation)
  const isSponsorCarouselLayout = isSponsorLayout && selectedVariation === 'Patrocinador Carousel'
  const isAnnualSponsorLayout = isAnnualLayout && isSponsorVariation(selectedVariation)
  const isAnnualSpeakerLayout =
    isAnnualLayout && selectedVariation === 'Palestrante'
  const isPocketSpeakerLayout =
    isPocketLayout && selectedVariation === 'Palestrante'
  const hasEventDetails = eventDate.trim() || eventLocation.trim()
  const hasMeetupSupportText = meetupSupportText.trim().length > 0
  const hasMeetupCta = meetupCta.trim().length > 0
  const hasAnnualCta = isAnnualLayout && showAnnualCta && (annualCtaCaption.trim() || annualCta.trim())
  const hasSponsorCarouselCta = sponsorCarouselCta.trim().length > 0

  const preset = platformPresets[selectedPlatform]
  const activeBannerModule = getBannerTypeModule(selectedType)
  const quoteModule = activeBannerModule?.type === 'Quote' ? activeBannerModule : null
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
  const quoteDerivedState = quoteModule
    ? quoteModule.getDerivedState({
        initialSpeakerName: initialEditorState.speakerName,
        preset,
        quoteBackgroundImageUrl,
        quoteSecondText,
        speakerName,
        speakerRole,
      })
    : null
  const hasQuoteSecondSlide = quoteDerivedState?.hasSecondSlide ?? false
  const hasArticleSecondSlide = isArticleLayout
  const hasSponsorCarouselSecondSlide = isSponsorCarouselLayout
  const hasIsolatedPreviewPanels =
    hasQuoteSecondSlide || hasArticleSecondSlide || hasSponsorCarouselSecondSlide
  const previewStyle = {
    '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
    backgroundImage: isArticleLayout
      ? 'none'
      : `url(${import.meta.env.BASE_URL}src/assets/themes/${previewBackgroundAsset})`,
    backgroundColor: isOtherEventLayout
      ? '#040404'
      : isArticleLayout
        ? '#16181b'
        : undefined,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: isArticleLayout ? 'cover' : '100% 100%',
  } as CSSProperties

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

  const syncRichEditorState = (
    field:
      | 'quoteText'
      | 'quoteSecondText'
      | 'articleSecondText'
      | 'sponsorCarouselLeadText'
      | 'sponsorCarouselBodyText',
    editor: HTMLDivElement | null,
  ) => {
    if (!editor) {
      return
    }

    const nextValue = sanitizeQuoteHtml(editor.innerHTML)

    updateField(field, nextValue)
  }

  const applyRichTextFormatting = (
    field:
      | 'quoteText'
      | 'quoteSecondText'
      | 'articleSecondText'
      | 'sponsorCarouselLeadText'
      | 'sponsorCarouselBodyText',
    editor: HTMLDivElement | null,
    command: 'bold',
  ) => {
    if (!editor) {
      return
    }

    editor.focus()
    document.execCommand(command)
    syncRichEditorState(field, editor)
  }

  const renderRichText = (value: string, fallback = initialEditorState.quoteText) => ({
    __html: sanitizeQuoteHtml(value.trim() || fallback),
  })

  const handleRichEditorPaste = (
    event: React.ClipboardEvent<HTMLDivElement>,
    field:
      | 'quoteText'
      | 'quoteSecondText'
      | 'articleSecondText'
      | 'sponsorCarouselLeadText'
      | 'sponsorCarouselBodyText',
    editor: HTMLDivElement | null,
  ) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    syncRichEditorState(field, editor)
  }

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <div className="panel-header">
          <div className="panel-badge">
            <span className="badge-icon" aria-hidden="true">
              <AppIcon name="spark" />
            </span>
            <span>WoMakers Social Assets</span>
          </div>
        </div>

        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layers" />
            </span>
            <p className="section-label">Estrutura</p>
          </div>

          <BannerSelector
            bannerMenuRef={bannerMenuRef}
            groupedBannerOptions={groupedBannerOptions}
            isBannerMenuOpen={isBannerMenuOpen}
            selectedBannerOption={selectedBannerOption}
            onSelect={handleBannerSelect}
            onToggle={() => setIsBannerMenuOpen((open) => !open)}
          />
          <p className="field-hint">
            Encontro Pocket e Encontro Anual incluem Palestrante, Patrocinador Single Image e Patrocinador Carousel. {getBannerOptionGroupLabel(selectedType) === 'Outros eventos' ? 'Outros eventos usam um layout único.' : 'Quote e Artigo usam um layout único.'}
          </p>
        </section>

        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layout" />
            </span>
            <p className="section-label">Formato</p>
          </div>
          <p className="field-hint">
            A resolução foi fixada em Instagram Feed (1080x1350) para todos os banners.
          </p>
        </section>

        <section className="control-section muted-card">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="text" />
            </span>
            <p className="section-label">{isQuoteLayout ? 'Conteudo da citacao' : isArticleLayout ? 'Trecho do artigo' : 'Conteudo do evento'}</p>
          </div>

          {isQuoteLayout || isArticleLayout ? (
            <>
              {quoteModule ? (
                <quoteModule.ContentFields
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
          ) : isOtherEventLayout ? (
            <>
              <label className="field-label" htmlFor="event-date">
                Data e horario
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
          ) : null}

          {!isQuoteLayout && !isArticleLayout ? (
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
            </>
          ) : null}

          {!isOtherEventLayout && !isQuoteLayout && !isArticleLayout ? (
            <>
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
            </>
          ) : null}

          {isAnnualSpeakerLayout ? (
            <>
              <label className="checkbox-field" htmlFor="annual-cta-toggle">
                <input
                  id="annual-cta-toggle"
                  type="checkbox"
                  checked={showAnnualCta}
                  onChange={(event) => updateField('showAnnualCta', event.target.checked)}
                />
                <span>Incluir CTA no rodapé do Encontro Anual</span>
              </label>

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
        </section>

        {quoteModule ? (
          <quoteModule.MediaFields
            onQuoteBackgroundUpload={handleQuoteBackgroundUpload}
            onRemoveQuoteBackground={handleRemoveQuoteBackground}
            onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
            onSpeakerNameChange={(value) => updateField('speakerName', value)}
            onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
            onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
            photoFeedback={photoFeedback}
            quoteBackgroundFeedback={quoteBackgroundFeedback}
            quoteBackgroundImageUrl={quoteBackgroundImageUrl}
            speakerImageUrl={speakerImageUrl}
            speakerName={speakerName}
            speakerRole={speakerRole}
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
                Upload de imagem com ate 8 MB. Se ficar vazio, a preview usa um placeholder com iniciais.
              </p>
              {speakerImageUrl ? (
                <button type="button" className="secondary-inline-action" onClick={handleRemoveSpeakerPhoto}>
                  Remover foto
                </button>
              ) : null}
            </div>
            {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}
          </section>
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
                A imagem fica concentrada na faixa inferior do banner, com corte automatico para preencher a seção.
              </p>
              {meetupBackgroundImageUrl ? (
                <button type="button" className="secondary-inline-action" onClick={handleRemoveMeetupBackground}>
                  Remover fundo
                </button>
              ) : null}
            </div>
            {meetupBackgroundFeedback ? <p className="field-hint upload-feedback">{meetupBackgroundFeedback}</p> : null}

            <label className="field-label" htmlFor="meetup-partner-logo-primary">
              Logo parceiro 1
            </label>
            <input
              id="meetup-partner-logo-primary"
              type="file"
              accept="image/*"
              onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoPrimaryUrl', setMeetupLogoFeedback, 'Logo parceiro 1 carregada')}
            />

            <label className="field-label" htmlFor="meetup-partner-logo-secondary">
              Logo parceiro 2
            </label>
            <input
              id="meetup-partner-logo-secondary"
              type="file"
              accept="image/*"
              onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoSecondaryUrl', setMeetupLogoFeedback, 'Logo parceiro 2 carregada')}
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
            {meetupLogoFeedback ? <p className="field-hint upload-feedback">{meetupLogoFeedback}</p> : null}
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
            {sponsorFeedback ? <p className="field-hint upload-feedback">{sponsorFeedback}</p> : null}

            {isSponsorCarouselLayout ? (
              <>
                <label className="field-label" htmlFor="sponsor-carousel-lead-text">
                  Texto principal da segunda arte
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
                  placeholder="Digite o texto principal da segunda arte"
                  toolbarLabel="Formatacao do texto principal da segunda arte"
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
                    A imagem aparece em um quadro de destaque com proporcao aproximada de 725x325.
                  </p>
                  {sponsorCarouselImageUrl ? (
                    <button type="button" className="secondary-inline-action" onClick={handleRemoveSponsorCarouselImage}>
                      Remover imagem
                    </button>
                  ) : null}
                </div>
                {sponsorCarouselImageFeedback ? (
                  <p className="field-hint upload-feedback">{sponsorCarouselImageFeedback}</p>
                ) : null}

                <label className="field-label" htmlFor="sponsor-carousel-body-text">
                  Texto complementar da segunda arte
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
                  placeholder="Digite o texto complementar da segunda arte"
                  toolbarLabel="Formatacao do texto complementar da segunda arte"
                />

                <label className="field-label" htmlFor="sponsor-carousel-cta">
                  CTA opcional da segunda arte
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
              <p className="section-label">Conteudo da palestrante</p>
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
                Upload de imagem com ate 8 MB. Se ficar vazio, a preview mostra um placeholder com iniciais.
              </p>
              {speakerImageUrl ? (
                <button type="button" className="secondary-inline-action" onClick={handleRemoveSpeakerPhoto}>
                  Remover foto
                </button>
              ) : null}
            </div>
            {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}
          </section>
        )}

        <section className="control-section setup-summary">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layers" />
            </span>
            <p className="section-label">Resumo atual</p>
          </div>
          <div className="summary-chips" aria-label="Current selections">
            <span>{selectedType}</span>
            {hasTypeVariations(selectedType) ? <span>{selectedVariation}</span> : null}
            <span>{selectedPlatform}</span>
          </div>
        </section>

        <div className="panel-footer">
          <button type="button" className="primary-action is-active" onClick={handleSaveVersion} disabled={isExporting}>
            <AppIcon name="save" className="button-icon" />
            <span>{isExporting ? 'Processando...' : 'Salvar versão'}</span>
          </button>
          <p className="footer-copy">
            {saveFeedback || 'As imagens salvas ficam disponiveis no historico abaixo para restaurar ou baixar.'}
          </p>
        </div>
      </aside>

      <main className="preview-area">
        <header className="preview-toolbar">
          <div>
            <p className="toolbar-kicker">Preview</p>
            <p className="toolbar-copy">
              {getBannerOptionLabel(selectedType, selectedVariation, selectedPlatform)} ({getPlatformDimensions(selectedPlatform)}) para {selectedType}.
            </p>
          </div>
          <div className="toolbar-actions" aria-label="Preview actions">
            {!hasIsolatedPreviewPanels ? (
              <button
                type="button"
                className="ghost-button"
                onClick={handleDownloadCurrentBanner}
                disabled={isExporting}
              >
                <AppIcon name="download" className="button-icon" />
                {isExporting ? 'Gerando...' : 'Baixar PNG'}
              </button>
            ) : null}
            <button
              type="button"
              className="icon-button"
              onClick={handleUndo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo"
            >
              <AppIcon name="undo" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={handleRedo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo"
            >
              <AppIcon name="redo" />
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={handleResetAll}
              disabled={!canReset}
            >
              <AppIcon name="refresh" className="button-icon" />
              Reset all
            </button>
          </div>
        </header>

        <section className={`preview-stage ${hasIsolatedPreviewPanels ? 'is-preview-stack' : ''}`.trim()} aria-label="Banner preview mockup">
          {quoteModule && quoteDerivedState ? (
            <quoteModule.Preview
              hasSecondSlide={quoteDerivedState.hasSecondSlide}
              isExporting={isExporting}
              onDownloadFrame={handleDownloadQuoteFrame}
              primaryPreviewFrameRef={primaryPreviewFrameRef}
              previewStyle={quoteDerivedState.previewStyle}
              primaryQuoteHtml={renderRichText(quoteText, initialEditorState.quoteText).__html}
              quoteDisplayName={quoteDerivedState.quoteDisplayName}
              quoteDisplayRole={quoteDerivedState.quoteDisplayRole}
              quoteSecondaryPreviewFrameRef={quoteSecondaryPreviewFrameRef}
              secondaryQuoteHtml={renderRichText(quoteSecondText, quoteText || initialEditorState.quoteText).__html}
              selectedTheme={selectedTheme}
              speakerImageUrl={speakerImageUrl}
              speakerInitials={quoteDerivedState.speakerInitials}
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
                    onClick={() => handleDownloadQuoteFrame(primaryPreviewFrameRef.current, 'imagem-1')}
                    disabled={isExporting}
                  >
                    <AppIcon name="download" className="button-icon" />
                    {isExporting ? 'Gerando...' : 'Baixar PNG'}
                  </button>
                </div>

                <div
                  className={`preview-frame theme-${selectedTheme.toLowerCase()} is-article-layout is-article-primary-frame`}
                  style={previewStyle}
                  ref={primaryPreviewFrameRef}
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
                    onClick={() => handleDownloadQuoteFrame(articleSecondaryPreviewFrameRef.current, 'imagem-2')}
                    disabled={isExporting}
                  >
                    <AppIcon name="download" className="button-icon" />
                    {isExporting ? 'Gerando...' : 'Baixar PNG'}
                  </button>
                </div>

                <div
                  className={`preview-frame theme-${selectedTheme.toLowerCase()} is-article-layout is-article-secondary-frame`}
                  style={previewStyle}
                  ref={articleSecondaryPreviewFrameRef}
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
                    onClick={() => handleDownloadQuoteFrame(primaryPreviewFrameRef.current, 'imagem-1')}
                    disabled={isExporting}
                  >
                    <AppIcon name="download" className="button-icon" />
                    {isExporting ? 'Gerando...' : 'Baixar PNG'}
                  </button>
                </div>

                <div
                  className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketLayout ? 'is-pocket-sponsor' : ''}`}
                  style={previewStyle}
                  ref={primaryPreviewFrameRef}
                >
                  <div className="preview-content">
                    <header className="event-header">
                      <h2 className={`event-title ${isAnnualLayout ? 'is-annual-layout' : ''}`}>
                        {isAnnualLayout ? (
                          <span className="event-title-icon-block" aria-hidden="true">
                            <img
                              src={`${import.meta.env.BASE_URL}src/assets/icons/arrow.png`}
                              alt=""
                              className="event-title-icon"
                            />
                          </span>
                        ) : null}
                        <span className="event-title-copy">
                          <span className="event-title-segment">{eventTitle}</span>
                          {eventCity.trim() ? <span className="event-city event-title-segment"> {eventCity}</span> : null}
                        </span>
                      </h2>

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
                    <p className="toolbar-copy">Segunda arte do carousel com texto, mídia e CTA opcional.</p>
                  </div>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleDownloadQuoteFrame(sponsorCarouselSecondaryPreviewFrameRef.current, 'imagem-2')}
                    disabled={isExporting}
                  >
                    <AppIcon name="download" className="button-icon" />
                    {isExporting ? 'Gerando...' : 'Baixar PNG'}
                  </button>
                </div>

                <div
                  className={`preview-frame theme-${selectedTheme.toLowerCase()} is-sponsor-carousel-secondary-frame`}
                  style={{
                    ...previewStyle,
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                  }}
                  ref={sponsorCarouselSecondaryPreviewFrameRef}
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

                        <div className="sponsor-carousel-image-shell">
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
                        </div>

                        <div
                          className="sponsor-carousel-richtext sponsor-carousel-richtext-body"
                          dangerouslySetInnerHTML={renderRichText(
                            sponsorCarouselBodyText,
                            initialEditorState.sponsorCarouselBodyText,
                          )}
                        />

                        {hasSponsorCarouselCta ? (
                          <footer className="sponsor-carousel-cta-row">
                            <p className="sponsor-carousel-cta-pill">{sponsorCarouselCta.trim()}</p>
                          </footer>
                        ) : null}
                      </section>
                    </article>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSpeakerLayout ? 'is-annual-speaker' : ''} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketSpeakerLayout ? 'is-pocket-speaker' : ''} ${isPocketLayout && isSponsorLayout ? 'is-pocket-sponsor' : ''} ${isOtherEventLayout ? 'is-meetup-layout' : ''} ${isArticleLayout ? 'is-article-layout' : ''}`}
              style={previewStyle}
              ref={primaryPreviewFrameRef}
            >
              <div className="preview-content">
                {isOtherEventLayout ? (
                  <div className="meetup-preview-layout">
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

                    <section className="meetup-copy-block">
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
                    </section>

                    <footer className="meetup-photo-section" style={meetupPhotoSectionStyle}>
                      <div className="meetup-photo-gradient" aria-hidden="true" />
                    </footer>
                  </div>
                ) : (
                <>
                  <header className="event-header">
                    <h2 className={`event-title ${isAnnualLayout ? 'is-annual-layout' : ''}`}>
                      {isAnnualLayout ? (
                        <span className="event-title-icon-block" aria-hidden="true">
                          <img
                            src={`${import.meta.env.BASE_URL}src/assets/icons/arrow.png`}
                            alt=""
                            className="event-title-icon"
                          />
                        </span>
                      ) : null}
                      <span className="event-title-copy">
                        <span className="event-title-segment">{eventTitle}</span>
                        {eventCity.trim() ? <span className="event-city event-title-segment"> {eventCity}</span> : null}
                      </span>
                    </h2>

                    {!isAnnualSpeakerLayout && (!isSponsorLayout || isPocketLayout) && hasEventDetails ? (
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
                  ) : (
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
                        <h3>{speakerName}</h3>
                        {speakerRole.trim() ? <p>{speakerRole}</p> : null}
                      </div>
                    </div>
                  )}

                  {isAnnualSpeakerLayout && hasEventDetails ? (
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

                  {!isSponsorLayout && speakerTalk.trim() ? (
                    <footer className="talk-footer">
                      <p>{speakerTalk}</p>
                    </footer>
                  ) : null}

                  {hasAnnualCta ? (
                    <footer className="annual-cta-footer">
                      <span className="event-dot" aria-hidden="true" />
                      <p>
                        {annualCtaCaption.trim() ? <span>{annualCtaCaption.trim()} </span> : null}
                        {annualCta.trim() ? <strong>{annualCta.trim()}</strong> : null}
                      </p>
                      <span className="event-dot" aria-hidden="true" />
                    </footer>
                  ) : null}

                  {isPocketLayout || isAnnualSponsorLayout ? (
                    <div className="pocket-brand-footer">
                      <img
                        src={`${import.meta.env.BASE_URL}src/assets/themes/brand.png`}
                        alt="WoMakers Code"
                        className="pocket-brand"
                      />
                    </div>
                  ) : null}
                </>
              )}
              </div>
            </div>
          )}
        </section>

        <section className="saved-assets-section" aria-label="Imagens salvas">
          <div className="saved-assets-header">
            <div>
              <p className="toolbar-kicker">Imagens salvas</p>
              <p className="toolbar-copy">Acesse as ultimas imagens exportadas, restaure uma versao ou baixe novamente.</p>
            </div>
          </div>

          {savedBannerAssets.length ? (
            <div className="saved-assets-grid">
              {savedBannerAssets.map((asset) => (
                <article key={asset.id} className="saved-asset-card">
                  <button
                    type="button"
                    className="saved-asset-preview"
                    onClick={() => handleRestoreSavedBanner(asset)}
                    aria-label={`Restaurar ${asset.fileName}`}
                  >
                    <img src={asset.imageDataUrl} alt={asset.fileName} className="saved-asset-image" />
                  </button>
                  <div className="saved-asset-copy">
                    <p className="saved-asset-title">{asset.editorState.selectedType}</p>
                    <p className="saved-asset-meta">
                      {(asset.editorState.selectedType === 'Quote' || asset.editorState.selectedType === 'Artigo'
                        ? asset.editorState.speakerName
                        : asset.editorState.eventCity) || 'Sem identificador'}{' '}
                      · {formatSavedAt(asset.savedAt)}
                    </p>
                  </div>
                  <div className="saved-asset-actions">
                    <button type="button" className="saved-asset-button" onClick={() => handleRestoreSavedBanner(asset)}>
                      Restaurar
                    </button>
                    <button type="button" className="saved-asset-button" onClick={() => handleDownloadSavedBanner(asset)}>
                      Download
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="saved-assets-empty">As imagens salvas aparecerao aqui depois que voce usar Salvar versao.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
