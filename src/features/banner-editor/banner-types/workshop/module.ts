import { WorkshopContentFields } from './WorkshopContentFields'
import { WorkshopMediaFields } from './WorkshopMediaFields'
import { WorkshopPreview } from './WorkshopPreview'
import { getWorkshopDerivedState } from './selectors'

export const workshopBannerModule = {
  ContentFields: WorkshopContentFields,
  MediaFields: WorkshopMediaFields,
  Preview: WorkshopPreview,
  getDerivedState: getWorkshopDerivedState,
  type: 'Workshop' as const,
}

export type WorkshopBannerModule = typeof workshopBannerModule