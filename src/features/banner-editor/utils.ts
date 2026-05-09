import {
  MAX_SAVED_EXPORTED_IMAGES,
  SAVED_EDITOR_STATE_KEY,
  SAVED_EXPORTED_IMAGES_KEY,
  assetVariations,
  bannerTypeVariations,
  imageTypes,
  initialEditorState,
  platformPresets,
  platforms,
  sponsorVariations,
  type AssetVariation,
  type BannerOption,
  type EditorState,
  type ImageType,
  type Platform,
  type SavedBannerAsset,
  type SponsorVariation,
  type WorkshopAccentColor,
  workshopAccentColors,
} from './model'

export const getPlatformLabel = (platform: Platform) => platform.replace(/\s*\([^)]*\)$/, '')

export const getPlatformDimensions = (platform: Platform) => {
  const preset = platformPresets[platform]
  return `${preset.width}x${preset.height}`
}

export const getTypeVariations = (type: ImageType) => bannerTypeVariations[type]

export const hasTypeVariations = (type: ImageType) => getTypeVariations(type).length > 1

export const isSponsorVariation = (variation: AssetVariation): variation is SponsorVariation =>
  sponsorVariations.includes(variation as SponsorVariation)

export const getBannerOptionLabel = (
  type: ImageType,
  variation: AssetVariation,
  platform: Platform,
) => {
  const platformLabel = getPlatformLabel(platform)

  return hasTypeVariations(type) ? `${variation} · ${platformLabel}` : platformLabel
}

export const normalizeEditorState = (state: EditorState): EditorState => {
  const supportedVariations = getTypeVariations(state.selectedType)

  return {
    ...state,
    selectedVariation: supportedVariations.includes(state.selectedVariation)
      ? state.selectedVariation
      : supportedVariations[0],
  }
}

