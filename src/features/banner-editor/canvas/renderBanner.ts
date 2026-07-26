import type { EditorState, ImageType, Platform } from '../model'
import { platformPresets } from '../model'
import { CANVAS_FONTS } from './fonts'
import { getQuoteFrames } from './renderers/quote'
import type { BannerFrame } from './types'

// Banner types already migrated to the canvas engine. Others fall back to a
// placeholder frame until their renderer lands.
export const CANVAS_SUPPORTED_TYPES: ReadonlySet<ImageType> = new Set<ImageType>(['Quote'])

export function isCanvasSupported(type: ImageType): boolean {
  return CANVAS_SUPPORTED_TYPES.has(type)
}

function placeholderFrame(state: EditorState, platform: Platform): BannerFrame {
  const preset = platformPresets[platform]
  return {
    id: 'placeholder',
    label: state.selectedType,
    suffix: state.selectedType.toLowerCase().replace(/\s+/g, '-'),
    width: preset.width,
    height: preset.height,
    draw: (ctx) => {
      ctx.fillStyle = '#0d1117'
      ctx.fillRect(0, 0, preset.width, preset.height)
      ctx.fillStyle = '#8b949e'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.round(preset.width * 0.03)}px ${CANVAS_FONTS.body}`
      ctx.fillText(
        `Prévia em canvas em construção`,
        preset.width / 2,
        preset.height / 2 - preset.width * 0.03,
      )
      ctx.fillStyle = '#e6edf3'
      ctx.font = `700 ${Math.round(preset.width * 0.05)}px ${CANVAS_FONTS.display}`
      ctx.fillText(state.selectedType, preset.width / 2, preset.height / 2 + preset.width * 0.03)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    },
  }
}

export function getBannerFrames(state: EditorState, platform: Platform): BannerFrame[] {
  switch (state.selectedType) {
    case 'Quote':
      return getQuoteFrames(state, platform)
    default:
      return [placeholderFrame(state, platform)]
  }
}

// Renders a frame into a canvas at the given scale (1 = preview, 2 = export).
export async function renderFrameToCanvas(
  canvas: HTMLCanvasElement,
  frame: BannerFrame,
  scale: number,
): Promise<void> {
  canvas.width = Math.round(frame.width * scale)
  canvas.height = Math.round(frame.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, frame.width, frame.height)
  await frame.draw(ctx)
}
