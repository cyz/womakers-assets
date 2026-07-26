import { useEffect, useRef, useState } from 'react'

import { AppIcon } from './AppIcon'
import type { EditorState, Platform } from '../model'
import { buildBannerFileName } from '../utils'
import { ensureCanvasFonts } from '../canvas/fonts'
import { getBannerFrames, renderFrameToCanvas } from '../canvas/renderBanner'

const FEED_PLATFORM: Platform = 'Instagram Feed (1080x1350)'
const STORIES_PLATFORM: Platform = 'Instagram Stories (1080x1920)'

type CanvasStageProps = {
  editorState: EditorState
  previewFocus: 'ambos' | 'feed' | 'stories'
  onFeedback?: (message: string) => void
}

const platformMeta: Record<Platform, { kicker: string; title: string; copy: string }> = {
  [FEED_PLATFORM]: {
    kicker: 'Feed',
    title: 'Imagens do feed',
    copy: 'Formato 1080x1350, renderizado em canvas.',
  },
  [STORIES_PLATFORM]: {
    kicker: 'Stories',
    title: 'Ajuste para stories',
    copy: 'Formato 1080x1920, renderizado em canvas.',
  },
}

export function CanvasStage({ editorState, previewFocus, onFeedback }: CanvasStageProps) {
  const canvasRefs = useRef(new Map<string, HTMLCanvasElement>())
  const [fontsReady, setFontsReady] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const platformsToShow: Platform[] =
    previewFocus === 'feed'
      ? [FEED_PLATFORM]
      : previewFocus === 'stories'
        ? [STORIES_PLATFORM]
        : [FEED_PLATFORM, STORIES_PLATFORM]

  useEffect(() => {
    let cancelled = false
    ensureCanvasFonts().then(() => {
      if (!cancelled) setFontsReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const frameId = window.requestAnimationFrame(async () => {
      for (const platform of platformsToShow) {
        const frames = getBannerFrames(editorState, platform)
        for (const frame of frames) {
          if (cancelled) return
          const canvas = canvasRefs.current.get(`${platform}:${frame.id}`)
          if (!canvas) continue
          try {
            await renderFrameToCanvas(canvas, frame, 1)
          } catch {
            // Ignore a single frame failure; keep rendering the rest.
          }
        }
      }
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState, previewFocus, fontsReady])

  const handleDownloadFrame = async (platform: Platform, frameId: string) => {
    const frame = getBannerFrames(editorState, platform).find((item) => item.id === frameId)
    if (!frame) return

    setIsExporting(true)
    try {
      const offscreen = document.createElement('canvas')
      await renderFrameToCanvas(offscreen, frame, 2)
      const dataUrl = offscreen.toDataURL('image/png')
      const fileName = buildBannerFileName(editorState).replace('.png', `-${frame.suffix}.png`)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = fileName
      link.click()
      onFeedback?.('Download iniciado.')
    } catch {
      onFeedback?.('Não foi possível gerar o download da imagem.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="platform-preview-stack">
      {platformsToShow.map((platform) => {
        const meta = platformMeta[platform]
        const frames = getBannerFrames(editorState, platform)

        return (
          <section key={platform} className="platform-preview-section">
            <div className="platform-preview-section-header">
              <div>
                <p className="toolbar-kicker">{meta.kicker}</p>
                <h3>{meta.title}</h3>
                <p className="toolbar-copy">{meta.copy}</p>
              </div>
            </div>

            <div className="canvas-frame-list">
              {frames.map((frame) => (
                <article key={frame.id} className="canvas-frame-panel">
                  <div className="article-preview-panel-toolbar">
                    <div>
                      <p className="toolbar-kicker">{frame.label}</p>
                      <p className="toolbar-copy">Download individual desta arte.</p>
                    </div>
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => handleDownloadFrame(platform, frame.id)}
                      disabled={isExporting}
                    >
                      <AppIcon name="download" className="button-icon" />
                      {isExporting ? 'Gerando...' : 'Baixar PNG'}
                    </button>
                  </div>

                  <div
                    className="canvas-frame-wrap"
                    style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
                  >
                    <canvas
                      aria-label={`${meta.kicker} · ${frame.label}`}
                      ref={(node) => {
                        const key = `${platform}:${frame.id}`
                        if (node) {
                          canvasRefs.current.set(key, node)
                        } else {
                          canvasRefs.current.delete(key)
                        }
                      }}
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
