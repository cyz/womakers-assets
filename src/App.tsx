import type { ChangeEvent, CSSProperties } from 'react'
import { toPng } from 'html-to-image'
import { useEffect, useRef, useState } from 'react'
import './App.css'

const SAVED_EDITOR_STATE_KEY = 'womakers-assets:last-saved-banner'
const SAVED_EXPORTED_IMAGES_KEY = 'womakers-assets:saved-exported-images'
const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024
const MAX_SAVED_EXPORTED_IMAGES = 8

const imageTypes = [
  'Encontro Pocket',
  'Encontro Anual',
  'Meetup Presencial',
  'Live',
  'Imersão',
] as const

const assetVariations = ['Palestrante', 'Agenda'] as const
const defaultAssetVariation = assetVariations[0]

const platforms = [
  'Instagram Feed (1080x1350)',
] as const

const platformPresets: Record<(typeof platforms)[number], { width: number; height: number }> = {
  'Instagram Feed (1080x1350)': { width: 1080, height: 1350 },
}

type ImageType = (typeof imageTypes)[number]
type AssetVariation = (typeof assetVariations)[number]
type Platform = (typeof platforms)[number]

type EditorState = {
  selectedType: ImageType
  selectedVariation: AssetVariation
  selectedPlatform: Platform
  eventTitle: string
  eventCity: string
  eventDate: string
  eventLocation: string
  speakerName: string
  speakerRole: string
  speakerTalk: string
  speakerImageUrl: string
}

type BannerOption = {
  id: string
  type: ImageType
  variation: AssetVariation
  platform: Platform
  platformLabel: string
  dimensions: string
}

type SavedBannerAsset = {
  id: string
  fileName: string
  imageDataUrl: string
  savedAt: string
  editorState: EditorState
}

const bannerTypeVariations: Record<ImageType, AssetVariation[]> = {
  'Encontro Pocket': [...assetVariations],
  'Encontro Anual': [...assetVariations],
  'Meetup Presencial': [defaultAssetVariation],
  Live: [defaultAssetVariation],
  'Imersão': [defaultAssetVariation],
}

const initialEditorState: EditorState = {
  selectedType: imageTypes[0],
  selectedVariation: defaultAssetVariation,
  selectedPlatform: platforms[0],
  eventTitle: 'Encontro de Mulheres na Tecnologia:',
  eventCity: 'Porto Alegre',
  eventDate: '28 de março',
  eventLocation: 'Arena CMPC Tecnopuc',
  speakerName: 'Aryanne Silva',
  speakerRole: 'Senior Developer na Thoughtworks',
  speakerTalk: 'Painel: O Futuro das Carreiras Tech',
  speakerImageUrl: '',
}

const getPlatformLabel = (platform: Platform) => platform.replace(/\s*\([^)]*\)$/, '')

const getPlatformDimensions = (platform: Platform) => {
  const preset = platformPresets[platform]
  return `${preset.width}x${preset.height}`
}

const getTypeVariations = (type: ImageType) => bannerTypeVariations[type]

const hasTypeVariations = (type: ImageType) => getTypeVariations(type).length > 1

const getBannerOptionLabel = (type: ImageType, variation: AssetVariation, platform: Platform) => {
  const platformLabel = getPlatformLabel(platform)

  return hasTypeVariations(type) ? `${variation} · ${platformLabel}` : platformLabel
}

const normalizeEditorState = (state: EditorState): EditorState => {
  const supportedVariations = getTypeVariations(state.selectedType)

  return {
    ...state,
    selectedVariation: supportedVariations.includes(state.selectedVariation)
      ? state.selectedVariation
      : supportedVariations[0],
  }
}

const bannerOptions: BannerOption[] = imageTypes.flatMap((type) =>
  getTypeVariations(type).flatMap((variation) =>
    platforms.map((platform) => ({
      id: `${type}::${variation}::${platform}`,
      type,
      variation,
      platform,
      platformLabel: getPlatformLabel(platform),
      dimensions: getPlatformDimensions(platform),
    })),
  ),
)

const groupedBannerOptions = imageTypes.map((type) => ({
  type,
  options: bannerOptions.filter((option) => option.type === type),
}))

