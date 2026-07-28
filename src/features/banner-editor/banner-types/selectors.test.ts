import { describe, expect, it } from 'vitest'

import { getLiveDerivedState } from './live/selectors'
import { getQuoteDerivedState } from './quote/selectors'
import { getWorkshopDerivedState } from './workshop/selectors'
import { workshopPreviewDefaults } from '../model'

const preset = { width: 1080, height: 1350 }

describe('getLiveDerivedState', () => {
  it('trims support text and applies caps + bold wrapping', () => {
    const state = getLiveDerivedState({
      liveSupportText: '  vem com a gente  ',
      liveSupportTextBold: true,
      liveSupportTextCapslock: true,
      liveSecondSpeakerName: 'Ana Paula',
      preset,
    })
    expect(state.supportText).toBe('<strong>VEM COM A GENTE</strong>')
    expect(state.secondSpeakerInitials).toBe('AP')
  })

  it('leaves plain text untouched when toggles are off', () => {
    const state = getLiveDerivedState({
      liveSupportText: 'texto',
      liveSupportTextBold: false,
      liveSupportTextCapslock: false,
      liveSecondSpeakerName: '',
      preset,
    })
    expect(state.supportText).toBe('texto')
    expect(state.secondSpeakerInitials).toBe('')
  })
})

describe('getQuoteDerivedState', () => {
  const baseArgs = {
    initialSpeakerName: 'Fulana',
    isStoriesPlatform: false,
    preset,
    quoteBackgroundImageUrl: '',
    quoteSecondText: '',
    speakerName: '',
    speakerRole: '',
  }

  it('falls back to the initial speaker name when empty', () => {
    const state = getQuoteDerivedState(baseArgs)
    expect(state.quoteDisplayName).toBe('Fulana')
    expect(state.hasSecondSlide).toBe(false)
  })

  it('uses provided speaker and computes initials', () => {
    const state = getQuoteDerivedState({
      ...baseArgs,
      speakerName: 'Maria Silva',
      speakerRole: '  CTO  ',
    })
    expect(state.quoteDisplayName).toBe('Maria Silva')
    expect(state.quoteDisplayRole).toBe('CTO')
    expect(state.speakerInitials).toBe('MS')
  })

  it('enables a second slide only on feed platform with second text', () => {
    expect(getQuoteDerivedState({ ...baseArgs, quoteSecondText: 'outra frase' }).hasSecondSlide).toBe(
      true,
    )
    expect(
      getQuoteDerivedState({ ...baseArgs, quoteSecondText: 'outra frase', isStoriesPlatform: true })
        .hasSecondSlide,
    ).toBe(false)
  })
})

describe('getWorkshopDerivedState', () => {
  const baseArgs = {
    isDualSpeaker: false,
    preset,
    speakerName: '',
    speakerRole: '',
    speakerImageUrl: '',
    workshopAccentColor: 'Lima' as const,
    workshopBackgroundImageUrl: '',
    workshopBadge: '',
    workshopBulletCount: 3,
    workshopBulletOne: 'um',
    workshopBulletThree: 'tres',
    workshopBulletTwo: 'dois',
    workshopBulletsIntro: '',
    workshopDescription: '',
    workshopFooterLeftLineOne: '',
    workshopFooterLeftLineTwo: '',
    workshopFooterTag: '',
    workshopHighlight: '',
    workshopHighlightColored: true,
    workshopPartnerLogoUrl: '',
    workshopSpeakerCount: 2,
    workshopSecondSpeakerImageUrl: '',
    workshopSecondSpeakerName: '',
    workshopSecondSpeakerRole: '',
    workshopThirdSpeakerImageUrl: '',
    workshopThirdSpeakerName: '',
    workshopThirdSpeakerRole: '',
    workshopFourthSpeakerImageUrl: '',
    workshopFourthSpeakerName: '',
    workshopFourthSpeakerRole: '',
    workshopTitle: '',
  }

  it('produces a single speaker card by default and falls back to defaults', () => {
    const state = getWorkshopDerivedState(baseArgs)
    expect(state.speakerCards).toHaveLength(1)
    expect(state.speakerCards[0].name).toBe(workshopPreviewDefaults.speakerName)
    expect(state.workshopBadge).toBe(workshopPreviewDefaults.badge)
  })

  it('slices bullets to the bullet count and drops blanks', () => {
    expect(getWorkshopDerivedState({ ...baseArgs, workshopBulletCount: 2 }).workshopBullets).toEqual([
      'um',
      'dois',
    ])
    expect(
      getWorkshopDerivedState({ ...baseArgs, workshopBulletTwo: '   ', workshopBulletCount: 3 })
        .workshopBullets,
    ).toEqual(['um', 'tres'])
  })

  it('adds additional speaker cards up to the speaker count when dual', () => {
    const state = getWorkshopDerivedState({
      ...baseArgs,
      isDualSpeaker: true,
      workshopSpeakerCount: 3,
      workshopSecondSpeakerName: 'Bruna Costa',
      workshopThirdSpeakerName: 'Carla Dias',
    })
    expect(state.speakerCards).toHaveLength(3)
    expect(state.speakerCards[1].name).toBe('Bruna Costa')
    expect(state.speakerCards[1].initials).toBe('BC')
    expect(state.speakerCards[2].name).toBe('Carla Dias')
  })

  it('clamps the speaker count to the 1-4 range', () => {
    const state = getWorkshopDerivedState({
      ...baseArgs,
      isDualSpeaker: true,
      workshopSpeakerCount: 9,
    })
    expect(state.speakerCards).toHaveLength(4)
  })

  it('keeps a single speaker when dual layout is enabled but count is below minimum', () => {
    const state = getWorkshopDerivedState({
      ...baseArgs,
      isDualSpeaker: true,
      workshopSpeakerCount: 0,
    })
    expect(state.speakerCards).toHaveLength(1)
  })
})
