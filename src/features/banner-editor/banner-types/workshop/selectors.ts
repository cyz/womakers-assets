import type { CSSProperties } from 'react'

import { workshopPreviewDefaults, type WorkshopAccentColor } from '../../model'

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
  workshopBadge: string
  workshopBulletOne: string
  workshopBulletThree: string
  workshopBulletTwo: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopHighlight: string
  workshopPartnerLogoUrl: string
  workshopSecondSpeakerImageUrl: string
  workshopSecondSpeakerName: string
  workshopSecondSpeakerRole: string
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
  isDualSpeaker: boolean
  speakerCards: WorkshopSpeakerCard[]
  workshopBadge: string
  workshopBullets: string[]
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopHighlight: string
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
}: WorkshopDerivedStateArgs): WorkshopDerivedState => {
  const accent = workshopAccentPalette[workshopAccentColor]
  const primarySpeakerName = speakerName.trim() || workshopPreviewDefaults.speakerName
  const primarySpeakerRole = speakerRole.trim() || workshopPreviewDefaults.speakerRole
  const secondarySpeakerName =
    workshopSecondSpeakerName.trim() || workshopPreviewDefaults.secondSpeakerName
  const secondarySpeakerRole =
    workshopSecondSpeakerRole.trim() || workshopPreviewDefaults.secondSpeakerRole
  const buildInitials = (value: string) =>
    value
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('')

  return {
    previewStyle: {
      '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
      '--workshop-accent': accent.color,
      '--workshop-accent-rgb': accent.rgb,
      background: '#050505',
    } as CSSProperties,
    isDualSpeaker,
    speakerCards: [
      {
        imageUrl: speakerImageUrl,
        initials: buildInitials(primarySpeakerName),
        name: primarySpeakerName,
        role: primarySpeakerRole,
      },
      ...(isDualSpeaker
        ? [
            {
              imageUrl: workshopSecondSpeakerImageUrl,
              initials: buildInitials(secondarySpeakerName),
              name: secondarySpeakerName,
              role: secondarySpeakerRole,
            },
          ]
        : []),
    ],
    workshopBadge: workshopBadge.trim() || workshopPreviewDefaults.badge,
    workshopBullets: isDualSpeaker
      ? [workshopBulletOne, workshopBulletTwo, workshopBulletThree]
          .map((item) => item.trim())
          .filter(Boolean)
      : [workshopBulletOne, workshopBulletTwo, workshopBulletThree].map((item, index) => {
          const fallback = [
            workshopPreviewDefaults.bulletOne,
            workshopPreviewDefaults.bulletTwo,
            workshopPreviewDefaults.bulletThree,
          ][index]

          return item.trim() || fallback
        }),
    workshopDescription: workshopDescription.trim() || workshopPreviewDefaults.description,
    workshopFooterLeftLineOne:
      workshopFooterLeftLineOne.trim() || workshopPreviewDefaults.footerLeftLineOne,
    workshopFooterLeftLineTwo:
      workshopFooterLeftLineTwo.trim() || workshopPreviewDefaults.footerLeftLineTwo,
    workshopFooterTag: workshopFooterTag.trim() || workshopPreviewDefaults.footerTag,
    workshopHighlight: workshopHighlight.trim() || workshopPreviewDefaults.highlight,
    workshopPartnerLogoUrl,
    workshopTitle: workshopTitle.trim() || workshopPreviewDefaults.title,
  }
}