const isEditorStateEqual = (left: EditorState, right: EditorState) =>
  left.selectedType === right.selectedType &&
  left.selectedVariation === right.selectedVariation &&
  left.selectedPlatform === right.selectedPlatform &&
  left.eventTitle === right.eventTitle &&
  left.eventCity === right.eventCity &&
  left.eventDate === right.eventDate &&
  left.eventLocation === right.eventLocation &&
  left.speakerName === right.speakerName &&
  left.speakerRole === right.speakerRole &&
  left.speakerTalk === right.speakerTalk &&
  left.speakerImageUrl === right.speakerImageUrl

const isImageType = (value: string): value is ImageType => imageTypes.includes(value as ImageType)

const isAssetVariation = (value: string): value is AssetVariation =>
  assetVariations.includes(value as AssetVariation)

const isPlatform = (value: string): value is Platform => platforms.includes(value as Platform)

const parseEditorStateCandidate = (parsed: Partial<EditorState> | null | undefined): EditorState | null => {
  if (
    !parsed ||
    !isImageType(parsed.selectedType ?? '') ||
    !isAssetVariation(parsed.selectedVariation ?? '') ||
    !isPlatform(parsed.selectedPlatform ?? '')
  ) {
    return null
  }

  const textFields: Array<keyof Omit<EditorState, 'selectedType' | 'selectedVariation' | 'selectedPlatform'>> = [
    'eventTitle',
    'eventCity',
    'eventDate',
    'eventLocation',
    'speakerName',
    'speakerRole',
    'speakerTalk',
    'speakerImageUrl',
  ]

  if (textFields.some((field) => typeof parsed[field] !== 'string')) {
    return null
  }

  return {
    selectedType: parsed.selectedType as ImageType,
    selectedVariation: parsed.selectedVariation as AssetVariation,
    selectedPlatform: parsed.selectedPlatform as Platform,
    eventTitle: parsed.eventTitle ?? '',
    eventCity: parsed.eventCity ?? '',
    eventDate: parsed.eventDate ?? '',
    eventLocation: parsed.eventLocation ?? '',
    speakerName: parsed.speakerName ?? '',
    speakerRole: parsed.speakerRole ?? '',
    speakerTalk: parsed.speakerTalk ?? '',
    speakerImageUrl: parsed.speakerImageUrl ?? '',
  }
}

const parseSavedEditorState = (rawValue: string | null): EditorState | null => {
  if (!rawValue) {
    return null
  }

  try {
    return parseEditorStateCandidate(JSON.parse(rawValue) as Partial<EditorState>)
  } catch {
    return null
  }
}

const parseSavedBannerAssets = (rawValue: string | null): SavedBannerAsset[] => {
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .flatMap((item) => {
        if (!item || typeof item !== 'object') {
          return []
        }

        const candidate = item as Partial<SavedBannerAsset>
        const editorState = parseEditorStateCandidate(candidate.editorState as Partial<EditorState>)

        if (
          !editorState ||
          typeof candidate.id !== 'string' ||
          typeof candidate.fileName !== 'string' ||
          typeof candidate.imageDataUrl !== 'string' ||
          typeof candidate.savedAt !== 'string'
        ) {
          return []
        }

        return [{
          id: candidate.id,
          fileName: candidate.fileName,
          imageDataUrl: candidate.imageDataUrl,
          savedAt: candidate.savedAt,
          editorState,
        }]
      })
      .slice(0, MAX_SAVED_EXPORTED_IMAGES)
  } catch {
    return []
  }
}

const loadSavedEditorState = () => {
  if (typeof window === 'undefined') {
    return initialEditorState
  }

  const savedState = parseSavedEditorState(window.localStorage.getItem(SAVED_EDITOR_STATE_KEY))

  return savedState ? normalizeEditorState(savedState) : initialEditorState
}

const loadSavedBannerAssets = () => {
  if (typeof window === 'undefined') {
    return []
  }

  return parseSavedBannerAssets(window.localStorage.getItem(SAVED_EXPORTED_IMAGES_KEY))
}

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const buildBannerFileName = (state: EditorState) => {
  const parts = [
    state.selectedType,
    hasTypeVariations(state.selectedType) ? state.selectedVariation : '',
    state.eventCity,
  ]
    .map(slugify)
    .filter(Boolean)

  return `${parts.join('-') || 'banner'}-${Date.now()}.png`
}

