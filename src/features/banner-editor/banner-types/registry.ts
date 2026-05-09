import type { ImageType } from '../model'

import { quoteBannerModule, type QuoteBannerModule } from './quote/module'

export const getBannerTypeModule = (type: ImageType): QuoteBannerModule | null => {
  if (type === quoteBannerModule.type) {
    return quoteBannerModule
  }

  return null
}