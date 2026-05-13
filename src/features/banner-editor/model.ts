export const SAVED_EDITOR_STATE_KEY = 'womakers-assets:last-saved-banner'
export const SAVED_EXPORTED_IMAGES_KEY = 'womakers-assets:saved-exported-images'
export const MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024
export const MAX_SAVED_EXPORTED_IMAGES = 8

export const imageTypes = [
  'Encontro Pocket',
  'Encontro Anual',
  'Meetup Presencial',
  'Live',
  'Workshop',
  'Quote',
  'Artigo',
  'Imersão',
] as const

export const assetVariations = [
  'Palestrante',
  'Palestrantes',
  'Agenda',
  'Patrocinador Carousel',
] as const

export const sponsorVariations = ['Patrocinador Carousel'] as const
export const sidebarReadyVariations = [
  'Palestrante',
  'Patrocinador Carousel',
] as const
export const defaultAssetVariation = assetVariations[0]

export const platforms = [
  'Instagram Feed (1080x1350)',
] as const

export const platformPresets: Record<(typeof platforms)[number], { width: number; height: number }> = {
  'Instagram Feed (1080x1350)': { width: 1080, height: 1350 },
}

export type ImageType = (typeof imageTypes)[number]
export type AssetVariation = (typeof assetVariations)[number]
export type SponsorVariation = (typeof sponsorVariations)[number]
export type Platform = (typeof platforms)[number]

export const workshopAccentColors = ['Lima', 'Magenta', 'Ciano', 'Laranja'] as const

export type WorkshopAccentColor = (typeof workshopAccentColors)[number]

export type EditorState = {
  selectedType: ImageType
  selectedVariation: AssetVariation
  selectedPlatform: Platform
  eventTitle: string
  workshopAccentColor: WorkshopAccentColor
  workshopBadge: string
  workshopTitle: string
  workshopHighlight: string
  workshopBulletsIntro: string
  workshopDescription: string
  workshopBulletOne: string
  workshopBulletTwo: string
  workshopBulletThree: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopPartnerLogoUrl: string
  workshopSecondSpeakerName: string
  workshopSecondSpeakerRole: string
  workshopSecondSpeakerImageUrl: string
  meetupHeadline: string
  meetupSupportText: string
  meetupCta: string
  eventCity: string
  eventDate: string
  eventLocation: string
  showAnnualCta: boolean
  annualCtaCaption: string
  annualCta: string
  sponsorTitle: string
  sponsorLogoUrl: string
  sponsorCarouselLeadText: string
  sponsorCarouselImageUrl: string
  sponsorCarouselBodyText: string
  sponsorCarouselCta: string
  quoteText: string
  quoteSecondText: string
  articleSecondText: string
  articleSecondKeyword: string
  quoteBackgroundImageUrl: string
  speakerName: string
  speakerRole: string
  speakerTalk: string
  speakerImageUrl: string
  meetupBackgroundImageUrl: string
  meetupPartnerLogoPrimaryUrl: string
  meetupPartnerLogoSecondaryUrl: string
  liveSupportText: string
  liveSupportTextBold: boolean
  liveSupportTextCapslock: boolean
  liveFooterLeftText: string
  liveFooterRightText: string
  liveSecondSpeakerName: string
  liveSecondSpeakerRole: string
  liveSecondSpeakerImageUrl: string
  livePartnerLogoUrl1: string
  livePartnerLogoUrl2: string
}

export type BannerOption = {
  id: string
  type: ImageType
  variation: AssetVariation
  platform: Platform
  platformLabel: string
  dimensions: string
}

export type SavedBannerAsset = {
  id: string
  fileName: string
  imageDataUrl: string
  savedAt: string
  editorState: EditorState
}

export type MeetupLogoAsset = {
  id: string
  src: string
  alt: string
  className: string
}

export const bannerTypeVariations: Record<ImageType, AssetVariation[]> = {
  'Encontro Pocket': [...sidebarReadyVariations],
  'Encontro Anual': [...sidebarReadyVariations],
  'Meetup Presencial': [defaultAssetVariation],
  Live: [defaultAssetVariation],
  Workshop: [defaultAssetVariation, 'Palestrantes'],
  Quote: [defaultAssetVariation],
  Artigo: [defaultAssetVariation],
  'Imersão': [defaultAssetVariation],
}

export const articlePreviewDefaults = {
  speakerName: 'Cynthia Zanoni',
  speakerRole: 'Senior Developer Advocate na Microsoft',
  quoteText:
    'Não dá para falar de futuro do trabalho, tecnologia e cidadania digital se os estudantes não desenvolvem, ao longo da escola, letramento digital, pensamento computacional e uma relação mais crítica e produtiva com a tecnologia. A diretriz já existe, o que falta é virar realidade no chão da escola, com apoio a redes estaduais e municipais, formação de professores, materiais e infraestrutura mínima. [...]',
  speakerTalk: 'Leia a entrevista completa',
} as const