const downloadImage = (imageDataUrl: string, fileName: string) => {
  const link = document.createElement('a')
  link.href = imageDataUrl
  link.download = fileName
  link.click()
}

const formatSavedAt = (savedAt: string) =>
  new Date(savedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

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

type IconName =
  | 'spark'
  | 'calendar'
  | 'layout'
  | 'swatch'
  | 'text'
  | 'download'
  | 'chevronDown'
  | 'layers'
  | 'refresh'
  | 'undo'
  | 'redo'
  | 'pin'
  | 'image'
  | 'close'
  | 'save'

function AppIcon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 2 13.9 7.1 19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2Z" />
          <path d="M18.5 15 19.4 17.6 22 18.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )
    case 'layout':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16M9 10h12" />
        </svg>
      )
    case 'swatch':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 9 9c0-1.6-1.1-2.7-2.7-2.7h-2.1a1.7 1.7 0 0 1 0-3.3H15A3 3 0 0 0 12 3Z" />
          <circle cx="7.5" cy="11" r="1" />
          <circle cx="10" cy="7.5" r="1" />
          <circle cx="14" cy="7.5" r="1" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 6h16M8 6v12M16 6v12M6 18h12" />
        </svg>
      )
    case 'download':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 4v11" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'chevronDown':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      )
    case 'refresh':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20 11a8 8 0 0 0-14-4" />
          <path d="M4 4v5h5" />
          <path d="M4 13a8 8 0 0 0 14 4" />
          <path d="M20 20v-5h-5" />
        </svg>
      )
    case 'undo':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M10 8 5 12l5 4" />
          <path d="M6 12h8a5 5 0 1 1 0 10h-2" />
        </svg>
      )
    case 'redo':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m14 8 5 4-5 4" />
          <path d="M18 12h-8a5 5 0 1 0 0 10h2" />
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'image':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 16-5.5-5.5L7 19" />
        </svg>
      )
    case 'close':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </svg>
      )
    case 'save':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v6h8" />
          <path d="M9 20v-6h6v6" />
        </svg>
      )
  }
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
  const bannerMenuRef = useRef<HTMLDivElement | null>(null)
  const previewFrameRef = useRef<HTMLDivElement | null>(null)
  const selectedTheme = 'WoMakers'

  const {
    selectedType,
    selectedVariation,
    selectedPlatform,
    eventTitle,
    eventCity,
    eventDate,
    eventLocation,
    speakerName,
    speakerRole,
    speakerTalk,
    speakerImageUrl,
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

  const handleSpeakerPhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoFeedback('Selecione apenas arquivos de imagem.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setPhotoFeedback('A imagem deve ter no maximo 8 MB.')
      event.target.value = ''
      return
    }

    try {
      const dataUrl = await convertImageFileToDataUrl(file)
      updateField('speakerImageUrl', dataUrl)
      setPhotoFeedback(`Foto carregada: ${file.name}`)
    } catch (error) {
      setPhotoFeedback(
        error instanceof Error ? error.message : 'Nao foi possivel carregar a foto selecionada.',
      )
    }

    event.target.value = ''
  }

  const handleRemoveSpeakerPhoto = () => {
    updateField('speakerImageUrl', '')
    setPhotoFeedback('Foto removida.')
  }

  const exportCurrentBannerImage = async () => {
    if (!previewFrameRef.current) {
      throw new Error('Nao foi possivel localizar a preview para exportacao.')
    }

    const pixelRatio = Math.min(
      3,
      Math.max(1, preset.width / Math.max(previewFrameRef.current.clientWidth, 1)),
    )

    return toPng(previewFrameRef.current, {
      cacheBust: true,
      pixelRatio,
    })
  }

  const createSavedBannerAsset = async (): Promise<SavedBannerAsset> => ({
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
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
  const isAnnualSpeakerLayout =
    selectedType === 'Encontro Anual' && selectedVariation === 'Palestrante'
  const isPocketSpeakerLayout =
    selectedType === 'Encontro Pocket' && selectedVariation === 'Palestrante'
  const hasEventDetails = eventDate.trim() || eventLocation.trim()

  const preset = platformPresets[selectedPlatform]
  const previewBackgroundAsset =
    selectedType === 'Encontro Anual' && selectedVariation === 'Palestrante'
      ? 'bg-matrix.png'
      : 'bg-code.png'
  const previewStyle = {
    '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
    backgroundImage: `linear-gradient(180deg, rgba(4, 4, 7, 0.12), rgba(4, 4, 7, 0.58)), url(${import.meta.env.BASE_URL}src/assets/themes/${previewBackgroundAsset})`,
  } as CSSProperties

  const speakerInitials = speakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

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

          <label className="field-label" htmlFor="banner-type-trigger">
            Tipo de banner
          </label>
          <div className={`banner-select ${isBannerMenuOpen ? 'is-open' : ''}`} ref={bannerMenuRef}>
            <button
              type="button"
              id="banner-type-trigger"
              className="banner-select-trigger"
              aria-haspopup="listbox"
              aria-expanded={isBannerMenuOpen}
              onClick={() => setIsBannerMenuOpen((open) => !open)}
            >
              <span className="select-leading-icon" aria-hidden="true">
                <AppIcon name="calendar" />
              </span>
              <span className="banner-select-copy">
                <span className="banner-select-category">{selectedBannerOption.type}</span>
                <span className="banner-select-value">
                  {getBannerOptionLabel(
                    selectedBannerOption.type,
                    selectedBannerOption.variation,
                    selectedBannerOption.platform,
                  )}
                  <span className="banner-select-dimensions"> ({selectedBannerOption.dimensions})</span>
                </span>
              </span>
              <span className="select-chevron" aria-hidden="true">
                <AppIcon name="chevronDown" />
              </span>
            </button>

            {isBannerMenuOpen ? (
              <div className="banner-select-menu" role="listbox" aria-label="Tipo de banner">
                {groupedBannerOptions.map((group) => (
                  <div key={group.type} className="banner-select-group">
                    <p className="banner-select-group-label">{group.type}</p>
                    {group.options.map((option) => {
                      const isSelected = option.id === selectedBannerOption.id

                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`banner-option ${isSelected ? 'is-selected' : ''}`}
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => handleBannerSelect(option)}
                        >
                          <span className="banner-option-name">
                            {getBannerOptionLabel(option.type, option.variation, option.platform)}
                          </span>
                          <span className="banner-option-dimensions">
                            ({option.dimensions})
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <p className="field-hint">
            Encontro Pocket e Encontro Anual têm variações de Palestrante e Agenda. Meetup Presencial, Live e Imersão usam um layout único.
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
            <p className="section-label">Conteudo do evento</p>
          </div>

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
        </section>

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
            <button
              type="button"
              className="ghost-button"
              onClick={handleDownloadCurrentBanner}
              disabled={isExporting}
            >
              <AppIcon name="download" className="button-icon" />
              {isExporting ? 'Gerando...' : 'Baixar PNG'}
            </button>
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

        <section className="preview-stage" aria-label="Banner preview mockup">
          <div
            className={`preview-frame theme-${selectedTheme.toLowerCase()} ${isAnnualSpeakerLayout ? 'is-annual-speaker' : ''} ${isPocketSpeakerLayout ? 'is-pocket-speaker' : ''}`}
            style={previewStyle}
            ref={previewFrameRef}
          >
            <div className="preview-overlay" />
            <div className="preview-content">
              <header className="event-header">
                <h2 className="event-title">
                  <span className="event-title-segment">{eventTitle}</span>
                  {eventCity.trim() ? <span className="event-city event-title-segment"> {eventCity}</span> : null}
                </h2>

                {!isAnnualSpeakerLayout && hasEventDetails ? (
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

              {speakerTalk.trim() ? (
                <footer className="talk-footer">
                  <p>{speakerTalk}</p>
                </footer>
              ) : null}
            </div>
          </div>
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
                      {asset.editorState.eventCity || 'Sem cidade'} · {formatSavedAt(asset.savedAt)}
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
