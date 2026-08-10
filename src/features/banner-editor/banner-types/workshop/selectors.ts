import type { CSSProperties } from 'react'

import {
  workshopPreviewDefaults,
  type WorkshopAccentColor,
  type WorkshopBackgroundComposition,
  type WorkshopFooterIcon,
} from '../../model'

const workshopAccentPalette: Record<WorkshopAccentColor, { color: string; rgb: string }> = {
  Lima: { color: '#e8f300', rgb: '232, 243, 0' },
  Magenta: { color: '#ff4fa3', rgb: '255, 79, 163' },
  Ciano: { color: '#35d7ff', rgb: '53, 215, 255' },
  Laranja: { color: '#ffb347', rgb: '255, 179, 71' },
}

type WorkshopDerivedStateArgs = {
  isDualSpeaker: boolean
  preset: {
    width: number
    height: number
  }
  speakerName: string
  speakerRole: string
  speakerImageUrl: string
  workshopAccentColor: WorkshopAccentColor
  workshopBackgroundImageUrl: WorkshopBackgroundComposition
  workshopBadge: string
  workshopBulletCount: number
  workshopBulletOne: string
  workshopBulletThree: string
  workshopBulletTwo: string
  workshopBulletsIntro: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterIcon: WorkshopFooterIcon
  workshopFooterTag: string
  workshopHighlight: string
  workshopHighlightColored: boolean
  workshopPartnerLogoUrl: string
  workshopSpeakerCount: number
  workshopSecondSpeakerImageUrl: string
  workshopSecondSpeakerName: string
  workshopSecondSpeakerRole: string
  workshopThirdSpeakerImageUrl: string
  workshopThirdSpeakerName: string
  workshopThirdSpeakerRole: string
  workshopFourthSpeakerImageUrl: string
  workshopFourthSpeakerName: string
  workshopFourthSpeakerRole: string
  workshopTitle: string
}

type WorkshopSpeakerCard = {
  imageUrl: string
  initials: string
  name: string
  role: string
}

export type WorkshopDerivedState = {
  previewStyle: CSSProperties
  hasColorfulBackground: boolean
  isDualSpeaker: boolean
  speakerCards: WorkshopSpeakerCard[]
  workshopBadge: string
  workshopBullets: string[]
  workshopBulletsIntro: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterIcon: WorkshopFooterIcon
  workshopFooterTag: string
  workshopHighlight: string
  workshopHighlightColored: boolean
  workshopPartnerLogoUrl: string
  workshopTitle: string
}

export const getWorkshopDerivedState = ({
  isDualSpeaker,
  preset,
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
  workshopFooterIcon,
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
}: WorkshopDerivedStateArgs): WorkshopDerivedState => {
  const accent = workshopAccentPalette[workshopAccentColor]
  const accentForeground = workshopAccentColor === 'Magenta' ? '#ffffff' : '#171717'
  const workshopBackgroundAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/fundo.png`
  const primarySpeakerName = speakerName.trim() || workshopPreviewDefaults.speakerName
  const primarySpeakerRole = speakerRole.trim() || workshopPreviewDefaults.speakerRole
  const secondarySpeakerName =
    workshopSecondSpeakerName.trim() || workshopPreviewDefaults.secondSpeakerName
  const secondarySpeakerRole =
    workshopSecondSpeakerRole.trim() || workshopPreviewDefaults.secondSpeakerRole
  const tertiarySpeakerName =
    workshopThirdSpeakerName.trim() || workshopPreviewDefaults.thirdSpeakerName
  const tertiarySpeakerRole =
    workshopThirdSpeakerRole.trim() || workshopPreviewDefaults.thirdSpeakerRole
  const quaternarySpeakerName =
    workshopFourthSpeakerName.trim() || workshopPreviewDefaults.fourthSpeakerName
  const quaternarySpeakerRole =
    workshopFourthSpeakerRole.trim() || workshopPreviewDefaults.fourthSpeakerRole
  const buildInitials = (value: string) =>
    value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  const clampedSpeakerCount = Math.min(Math.max(workshopSpeakerCount ?? 1, 1), 4)
  const additionalSpeakers = [
    {
      imageUrl: workshopSecondSpeakerImageUrl,
      name: secondarySpeakerName,
      role: secondarySpeakerRole,
    },
    {
      imageUrl: workshopThirdSpeakerImageUrl,
      name: tertiarySpeakerName,
      role: tertiarySpeakerRole,
    },
    {
      imageUrl: workshopFourthSpeakerImageUrl,
      name: quaternarySpeakerName,
      role: quaternarySpeakerRole,
    },
  ].slice(0, clampedSpeakerCount - 1)
  const clampedBulletCount = Math.min(Math.max(workshopBulletCount ?? 0, 0), 3)
  const backgroundImageByComposition: Record<WorkshopBackgroundComposition, string> = {
    Escuro: 'none',
    Código: `url(${workshopBackgroundAssetUrl})`,
    'Foco lateral': `radial-gradient(circle at 88% 28%, rgba(${accent.rgb}, 0.28), transparent 34%), linear-gradient(145deg, #050505 0%, #111111 62%, #050505 100%)`,
    Faixa: `linear-gradient(135deg, transparent 0 54%, rgba(${accent.rgb}, 0.2) 54% 72%, transparent 72%), linear-gradient(160deg, #050505, #121212)`,
  }

  return {
    previewStyle: {
      '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
      '--workshop-accent': accent.color,
      '--workshop-accent-rgb': accent.rgb,
      '--workshop-accent-foreground': accentForeground,
      backgroundColor: '#050505',
      backgroundImage: backgroundImageByComposition[workshopBackgroundImageUrl],
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    } as CSSProperties,
    hasColorfulBackground: workshopBackgroundImageUrl === 'Código',
    isDualSpeaker,
    speakerCards: [
      {
        imageUrl: speakerImageUrl,
        initials: buildInitials(primarySpeakerName),
        name: primarySpeakerName,
        role: primarySpeakerRole,
      },
      ...(isDualSpeaker
        ? additionalSpeakers.map((speaker) => ({
            imageUrl: speaker.imageUrl,
            initials: buildInitials(speaker.name),
            name: speaker.name,
            role: speaker.role,
          }))
        : []),
    ],
    workshopBadge: workshopBadge.trim() || workshopPreviewDefaults.badge,
    workshopBullets: [workshopBulletOne, workshopBulletTwo, workshopBulletThree]
      .slice(0, clampedBulletCount)
      .map((item) => item.trim())
      .filter(Boolean),
    workshopBulletsIntro: workshopBulletsIntro.trim(),
    workshopDescription: workshopDescription.trim() || workshopPreviewDefaults.description,
    workshopFooterLeftLineOne:
      workshopFooterLeftLineOne.trim() || workshopPreviewDefaults.footerLeftLineOne,
    workshopFooterLeftLineTwo:
      workshopFooterLeftLineTwo.trim() || workshopPreviewDefaults.footerLeftLineTwo,
    workshopFooterIcon,
    workshopFooterTag: workshopFooterTag.trim() || workshopPreviewDefaults.footerTag,
    workshopHighlight: workshopHighlight.trim(),
    workshopHighlightColored,
    workshopPartnerLogoUrl,
    workshopTitle: workshopTitle.trim() || workshopPreviewDefaults.title,
  }
}