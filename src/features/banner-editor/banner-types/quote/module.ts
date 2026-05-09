import { QuoteContentFields } from './QuoteContentFields'
import { QuoteMediaFields } from './QuoteMediaFields'
import { QuotePreview } from './QuotePreview'
import { getQuoteDerivedState } from './selectors'

export const quoteBannerModule = {
  ContentFields: QuoteContentFields,
  MediaFields: QuoteMediaFields,
  Preview: QuotePreview,
  getDerivedState: getQuoteDerivedState,
  type: 'Quote' as const,
}

export type QuoteBannerModule = typeof quoteBannerModule