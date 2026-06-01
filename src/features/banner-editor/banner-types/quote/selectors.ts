import type { CSSProperties } from 'react'

type QuoteDerivedStateArgs = {
  initialSpeakerName: string
  isStoriesPlatform: boolean
  preset: {
    width: number
    height: number
  }
  quoteBackgroundImageUrl: string
  quoteSecondText: string
  speakerName: string
  speakerRole: string
}

export type QuoteDerivedState = {
  hasSecondSlide: boolean
  previewStyle: CSSProperties
  quoteDisplayName: string
  quoteDisplayRole: string
  speakerInitials: string
}

export const getQuoteDerivedState = ({
  initialSpeakerName,
  isStoriesPlatform,
  preset,
  quoteBackgroundImageUrl,
  quoteSecondText,
  speakerName,
  speakerRole,
}: QuoteDerivedStateArgs): QuoteDerivedState => ({
  hasSecondSlide: Boolean(quoteSecondText.trim()) && !isStoriesPlatform,
  previewStyle: {
    '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
    backgroundColor: quoteBackgroundImageUrl ? undefined : '#16181b',
    backgroundImage: quoteBackgroundImageUrl ? `url(${quoteBackgroundImageUrl})` : 'none',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  } as CSSProperties,
  quoteDisplayName: speakerName.trim() || initialSpeakerName,
  quoteDisplayRole: speakerRole.trim(),
  speakerInitials: speakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join(''),
})