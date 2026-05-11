import type { ChangeEvent, ClipboardEvent, CSSProperties } from 'react'
import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import { AppIcon } from './features/banner-editor/components/AppIcon'
import { getBannerTypeModule } from './features/banner-editor/banner-types/registry'
import { BannerSelector } from './features/banner-editor/components/BannerSelector'
import { RichTextEditor } from './features/banner-editor/components/RichTextEditor'
import { SavedBannersPage } from './features/banner-editor/components/SavedBannersPage'
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
  comingSoonTypes,
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

const optimizeSavedPreviewDataUrl = async (imageDataUrl: string) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image()

    nextImage.onload = () => resolve(nextImage)
    nextImage.onerror = () => reject(new Error('Nao foi possivel preparar a previa para salvamento.'))
    nextImage.src = imageDataUrl
  })

  const maxWidth = 720
  const scale = Math.min(1, maxWidth / Math.max(image.width, 1))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Nao foi possivel preparar a previa para salvamento.')
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/webp', 0.8)
}

const isStorageQuotaExceeded = (error: unknown) =>
  error instanceof DOMException && (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  )

function App() {
  // Navegação baseada em hash: #home, #editor, #salvos
  const getInitialScreen = () => {
    if (window.location.hash === '#salvos') return 'salvos'
    if (window.location.hash === '#editor') return 'editor'
    return 'home'
  }
  const [screen, setScreen] = useState(getInitialScreen())
  const [editorState, setEditorState] = useState<EditorState>(() => loadSavedEditorState())
  const [hasSelectedBannerType, setHasSelectedBannerType] = useState(
    () => !isEditorStateEqual(loadSavedEditorState(), initialEditorState),
  )
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
  const [workshopPartnerLogoFeedback, setWorkshopPartnerLogoFeedback] = useState('')
  const [sponsorCarouselImageFeedback, setSponsorCarouselImageFeedback] = useState('')
  const [secondPhotoFeedback, setSecondPhotoFeedback] = useState('')
  const [livePartnerLogoFeedback, setLivePartnerLogoFeedback] = useState('')
  const bannerMenuRef = useRef<HTMLDivElement | null>(null)
  const previewStageRef = useRef<HTMLElement | null>(null)
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
    workshopAccentColor,
    workshopBadge,
    workshopTitle,
    workshopHighlight,
    workshopDescription,
    workshopBulletOne,
    workshopBulletTwo,
    workshopBulletThree,
    workshopFooterLeftLineOne,
    workshopFooterLeftLineTwo,
    workshopFooterTag,
    workshopPartnerLogoUrl,
    workshopSecondSpeakerName,
    workshopSecondSpeakerRole,
    workshopSecondSpeakerImageUrl,
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
    setHasSelectedBannerType(!isEditorStateEqual(editorState, initialEditorState))
  }, [editorState])

  useEffect(() => {
    const previewStage = previewStageRef.current

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    if (!previewStage) {
      return
    }

    previewStage.scrollTop = 0
  }, [screen, selectedType, selectedVariation, selectedPlatform])

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
      | 'workshopPartnerLogoUrl'
      | 'workshopSecondSpeakerImageUrl'
      | 'meetupPartnerLogoPrimaryUrl'
      | 'meetupPartnerLogoSecondaryUrl'
      | 'liveSecondSpeakerImageUrl'
      | 'livePartnerLogoUrl1'
      | 'livePartnerLogoUrl2',
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

  const handleSecondSpeakerPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(
      event,
      'workshopSecondSpeakerImageUrl',
      setSecondPhotoFeedback,
      'Segunda foto carregada',
    )
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

  const handleWorkshopPartnerLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(
      event,
      'workshopPartnerLogoUrl',
      setWorkshopPartnerLogoFeedback,
      'Marca parceira carregada',
    )
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

  const handleRemoveSecondSpeakerPhoto = () => {
    updateField('workshopSecondSpeakerImageUrl', '')
    setSecondPhotoFeedback('Segunda foto removida.')
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

  const handleRemoveWorkshopPartnerLogo = () => {
    updateField('workshopPartnerLogoUrl', '')
    setWorkshopPartnerLogoFeedback('Marca parceira removida.')
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

  const handleLiveSecondSpeakerPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    await uploadEditorImage(
      event,
      'liveSecondSpeakerImageUrl',
      setSecondPhotoFeedback,
      'Segunda foto carregada',
    )
  }

  const handleRemoveLiveSecondSpeakerPhoto = () => {
    updateField('liveSecondSpeakerImageUrl', '')
    setSecondPhotoFeedback('Segunda foto removida.')
  }

  const handleLivePartnerLogoUpload =
    (field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2', label: string) =>
    async (event: ChangeEvent<HTMLInputElement>) => {
      await uploadEditorImage(event, field, setLivePartnerLogoFeedback, label)
    }

  const handleRemoveLivePartnerLogo = (
    field: 'livePartnerLogoUrl1' | 'livePartnerLogoUrl2',
    label: string,
  ) => {
    updateField(field, '')
    setLivePartnerLogoFeedback(`${label} removida.`)
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

  const createSavedBannerAsset = async (): Promise<SavedBannerAsset> => {
    const previewImageDataUrl = await optimizeSavedPreviewDataUrl(await exportCurrentBannerImage())

    return {
      id: createSavedBannerId(),
      fileName: buildBannerFileName(editorState),
      imageDataUrl: previewImageDataUrl,
      savedAt: new Date().toISOString(),
      editorState,
    }
  }

  const persistSavedBannerAssets = (nextAssets: SavedBannerAsset[]) => {
    let assetsToPersist = [...nextAssets]

    while (assetsToPersist.length > 0) {
      try {
        window.localStorage.setItem(SAVED_EXPORTED_IMAGES_KEY, JSON.stringify(assetsToPersist))
        return assetsToPersist
      } catch (error) {
        if (!isStorageQuotaExceeded(error)) {
          throw error
        }

        assetsToPersist = assetsToPersist.slice(0, -1)
      }
    }

    throw new Error('Nao foi possivel salvar a imagem no navegador porque o armazenamento local esta cheio.')
  }

  const handleSaveVersion = async () => {
    setIsExporting(true)

    try {
      const nextAsset = await createSavedBannerAsset()
      const nextAssets = [nextAsset, ...savedBannerAssets].slice(0, MAX_SAVED_EXPORTED_IMAGES)
      const persistedAssets = persistSavedBannerAssets(nextAssets)

      window.localStorage.setItem(SAVED_EDITOR_STATE_KEY, JSON.stringify(editorState))
      setSavedBannerAssets(persistedAssets)
      setSaveFeedback(
        persistedAssets.length < nextAssets.length
          ? 'Imagem salva no navegador. Algumas versoes antigas foram removidas para liberar espaco.'
          : 'Imagem e versao salvas no navegador.',
      )
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

  const navigateTo = (nextScreen: 'home' | 'editor' | 'salvos') => {
    const nextHash = nextScreen === 'home' ? '#home' : nextScreen === 'editor' ? '#editor' : '#salvos'

    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash
    }

    setScreen(nextScreen)
  }

  const goHome = () => navigateTo('home')
  const goEditor = () => navigateTo('editor')
  const goSalvos = () => navigateTo('salvos')

  const handleRestoreSavedBanner = (asset: SavedBannerAsset) => {
    commitState(normalizeEditorState(asset.editorState))
    setHasSelectedBannerType(true)
    setSaveFeedback(`Versao restaurada de ${formatSavedAt(asset.savedAt)}.`)
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

    setHasSelectedBannerType(true)
    setIsBannerMenuOpen(false)
    goEditor()
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
    setWorkshopPartnerLogoFeedback('')
    setSecondPhotoFeedback('')
    setLivePartnerLogoFeedback('')
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
  const isAnnualSponsorLayout = isAnnualLayout && isSponsorVariation(selectedVariation)
  const isAnnualSpeakerLayout = isAnnualLayout && selectedVariation === 'Palestrante'
  const isPocketSpeakerLayout = isPocketLayout && selectedVariation === 'Palestrante'
  const hasEventDetails = eventDate.trim() || eventLocation.trim()
  const hasMeetupSupportText = meetupSupportText.trim().length > 0
  const hasMeetupCta = meetupCta.trim().length > 0
  const hasAnnualCta = isAnnualLayout && showAnnualCta && (annualCtaCaption.trim() || annualCta.trim())
  const hasSponsorCarouselCta = sponsorCarouselCta.trim().length > 0

  const preset = platformPresets[selectedPlatform]
  const activeBannerModule = getBannerTypeModule(selectedType)
  const quoteModule = activeBannerModule?.type === 'Quote' ? activeBannerModule : null
  const workshopModule = activeBannerModule?.type === 'Workshop' ? activeBannerModule : null
  const liveModule = activeBannerModule?.type === 'Live' ? activeBannerModule : null
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
  const workshopDerivedState = workshopModule
    ? workshopModule.getDerivedState({
        isDualSpeaker: isWorkshopDualSpeakerLayout,
        preset,
        speakerName,
        speakerRole,
        speakerImageUrl,
        workshopAccentColor,
        workshopBadge,
        workshopBulletOne,
        workshopBulletThree,
        workshopBulletTwo,
        workshopDescription,
        workshopFooterLeftLineOne,
        workshopFooterLeftLineTwo,
        workshopFooterTag,
        workshopHighlight,
        workshopPartnerLogoUrl,
        workshopSecondSpeakerImageUrl,
        workshopSecondSpeakerName,
        workshopSecondSpeakerRole,
        workshopTitle,
      })
    : null
  const liveDerivedState = liveModule
    ? liveModule.getDerivedState({
        liveSupportText,
        liveSupportTextBold,
        liveSupportTextCapslock,
        liveSecondSpeakerName,
        preset,
      })
    : null
  const hasQuoteSecondSlide = quoteDerivedState?.hasSecondSlide ?? false
  const hasArticleSecondSlide = isArticleLayout
  const hasSponsorCarouselSecondSlide = isSponsorCarouselLayout
  const hasIsolatedPreviewPanels =
    hasQuoteSecondSlide || hasArticleSecondSlide || hasSponsorCarouselSecondSlide
  const previewStyle = {
    '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
    backgroundImage: isArticleLayout || isWorkshopLayout || isOtherEventLayout
      ? 'none'
      : `url(${import.meta.env.BASE_URL}src/assets/themes/${previewBackgroundAsset})`,
    backgroundColor: isOtherEventLayout || isWorkshopLayout
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
    event: ClipboardEvent<HTMLDivElement>,
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

  const showInitialBannerChooser = screen === 'home'
  const initialBannerTypeOptions = groupedBannerOptions.flatMap((group) => group.options)

  // Renderização condicional por tela
  if (screen === 'salvos') {
    return (
      <div className="saved-banners-shell">
        <SavedBannersPage
          banners={savedBannerAssets}
          onEdit={handleEditSavedBanner}
          onDelete={handleDeleteSavedBanner}
          onBack={goHome}
        />
      </div>
    )
  }
  // Home/editor
  return (
    <div className="app-shell">
      <aside className="control-panel">
        <div className="panel-header">
          <div className="panel-badge">
            <span className="badge-icon" aria-hidden="true">
              <AppIcon name="spark" />
            </span>
            <strong>WoMakers Social Assets</strong>
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
            hasSelectedBannerOption={hasSelectedBannerType}
            isBannerMenuOpen={isBannerMenuOpen}
            selectedBannerOption={selectedBannerOption}
            onSelect={handleBannerSelect}
            onToggle={() => setIsBannerMenuOpen((open) => !open)}
          />
          <p className="field-hint">
            Encontro Pocket e Encontro Anual incluem Palestrante e Patrocinador Carousel. {selectedType === 'Workshop' ? 'Workshop inclui as variações Palestrante e Palestrantes.' : getBannerOptionGroupLabel(selectedType) === 'Outros eventos' ? 'Outros eventos usam um layout único.' : 'Quote e Artigo usam um layout único.'}
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
            <p className="section-label">{isQuoteLayout ? 'Conteudo da citacao' : isArticleLayout ? 'Trecho do artigo' : isWorkshopLayout ? 'Conteudo do workshop' : 'Conteudo do evento'}</p>
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
          ) : workshopModule ? (
            <workshopModule.ContentFields
              isDualSpeaker={isWorkshopDualSpeakerLayout}
              onWorkshopAccentColorChange={(value) => updateField('workshopAccentColor', value)}
              onWorkshopBadgeChange={(value) => updateField('workshopBadge', value)}
              onWorkshopBulletOneChange={(value) => updateField('workshopBulletOne', value)}
              onWorkshopBulletThreeChange={(value) => updateField('workshopBulletThree', value)}
              onWorkshopBulletTwoChange={(value) => updateField('workshopBulletTwo', value)}
              onWorkshopDescriptionChange={(value) => updateField('workshopDescription', value)}
              onWorkshopFooterLeftLineOneChange={(value) => updateField('workshopFooterLeftLineOne', value)}
              onWorkshopFooterLeftLineTwoChange={(value) => updateField('workshopFooterLeftLineTwo', value)}
              onWorkshopFooterTagChange={(value) => updateField('workshopFooterTag', value)}
              onWorkshopHighlightChange={(value) => updateField('workshopHighlight', value)}
              onWorkshopTitleChange={(value) => updateField('workshopTitle', value)}
              workshopAccentColor={workshopAccentColor}
              workshopBadge={workshopBadge}
              workshopBulletOne={workshopBulletOne}
              workshopBulletThree={workshopBulletThree}
              workshopBulletTwo={workshopBulletTwo}
              workshopDescription={workshopDescription}
              workshopFooterLeftLineOne={workshopFooterLeftLineOne}
              workshopFooterLeftLineTwo={workshopFooterLeftLineTwo}
              workshopFooterTag={workshopFooterTag}
              workshopHighlight={workshopHighlight}
              workshopTitle={workshopTitle}
            />
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
          ) : null}

          {isLiveLayout ? (
            liveModule ? (
              <liveModule.ContentFields
                liveSupportText={liveSupportText}
                liveSupportTextBold={liveSupportTextBold}
                liveSupportTextCapslock={liveSupportTextCapslock}
                liveFooterLeftText={liveFooterLeftText}
                liveFooterRightText={liveFooterRightText}
                onLiveSupportTextChange={(value) => updateField('liveSupportText', value)}
                onLiveSupportTextBoldToggle={(value) => updateField('liveSupportTextBold', value)}
                onLiveSupportTextCapslockToggle={(value) => updateField('liveSupportTextCapslock', value)}
                onLiveFooterLeftTextChange={(value) => updateField('liveFooterLeftText', value)}
                onLiveFooterRightTextChange={(value) => updateField('liveFooterRightText', value)}
              />
            ) : null
          ) : null}

          {!isQuoteLayout && !isArticleLayout && !isWorkshopLayout && !isLiveLayout ? (
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

          {!isOtherEventLayout && !isQuoteLayout && !isArticleLayout && !isWorkshopLayout ? (
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
        ) : workshopModule ? (
          <workshopModule.MediaFields
            isDualSpeaker={isWorkshopDualSpeakerLayout}
            onPartnerLogoUpload={handleWorkshopPartnerLogoUpload}
            onRemovePartnerLogo={handleRemoveWorkshopPartnerLogo}
            onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
            onRemoveSecondSpeakerPhoto={handleRemoveSecondSpeakerPhoto}
            onSpeakerNameChange={(value) => updateField('speakerName', value)}
            onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
            onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
            onSecondSpeakerNameChange={(value) => updateField('workshopSecondSpeakerName', value)}
            onSecondSpeakerPhotoUpload={handleSecondSpeakerPhotoUpload}
            onSecondSpeakerRoleChange={(value) => updateField('workshopSecondSpeakerRole', value)}
            partnerLogoFeedback={workshopPartnerLogoFeedback}
            partnerLogoUrl={workshopPartnerLogoUrl}
            photoFeedback={photoFeedback}
            secondPhotoFeedback={secondPhotoFeedback}
            secondSpeakerImageUrl={workshopSecondSpeakerImageUrl}
            secondSpeakerName={workshopSecondSpeakerName}
            secondSpeakerRole={workshopSecondSpeakerRole}
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
            photoFeedback={photoFeedback}
            secondPhotoFeedback={secondPhotoFeedback}
            partnerLogoFeedback={livePartnerLogoFeedback}
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
              <p className="section-label">Conteúdo do patrocinio</p>
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
                  toolbarLabel="Formatacao do texto 1 da segunda arte"
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
                {sponsorCarouselImageFeedback ? (
                  <p className="field-hint upload-feedback">{sponsorCarouselImageFeedback}</p>
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
                  toolbarLabel="Formatacao do texto 2 da segunda arte"
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
            <span>{isExporting ? 'Processando...' : 'Salvar versao'}</span>
          </button>
          <p className="footer-copy">
            {saveFeedback || 'As imagens salvas ficam disponiveis na pagina Modelos salvos.'}
          </p>
        </div>
      </aside>

      <main className="preview-area">
        <header className="preview-toolbar">
          <div>
            <p className="toolbar-kicker">{showInitialBannerChooser ? 'Começar' : 'Preview'}</p>
            <p className="toolbar-copy">
              {showInitialBannerChooser
                ? 'Escolha um tipo de banner para preencher o seletor e abrir a edição.'
                : `${getBannerOptionLabel(selectedType, selectedVariation, selectedPlatform)} (${getPlatformDimensions(selectedPlatform)}) para ${selectedType}.`}
            </p>
          </div>
          <div className="toolbar-actions" aria-label="Preview actions">
            {!showInitialBannerChooser && !hasIsolatedPreviewPanels ? (
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
            {!showInitialBannerChooser ? (
              <button type="button" className="ghost-button" onClick={goHome}>
                <AppIcon name="layers" className="button-icon" />
                Voltar para home
              </button>
            ) : null}
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

        <section
          ref={previewStageRef}
          className={`preview-stage ${hasIsolatedPreviewPanels ? 'is-preview-stack' : ''}`.trim()}
          aria-label="Banner preview mockup"
        >
          {showInitialBannerChooser ? (
            <section className="banner-type-browser" aria-label="Tipos de banner disponíveis">
              <div className="banner-type-browser-saved-link-row">
                <button type="button" className="ghost-button banner-type-browser-saved-link" onClick={goSalvos}>
                  <AppIcon name="save" className="button-icon" />
                  Ver modelos salvos
                </button>
              </div>
              {groupedBannerOptions.map((group) => {
                  const groupTypeOptions = initialBannerTypeOptions.filter((option) =>
                    group.options.some((groupOption) => groupOption.type === option.type)
                  )

                  // Adiciona tipos "em breve" para OUTROS EVENTOS
                  const comingSoon =
                    group.label === 'Outros eventos'
                      ? comingSoonTypes.map((type) => ({ type, label: type }))
                      : []

                  if (groupTypeOptions.length === 0 && comingSoon.length === 0) {
                    return null
                  }

                  return (
                    <div key={group.label} className="banner-type-browser-group">
                      <div className="banner-type-browser-heading">
                        <p className="preview-topline">{group.label}</p>
                        <p className="toolbar-copy">Selecione um formato para carregar a edição com esse layout.</p>
                      </div>
                      <div className="banner-type-browser-grid">
                        {groupTypeOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className="banner-type-card"
                            onClick={() => handleBannerSelect(option)}
                          >
                            <span className="banner-type-card-topline">{group.label}</span>
                            <strong className="banner-type-card-title">{option.type}</strong>
                            <span className="banner-type-card-copy">
                              {getBannerOptionLabel(option.type, option.variation, option.platform)}
                            </span>
                            <span className="banner-type-card-meta">{option.dimensions}</span>
                          </button>
                        ))}
                        {comingSoon.length > 0 && comingSoon.map((item) => (
                          <div key={item.type} className="banner-type-card is-coming-soon" aria-disabled="true">
                            <span className="banner-type-card-topline">{group.label}</span>
                            <strong className="banner-type-card-title">{item.label}</strong>
                            <span className="banner-type-card-copy">Em breve</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </section>
          ) : quoteModule && quoteDerivedState ? (
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
                    <p className="toolbar-copy">Segunda arte do carousel com bloco estático, texto, imagem e CTA.</p>
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
          ) : (
            <div
              className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSpeakerLayout ? 'is-annual-speaker' : ''} ${isAnnualSponsorLayout ? 'is-annual-sponsor' : ''} ${isPocketLayout ? 'is-pocket-layout' : ''} ${isPocketSpeakerLayout ? 'is-pocket-speaker' : ''} ${isPocketLayout && isSponsorLayout ? 'is-pocket-sponsor' : ''} ${isLiveLayout ? 'is-live-layout' : ''} ${isOtherEventLayout && !isLiveLayout ? 'is-meetup-layout' : ''} ${isWorkshopLayout ? 'is-workshop-layout' : ''} ${isArticleLayout ? 'is-article-layout' : ''}`}
              style={liveModule && liveDerivedState ? liveDerivedState.previewStyle : workshopDerivedState?.previewStyle ?? previewStyle}
              ref={primaryPreviewFrameRef}
            >
              <div className="preview-content">
                {liveModule && liveDerivedState ? (
                  <liveModule.Preview
                    eventTitle={eventTitle}
                    eventDate={eventDate}
                    speakerName={speakerName}
                    speakerRole={speakerRole}
                    speakerImageUrl={speakerImageUrl}
                    supportTextHtml={liveDerivedState.supportText}
                    liveFooterLeftText={liveFooterLeftText}
                    liveFooterRightText={liveFooterRightText}
                    liveSecondSpeakerName={liveSecondSpeakerName}
                    liveSecondSpeakerRole={liveSecondSpeakerRole}
                    liveSecondSpeakerImageUrl={liveSecondSpeakerImageUrl}
                    livePartnerLogoUrl1={livePartnerLogoUrl1}
                    livePartnerLogoUrl2={livePartnerLogoUrl2}
                    speakerInitials={speakerInitials}
                    secondSpeakerInitials={liveDerivedState.secondSpeakerInitials}
                  />
                ) : workshopModule && workshopDerivedState ? (
                  <workshopModule.Preview
                    isDualSpeaker={workshopDerivedState.isDualSpeaker}
                    speakerCards={workshopDerivedState.speakerCards}
                    workshopBadge={workshopDerivedState.workshopBadge}
                    workshopBullets={workshopDerivedState.workshopBullets}
                    workshopDescription={workshopDerivedState.workshopDescription}
                    workshopFooterLeftLineOne={workshopDerivedState.workshopFooterLeftLineOne}
                    workshopFooterLeftLineTwo={workshopDerivedState.workshopFooterLeftLineTwo}
                    workshopFooterTag={workshopDerivedState.workshopFooterTag}
                    workshopHighlight={workshopDerivedState.workshopHighlight}
                    workshopPartnerLogoUrl={workshopDerivedState.workshopPartnerLogoUrl}
                    workshopTitle={workshopDerivedState.workshopTitle}
                  />
                ) : isOtherEventLayout && !isLiveLayout ? (
                  <div className="meetup-preview-layout">
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

      </main>
    </div>
  )
}

export default App