export const bannerOptions: BannerOption[] = imageTypes.flatMap((type) =>
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

const bannerOptionGroups = [
  {
    label: 'Encontro Pocket',
    types: ['Encontro Pocket'],
  },
  {
    label: 'Encontro Anual',
    types: ['Encontro Anual'],
  },
  {
    label: 'Outros eventos',
    types: ['Meetup Presencial', 'Live', 'Workshop', 'Imersão'],
  },
  {
    label: 'Quote',
    types: ['Quote'],
  },
  {
    label: 'Artigo',
    types: ['Artigo'],
  },
] as const satisfies ReadonlyArray<{
  label: string
  types: readonly ImageType[]
}>

export const getBannerOptionGroupLabel = (type: ImageType) =>
  bannerOptionGroups.find((group) => group.types.some((groupType) => groupType === type))?.label ??
  type

export const groupedBannerOptions = bannerOptionGroups.map((group) => ({
  label: group.label,
  options: bannerOptions.filter((option) =>
    group.types.some((groupType) => groupType === option.type),
  ),
}))

export const isEditorStateEqual = (left: EditorState, right: EditorState) =>
  left.selectedType === right.selectedType &&
  left.selectedVariation === right.selectedVariation &&
  left.selectedPlatform === right.selectedPlatform &&
  left.eventTitle === right.eventTitle &&
  left.workshopAccentColor === right.workshopAccentColor &&
  left.workshopBadge === right.workshopBadge &&
  left.workshopTitle === right.workshopTitle &&
  left.workshopHighlight === right.workshopHighlight &&
  left.workshopDescription === right.workshopDescription &&
  left.workshopBulletOne === right.workshopBulletOne &&
  left.workshopBulletTwo === right.workshopBulletTwo &&
  left.workshopBulletThree === right.workshopBulletThree &&
  left.workshopFooterLeftLineOne === right.workshopFooterLeftLineOne &&
  left.workshopFooterLeftLineTwo === right.workshopFooterLeftLineTwo &&
  left.workshopFooterTag === right.workshopFooterTag &&
  left.workshopPartnerLogoUrl === right.workshopPartnerLogoUrl &&
  left.workshopSecondSpeakerName === right.workshopSecondSpeakerName &&
  left.workshopSecondSpeakerRole === right.workshopSecondSpeakerRole &&
  left.workshopSecondSpeakerImageUrl === right.workshopSecondSpeakerImageUrl &&
  left.meetupHeadline === right.meetupHeadline &&
  left.meetupSupportText === right.meetupSupportText &&
  left.meetupCta === right.meetupCta &&
  left.eventCity === right.eventCity &&
  left.eventDate === right.eventDate &&
  left.eventLocation === right.eventLocation &&
  left.showAnnualCta === right.showAnnualCta &&
  left.annualCtaCaption === right.annualCtaCaption &&
  left.annualCta === right.annualCta &&
  left.sponsorTitle === right.sponsorTitle &&
  left.sponsorLogoUrl === right.sponsorLogoUrl &&
  left.sponsorCarouselLeadText === right.sponsorCarouselLeadText &&
  left.sponsorCarouselImageUrl === right.sponsorCarouselImageUrl &&
  left.sponsorCarouselBodyText === right.sponsorCarouselBodyText &&
  left.sponsorCarouselCta === right.sponsorCarouselCta &&
  left.quoteText === right.quoteText &&
  left.quoteSecondText === right.quoteSecondText &&
  left.articleSecondText === right.articleSecondText &&
  left.articleSecondKeyword === right.articleSecondKeyword &&
  left.quoteBackgroundImageUrl === right.quoteBackgroundImageUrl &&
  left.speakerName === right.speakerName &&
  left.speakerRole === right.speakerRole &&
  left.speakerTalk === right.speakerTalk &&
  left.speakerImageUrl === right.speakerImageUrl &&
  left.meetupBackgroundImageUrl === right.meetupBackgroundImageUrl &&
  left.meetupPartnerLogoPrimaryUrl === right.meetupPartnerLogoPrimaryUrl &&
  left.meetupPartnerLogoSecondaryUrl === right.meetupPartnerLogoSecondaryUrl

export const isImageType = (value: string): value is ImageType => imageTypes.includes(value as ImageType)

export const isAssetVariation = (value: string): value is AssetVariation =>
  assetVariations.includes(value as AssetVariation)

export const isPlatform = (value: string): value is Platform => platforms.includes(value as Platform)

export const isWorkshopAccentColor = (value: string): value is WorkshopAccentColor =>
  workshopAccentColors.includes(value as WorkshopAccentColor)

export const parseEditorStateCandidate = (
  parsed: Partial<EditorState> | null | undefined,
): EditorState | null => {
  if (
    !parsed ||
    !isImageType(parsed.selectedType ?? '') ||
    !isAssetVariation(parsed.selectedVariation ?? '') ||
    !isPlatform(parsed.selectedPlatform ?? '') ||
    !isWorkshopAccentColor(parsed.workshopAccentColor ?? initialEditorState.workshopAccentColor)
  ) {
    return null
  }

  const requiredTextFields: Array<keyof EditorState> = [
    'eventTitle',
    'annualCtaCaption',
    'annualCta',
    'sponsorTitle',
    'sponsorLogoUrl',
    'sponsorCarouselLeadText',
    'sponsorCarouselImageUrl',
    'sponsorCarouselBodyText',
    'sponsorCarouselCta',
    'quoteText',
    'quoteSecondText',
    'articleSecondText',
    'articleSecondKeyword',
    'speakerName',
    'speakerRole',
    'speakerTalk',
    'speakerImageUrl',
  ]

  if (
    typeof parsed.showAnnualCta !== 'boolean' ||
    requiredTextFields.some((field) => typeof parsed[field] !== 'string')
  ) {
    return null
  }

  return {
    selectedType: parsed.selectedType as ImageType,
    selectedVariation: parsed.selectedVariation as AssetVariation,
    selectedPlatform: parsed.selectedPlatform as Platform,
    eventTitle: parsed.eventTitle ?? '',
    workshopAccentColor:
      (parsed.workshopAccentColor as WorkshopAccentColor | undefined) ??
      initialEditorState.workshopAccentColor,
    workshopBadge: parsed.workshopBadge ?? initialEditorState.workshopBadge,
    workshopTitle: parsed.workshopTitle ?? initialEditorState.workshopTitle,
    workshopHighlight: parsed.workshopHighlight ?? initialEditorState.workshopHighlight,
    workshopDescription: parsed.workshopDescription ?? initialEditorState.workshopDescription,
    workshopBulletOne: parsed.workshopBulletOne ?? initialEditorState.workshopBulletOne,
    workshopBulletTwo: parsed.workshopBulletTwo ?? initialEditorState.workshopBulletTwo,
    workshopBulletThree: parsed.workshopBulletThree ?? initialEditorState.workshopBulletThree,
    workshopFooterLeftLineOne:
      parsed.workshopFooterLeftLineOne ?? initialEditorState.workshopFooterLeftLineOne,
    workshopFooterLeftLineTwo:
      parsed.workshopFooterLeftLineTwo ?? initialEditorState.workshopFooterLeftLineTwo,
    workshopFooterTag: parsed.workshopFooterTag ?? initialEditorState.workshopFooterTag,
    workshopPartnerLogoUrl: parsed.workshopPartnerLogoUrl ?? '',
    workshopSecondSpeakerName:
      parsed.workshopSecondSpeakerName ?? initialEditorState.workshopSecondSpeakerName,
    workshopSecondSpeakerRole:
      parsed.workshopSecondSpeakerRole ?? initialEditorState.workshopSecondSpeakerRole,
    workshopSecondSpeakerImageUrl: parsed.workshopSecondSpeakerImageUrl ?? '',
    meetupHeadline: parsed.meetupHeadline ?? '',
    meetupSupportText: parsed.meetupSupportText ?? '',
    meetupCta: parsed.meetupCta ?? initialEditorState.meetupCta,
    eventCity: parsed.eventCity ?? '',
    eventDate: parsed.eventDate ?? '',
    eventLocation: parsed.eventLocation ?? '',
    showAnnualCta: parsed.showAnnualCta ?? false,
    annualCtaCaption: parsed.annualCtaCaption ?? '',
    annualCta: parsed.annualCta ?? '',
    sponsorTitle: parsed.sponsorTitle ?? initialEditorState.sponsorTitle,
    sponsorLogoUrl: parsed.sponsorLogoUrl ?? '',
    sponsorCarouselLeadText:
      parsed.sponsorCarouselLeadText ?? initialEditorState.sponsorCarouselLeadText,
    sponsorCarouselImageUrl: parsed.sponsorCarouselImageUrl ?? '',
    sponsorCarouselBodyText:
      parsed.sponsorCarouselBodyText ?? initialEditorState.sponsorCarouselBodyText,
    sponsorCarouselCta: parsed.sponsorCarouselCta ?? initialEditorState.sponsorCarouselCta,
    quoteText: parsed.quoteText ?? initialEditorState.quoteText,
    quoteSecondText: parsed.quoteSecondText ?? initialEditorState.quoteSecondText,
    articleSecondText: parsed.articleSecondText ?? initialEditorState.articleSecondText,
    articleSecondKeyword: parsed.articleSecondKeyword ?? initialEditorState.articleSecondKeyword,
    quoteBackgroundImageUrl: parsed.quoteBackgroundImageUrl ?? '',
    speakerName: parsed.speakerName ?? '',
    speakerRole: parsed.speakerRole ?? '',
    speakerTalk: parsed.speakerTalk ?? '',
    speakerImageUrl: parsed.speakerImageUrl ?? '',
    meetupBackgroundImageUrl: parsed.meetupBackgroundImageUrl ?? '',
    meetupPartnerLogoPrimaryUrl: parsed.meetupPartnerLogoPrimaryUrl ?? '',
    meetupPartnerLogoSecondaryUrl: parsed.meetupPartnerLogoSecondaryUrl ?? '',
  }
}

export const parseSavedEditorState = (rawValue: string | null): EditorState | null => {
  if (!rawValue) {
    return null
  }

  try {
    return parseEditorStateCandidate(JSON.parse(rawValue) as Partial<EditorState>)
  } catch {
    return null
  }
}

export const parseSavedBannerAssets = (rawValue: string | null): SavedBannerAsset[] => {
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

export const loadSavedEditorState = () => {
  if (typeof window === 'undefined') {
    return initialEditorState
  }

  const savedState = parseSavedEditorState(window.localStorage.getItem(SAVED_EDITOR_STATE_KEY))

  return savedState ? normalizeEditorState(savedState) : initialEditorState
}

export const loadSavedBannerAssets = () => {
  if (typeof window === 'undefined') {
    return []
  }

  return parseSavedBannerAssets(window.localStorage.getItem(SAVED_EXPORTED_IMAGES_KEY))
}

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const buildBannerFileName = (state: EditorState) => {
  const parts = [
    state.selectedType,
    hasTypeVariations(state.selectedType) ? state.selectedVariation : '',
    state.selectedType === 'Meetup Presencial'
      ? state.eventTitle
      : state.selectedType === 'Workshop'
        ? state.workshopTitle
      : state.selectedType === 'Quote' || state.selectedType === 'Artigo'
        ? state.speakerName
        : state.eventCity,
  ]
    .map(slugify)
    .filter(Boolean)

  return `${parts.join('-') || 'banner'}-${Date.now()}.png`
}

export const formatSavedAt = (savedAt: string) =>
  new Date(savedAt).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export const createSavedBannerId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`

export const sanitizeQuoteHtml = (value: string) => {
  if (typeof document === 'undefined') {
    return value
      .replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, '')
      .replace(/<b>/gi, '<strong>')
      .replace(/<\/b>/gi, '</strong>')
      .replace(/<i>/gi, '<em>')
      .replace(/<\/i>/gi, '</em>')
  }

  const container = document.createElement('div')
  container.innerHTML = value

  const serializeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? ''
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return ''
    }

    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()
    const children = Array.from(element.childNodes).map(serializeNode).join('')

    if (tagName === 'br') {
      return '<br>'
    }

    if (tagName === 'strong' || tagName === 'b') {
      return `<strong>${children}</strong>`
    }

    if (tagName === 'em' || tagName === 'i') {
      return `<em>${children}</em>`
    }

    if (tagName === 'div' || tagName === 'p') {
      return children ? `${children}<br>` : ''
    }

    return children
  }

  return Array.from(container.childNodes)
    .map(serializeNode)
    .join('')
    .replace(/(<br>){3,}/g, '<br><br>')
    .replace(/(<br>)+$/g, '')
}