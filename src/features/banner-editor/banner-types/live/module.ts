import { LiveContentFields } from './LiveContentFields'
import { LiveMediaFields } from './LiveMediaFields'
import { LivePreview } from './LivePreview'
import { getLiveDerivedState } from './selectors'

export const liveBannerModule = {
  ContentFields: LiveContentFields,
  MediaFields: LiveMediaFields,
  Preview: LivePreview,
  getDerivedState: getLiveDerivedState,
  type: 'Live' as const,
}

export type LiveBannerModule = typeof liveBannerModule