export const articleAdviceDefaults = {
  title: 'CONSELHO',
  text:
    'Meu conselho é uma <strong>provocação.</strong><br><br>Então eu te pergunto: o que você está fazendo hoje para chegar aonde quer chegar?<br><br>Como está se preparando para as suas conquistas? Qual é o seu plano?<br><br>Quem são suas aliadas?<br><br>E sempre lembre de acreditar em você, acreditar no processo. E estudar sempre!',
  keyword: 'CARREIRA',
} as const

export const workshopPreviewDefaults = {
  accentColor: workshopAccentColors[0],
  badge: 'Workshop | 14-05 as 19h',
  title: 'Infraestrutura de TI voltada para',
  highlight: 'Data Center',
  bulletsIntro: '',
  description: 'Reference site about Lorem Ipsum, giving information on its origins, as well as a random Lipsum generator',
  bulletOne: 'Lorem Ipsum, giving information',
  bulletTwo: 'Lorem Ipsum, giving information',
  bulletThree: 'Lorem Ipsum, giving information',
  footerLeftLineOne: 'Evento Online',
  footerLeftLineTwo: 'Transmissão via Google Meet',
  footerTag: 'Inscrições abertas',
  speakerName: 'Nadav Peretz Mals',
  speakerRole: 'Co-founder da mgmt.',
  secondSpeakerName: 'Segunda palestrante',
  secondSpeakerRole: 'Cargo da segunda palestrante',
} as const

export const initialEditorState: EditorState = {
  selectedType: imageTypes[0],
  selectedVariation: defaultAssetVariation,
  selectedPlatform: platforms[0],
  eventTitle: 'Encontro de Mulheres na Tecnologia:',
  workshopAccentColor: workshopPreviewDefaults.accentColor,
  workshopBadge: workshopPreviewDefaults.badge,
  workshopTitle: workshopPreviewDefaults.title,
  workshopHighlight: workshopPreviewDefaults.highlight,
  workshopBulletsIntro: workshopPreviewDefaults.bulletsIntro,
  workshopDescription: workshopPreviewDefaults.description,
  workshopBulletOne: workshopPreviewDefaults.bulletOne,
  workshopBulletTwo: workshopPreviewDefaults.bulletTwo,
  workshopBulletThree: workshopPreviewDefaults.bulletThree,
  workshopFooterLeftLineOne: workshopPreviewDefaults.footerLeftLineOne,
  workshopFooterLeftLineTwo: workshopPreviewDefaults.footerLeftLineTwo,
  workshopFooterTag: workshopPreviewDefaults.footerTag,
  workshopPartnerLogoUrl: '',
  workshopSecondSpeakerName: workshopPreviewDefaults.secondSpeakerName,
  workshopSecondSpeakerRole: workshopPreviewDefaults.secondSpeakerRole,
  workshopSecondSpeakerImageUrl: '',
  meetupHeadline: 'Presencial',
  meetupSupportText: '',
  meetupCta: 'Inscreva-se agora',
  eventCity: 'Porto Alegre',
  eventDate: '28 de março',
  eventLocation: 'Arena CMPC Tecnopuc',
  showAnnualCta: false,
  annualCtaCaption: 'Legenda CTA',
  annualCta: 'Inscreva-se',
  sponsorTitle: 'Patrocínio',
  sponsorLogoUrl: '',
  sponsorCarouselLeadText:
    'Conte para a comunidade como sua marca impulsiona iniciativas para mulheres na tecnologia e destaque os pontos que merecem atenção neste slide.',
  sponsorCarouselImageUrl: '',
  sponsorCarouselBodyText:
    'Use este segundo trecho para complementar a mensagem com detalhes, benefícios, contexto da parceria ou convite para conhecer mais.',
  sponsorCarouselCta: '',
  quoteText:
    'A maternidade traz uma camada essencial para o exercicio da lideranca, <strong>especialmente na forma como organizamos prioridades e tomamos decisoes.</strong> O tempo passa a ser um recurso ainda mais valioso.',
  quoteSecondText: '',
  articleSecondText: articleAdviceDefaults.text,
  articleSecondKeyword: articleAdviceDefaults.keyword,
  quoteBackgroundImageUrl: '',
  speakerName: 'Cynthia Zanoni',
  speakerRole: 'Senior Developer Advocate na Microsoft',
  speakerTalk: 'Painel: O Futuro das Carreiras Tech',
  speakerImageUrl: '',
  meetupBackgroundImageUrl: '',
  meetupPartnerLogoPrimaryUrl: '',
  meetupPartnerLogoSecondaryUrl: '',
  liveSupportText: 'Frase de apoio para a live',
  liveSupportTextBold: false,
  liveSupportTextCapslock: false,
  liveFooterLeftText: 'ao vivo e gratuito',
  liveFooterRightText: 'com certificado',
  liveSecondSpeakerName: 'Segunda palestrante',
  liveSecondSpeakerRole: 'Cargo da segunda palestrante',
  liveSecondSpeakerImageUrl: '',
  livePartnerLogoUrl1: '',
  livePartnerLogoUrl2: '',
}