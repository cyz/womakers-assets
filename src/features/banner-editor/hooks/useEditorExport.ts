import type { RefObject } from 'react'
import { toPng } from 'html-to-image'
import {
  MAX_SAVED_EXPORTED_IMAGES,
  platformPresets,
  SAVED_EDITOR_STATE_KEY,
  SAVED_EXPORTED_IMAGES_KEY,
  type EditorState,
  type SavedBannerAsset,
} from '../model'
import {
  downloadImage,
  isStorageQuotaExceeded,
  optimizeSavedPreviewDataUrl,
} from '../imageProcessing'
import { buildBannerFileName, createSavedBannerId } from '../utils'
import type { FeedbackKey } from './useFeedback'

type UseEditorExportOptions = {
  editorState: EditorState
  savedBannerAssets: SavedBannerAsset[]
  setSavedBannerAssets: (assets: SavedBannerAsset[]) => void
  setIsExporting: (value: boolean) => void
  setFeedback: (key: FeedbackKey, message: string) => void
  primaryPreviewFrameRef: RefObject<HTMLDivElement | null>
  storiesPreviewFrameRef: RefObject<HTMLDivElement | null>
}

export function useEditorExport({
  editorState,
  savedBannerAssets,
  setSavedBannerAssets,
  setIsExporting,
  setFeedback,
  primaryPreviewFrameRef,
  storiesPreviewFrameRef,
}: UseEditorExportOptions) {
  const preset = platformPresets[editorState.selectedPlatform]

  const exportFrameImage = async (frameElement: HTMLDivElement | null) => {
    if (!frameElement) {
      throw new Error('Não foi possível localizar a preview para exportação.')
    }

    const pixelRatio = Math.min(
      3,
      Math.max(1, preset.width / Math.max(frameElement.clientWidth, 1)),
    )

    return toPng(frameElement, {
      cacheBust: true,
      pixelRatio,
    })
  }

  const exportCurrentBannerImage = async () => {
    const isStories = editorState.selectedPlatform === 'Instagram Stories (1080x1920)'
    return exportFrameImage(
      isStories ? storiesPreviewFrameRef.current : primaryPreviewFrameRef.current,
    )
  }

  const handleDownloadFocusedBanner = async () => {
    setIsExporting(true)
    try {
      const isStories = editorState.selectedPlatform === 'Instagram Stories (1080x1920)'
      const dataUrl = await exportCurrentBannerImage()
      const fileName = buildBannerFileName(editorState).replace(
        '.png',
        isStories ? '-stories.png' : '-feed.png',
      )
      downloadImage(dataUrl, fileName)
      setFeedback('save', 'Download iniciado.')
    } catch (error) {
      setFeedback(
        'save',
        error instanceof Error ? error.message : 'Não foi possível gerar o download da imagem.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const createSavedBannerAsset = async (): Promise<SavedBannerAsset> => {
    const previewImageDataUrl = await optimizeSavedPreviewDataUrl(await exportCurrentBannerImage())

    return {
      id: createSavedBannerId(),
      fileName: buildBannerFileName(editorState),
      imageDataUrl: previewImageDataUrl,
      savedAt: new Date().toISOString(),
      editorState,
    }
  }

  const persistSavedBannerAssets = (nextAssets: SavedBannerAsset[]) => {
    let assetsToPersist = [...nextAssets]

    while (assetsToPersist.length > 0) {
      try {
        window.localStorage.setItem(SAVED_EXPORTED_IMAGES_KEY, JSON.stringify(assetsToPersist))
        return assetsToPersist
      } catch (error) {
        if (!isStorageQuotaExceeded(error)) {
          throw error
        }

        assetsToPersist = assetsToPersist.slice(0, -1)
      }
    }

    throw new Error('Não foi possível salvar a imagem no navegador porque o armazenamento local está cheio.')
  }

  const handleSaveVersion = async () => {
    setIsExporting(true)

    try {
      const nextAsset = await createSavedBannerAsset()
      const nextAssets = [nextAsset, ...savedBannerAssets].slice(0, MAX_SAVED_EXPORTED_IMAGES)
      const persistedAssets = persistSavedBannerAssets(nextAssets)

      window.localStorage.setItem(SAVED_EDITOR_STATE_KEY, JSON.stringify(editorState))
      setSavedBannerAssets(persistedAssets)
      setFeedback(
        'save',
        persistedAssets.length < nextAssets.length
          ? 'Imagem salva no navegador. Algumas versões antigas foram removidas para liberar espaço.'
          : 'Imagem e versão salvas no navegador.',
      )
    } catch (error) {
      setFeedback(
        'save',
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a imagem. Tente novamente.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadQuoteFrame = async (
    frameElement: HTMLDivElement | null,
    fileNameSuffix: string,
  ) => {
    setIsExporting(true)

    try {
      const fileName = buildBannerFileName(editorState).replace('.png', `-${fileNameSuffix}.png`)
      const imageDataUrl = await exportFrameImage(frameElement)
      downloadImage(imageDataUrl, fileName)
      setFeedback('save', 'Download iniciado.')
    } catch (error) {
      setFeedback(
        'save',
        error instanceof Error
          ? error.message
          : 'Não foi possível gerar o download da imagem.',
      )
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportFrameImage,
    handleDownloadFocusedBanner,
    handleSaveVersion,
    handleDownloadQuoteFrame,
  }
}
