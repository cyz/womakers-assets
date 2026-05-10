import type { ImageType } from '../model'

import { liveBannerModule, type LiveBannerModule } from './live/module'
import { quoteBannerModule, type QuoteBannerModule } from './quote/module'
import { workshopBannerModule, type WorkshopBannerModule } from './workshop/module'

export type BannerTypeModule = LiveBannerModule | QuoteBannerModule | WorkshopBannerModule

export const getBannerTypeModule = (type: ImageType): BannerTypeModule | null => {
  if (type === liveBannerModule.type) {
    return liveBannerModule
  }

  if (type === quoteBannerModule.type) {
    return quoteBannerModule
  }

  if (type === workshopBannerModule.type) {
    return workshopBannerModule
  }

  return null
}