import { describe, expect, it } from 'vitest'

import { initialEditorState, platformPresets, type EditorState } from './model'
import {
  bannerOptions,
  getBannerOptionLabel,
  getPlatformDimensions,
  getPlatformLabel,
  groupedBannerOptions,
  isAssetVariation,
  isEditorStateEqual,
  isImageType,
  isPlatform,
  isSponsorVariation,
  isWorkshopAccentColor,
  normalizeEditorState,
  parseEditorStateCandidate,
  sanitizeQuoteHtml,
  shouldIntegrateFeedAndStories,
} from './utils'

describe('platform helpers', () => {
  it('strips the dimensions suffix from the platform label', () => {
    expect(getPlatformLabel('Instagram (1080x1350)')).toBe('Instagram')
  })

  it('formats platform dimensions from the presets', () => {
    expect(getPlatformDimensions('Instagram (1080x1350)')).toBe('1080x1350')
    expect(platformPresets['Instagram (1080x1350)']).toEqual({ width: 1080, height: 1350 })
  })

  it('exports Quote in feed and Stories formats', () => {
    expect(shouldIntegrateFeedAndStories('Quote', 'Palestrante')).toBe(true)
  })
})

describe('banner option catalog', () => {
  it('generates a unique id per type/variation/platform combination', () => {
    const ids = bannerOptions.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('groups options and excludes the coming-soon types (Live, Imersão)', () => {
    const groupedCount = groupedBannerOptions.reduce((total, group) => total + group.options.length, 0)
    const groupableCount = bannerOptions.filter(
      (option) => option.type !== 'Live' && option.type !== 'Imersão',
    ).length
    expect(groupedCount).toBe(groupableCount)
    expect(groupedBannerOptions.map((group) => group.label)).toEqual([
      'Encontro Pocket',
      'Encontro Anual',
      'Outros eventos',
      'Citação',
    ])
  })

  it('omits the variation label when a type has a single variation', () => {
    expect(getBannerOptionLabel('Meetup Presencial', 'Palestrante', 'Instagram (1080x1350)')).toBe(
      'Instagram',
    )
  })

  it('includes the variation label when a type has multiple variations', () => {
    expect(getBannerOptionLabel('Encontro Pocket', 'Palestrante', 'Instagram (1080x1350)')).toBe(
      'Palestrante · Instagram',
    )
  })
})

describe('type guards', () => {
  it('validates image types', () => {
    expect(isImageType('Workshop')).toBe(true)
    expect(isImageType('Inexistente')).toBe(false)
  })

  it('validates platforms', () => {
    expect(isPlatform('Instagram (1080x1350)')).toBe(true)
    expect(isPlatform('Twitter')).toBe(false)
  })

  it('validates asset variations', () => {
    expect(isAssetVariation('Palestrante')).toBe(true)
    expect(isAssetVariation('Nope')).toBe(false)
  })

  it('validates workshop accent colors', () => {
    expect(isWorkshopAccentColor('Lima')).toBe(true)
    expect(isWorkshopAccentColor('Roxo')).toBe(false)
  })

  it('detects sponsor variations', () => {
    expect(isSponsorVariation('Patrocinador Carousel')).toBe(true)
    expect(isSponsorVariation('Palestrante')).toBe(false)
  })
})

describe('normalizeEditorState', () => {
  it('keeps a valid state untouched in its compared fields', () => {
    const normalized = normalizeEditorState(initialEditorState)
    expect(isEditorStateEqual(normalized, initialEditorState)).toBe(true)
  })

  it('falls back to the first supported variation when the current one is unsupported', () => {
    const state: EditorState = {
      ...initialEditorState,
      selectedType: 'Meetup Presencial',
      selectedVariation: 'Palestrantes',
    }
    const normalized = normalizeEditorState(state)
    expect(normalized.selectedVariation).toBe('Palestrante')
  })

  it('migrates the legacy sponsor single-image variation to carousel', () => {
    const state = {
      ...initialEditorState,
      selectedType: 'Encontro Pocket',
      selectedVariation: 'Patrocinador Single Image',
    } as unknown as EditorState
    const normalized = normalizeEditorState(state)
    expect(normalized.selectedVariation).toBe('Patrocinador Carousel')
  })

  it('backfills numeric workshop defaults when missing', () => {
    const state = {
      ...initialEditorState,
      workshopBulletCount: undefined,
      workshopSpeakerCount: undefined,
    } as unknown as EditorState
    const normalized = normalizeEditorState(state)
    expect(normalized.workshopBulletCount).toBe(initialEditorState.workshopBulletCount)
    expect(normalized.workshopSpeakerCount).toBe(initialEditorState.workshopSpeakerCount)
  })
})

describe('isEditorStateEqual', () => {
  it('returns true for structurally identical states', () => {
    expect(isEditorStateEqual(initialEditorState, { ...initialEditorState })).toBe(true)
  })

  it('returns false when a compared field differs', () => {
    expect(
      isEditorStateEqual(initialEditorState, { ...initialEditorState, eventTitle: 'Outro' }),
    ).toBe(false)
    expect(
      isEditorStateEqual(initialEditorState, { ...initialEditorState, workshopBulletCount: 1 }),
    ).toBe(false)
  })
})

describe('parseEditorStateCandidate', () => {
  it('returns null for missing or malformed candidates', () => {
    expect(parseEditorStateCandidate(null)).toBeNull()
    expect(parseEditorStateCandidate({})).toBeNull()
  })

  it('round-trips a serialized valid state', () => {
    const parsed = parseEditorStateCandidate(
      JSON.parse(JSON.stringify(initialEditorState)) as EditorState,
    )
    expect(parsed).not.toBeNull()
    expect(isEditorStateEqual(parsed as EditorState, initialEditorState)).toBe(true)
  })
})

describe('sanitizeQuoteHtml', () => {
  it('keeps allowed formatting tags', () => {
    expect(sanitizeQuoteHtml('Texto <strong>forte</strong> e <em>ênfase</em>')).toBe(
      'Texto <strong>forte</strong> e <em>ênfase</em>',
    )
  })

  it('normalizes <b>/<i> into <strong>/<em>', () => {
    expect(sanitizeQuoteHtml('<b>bold</b> <i>italic</i>')).toBe(
      '<strong>bold</strong> <em>italic</em>',
    )
  })

  it('strips disallowed tags but keeps their text', () => {
    expect(sanitizeQuoteHtml('<span class="x">oi</span><script>alert(1)</script>')).toBe('oialert(1)')
  })

  it('converts block elements into line breaks', () => {
    expect(sanitizeQuoteHtml('<div>uma</div><div>duas</div>')).toBe('uma<br>duas')
  })
})
