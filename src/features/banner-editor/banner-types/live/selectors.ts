import type { CSSProperties } from 'react'

export interface LiveDerivedState {
  previewStyle: CSSProperties
  supportText: string
  secondSpeakerInitials: string
}

export interface GetLiveDerivedStateProps {
  liveSupportText: string
  liveSupportTextBold: boolean
  liveSupportTextCapslock: boolean
  liveSecondSpeakerName: string
  preset: { width: number; height: number }
}

export const getLiveDerivedState = ({
  liveSupportText,
  liveSupportTextBold,
  liveSupportTextCapslock,
  liveSecondSpeakerName,
  preset,
}: GetLiveDerivedStateProps): LiveDerivedState => {
  const supportText = liveSupportText.trim()
  const displayText = liveSupportTextCapslock ? supportText.toUpperCase() : supportText
  const styledText = liveSupportTextBold ? `<strong>${displayText}</strong>` : displayText

  const secondSpeakerInitials = liveSecondSpeakerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const previewStyle: CSSProperties = {
    '--preview-aspect-ratio': `${preset.width} / ${preset.height}`,
    backgroundImage: 'none',
    backgroundColor: '#040404',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
  } as CSSProperties

  return {
    previewStyle,
    supportText: styledText,
    secondSpeakerInitials,
  }
}
