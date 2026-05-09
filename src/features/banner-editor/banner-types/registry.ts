import type { ImageType } from '../model'

import { quoteBannerModule, type QuoteBannerModule } from './quote/module'
import { workshopBannerModule, type WorkshopBannerModule } from './workshop/module'

export type BannerTypeModule = QuoteBannerModule | WorkshopBannerModule

export const getBannerTypeModule = (type: ImageType): BannerTypeModule | null => {
  if (type === quoteBannerModule.type) {
    return quoteBannerModule
  }

  if (type === workshopBannerModule.type) {
    return workshopBannerModule
  }

  return null
}