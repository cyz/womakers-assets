import type { EditorState, Platform } from '../../model'
import { initialEditorState, platformPresets } from '../../model'
import { sanitizeQuoteHtml } from '../../utils'
import { CANVAS_FONTS } from '../fonts'
import { drawCircleImageCover, drawImageCover, loadImageSafe, themeAssetUrl } from '../image'
import { drawRichText, measureRichTextLines } from '../richText'
import { roundedRectPath } from '../canvasText'
import type { BannerFrame } from '../types'

const CARD_BG = '#f8f4ef'
const CARD_TEXT = '#23201f'
const ROLE_TEXT = '#6b625c'
const QUOTE_MARK = '#f65282'
const FALLBACK_BG = '#16181b'

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'WM'

type QuoteArtOptions = {
  width: number
  height: number
  html: string
  name: string
  role: string
  avatarUrl: string
  backgroundUrl: string
  showAvatar: boolean
  anchor: 'bottom' | 'top'
}

async function drawQuoteArt(ctx: CanvasRenderingContext2D, options: QuoteArtOptions) {
  const { width, height, html, name, role, avatarUrl, backgroundUrl, showAvatar, anchor } = options

  // Background: user upload (cover) or solid, plus the decorative layer overlay.
  const bgImage = await loadImageSafe(backgroundUrl)
  if (bgImage) {
    drawImageCover(ctx, bgImage, 0, 0, width, height)
  } else {
    ctx.fillStyle = FALLBACK_BG
    ctx.fillRect(0, 0, width, height)
  }

  const layer = await loadImageSafe(themeAssetUrl('layer1x.png'))
  if (layer) {
    ctx.drawImage(layer, 0, 0, width, height)
  }

  const margin = Math.round(width * 0.074)
  const cardX = margin
  const cardW = width - margin * 2
  const padding = Math.round(cardW * 0.083)
  const innerMaxW = cardW - padding * 2

  const bodySize = Math.round(width * 0.0425)
  const bodyLineHeight = Math.round(bodySize * 1.16)
  const bodyStyle = {
    fontSize: bodySize,
    lineHeight: bodyLineHeight,
    family: CANVAS_FONTS.body,
    color: CARD_TEXT,
    regularWeight: 400,
    boldWeight: 700,
    maxLines: 9,
  }

  const safeHtml = sanitizeQuoteHtml(html.trim() || initialEditorState.quoteText)
  const lineCount = Math.max(1, measureRichTextLines(ctx, safeHtml, innerMaxW, bodyStyle))
  const textHeight = lineCount * bodyLineHeight

  const nameSize = Math.round(width * 0.032)
  const roleSize = Math.round(width * 0.024)
  const nameBlockHeight = Math.round(nameSize * 1.2) + (role ? Math.round(roleSize * 1.5) : 0)

  const topInset = showAvatar ? Math.round(width * 0.14) : Math.round(width * 0.1)
  const gapTextToName = Math.round(width * 0.04)
  const bottomPad = Math.round(width * 0.06)
  const cardHeight = topInset + textHeight + gapTextToName + nameBlockHeight + bottomPad

  const brandHeight = Math.round(width * 0.052)
  const brandBottom = height - Math.round(width * 0.06)
  const brandTop = brandBottom - brandHeight

  let cardTop: number
  if (anchor === 'bottom') {
    const cardBottom = brandTop - Math.round(width * 0.036)
    cardTop = Math.max(Math.round(width * 0.16), cardBottom - cardHeight)
  } else {
    cardTop = Math.round(height * 0.4)
  }

  const radius = Math.round(width * 0.06)

  // Card.
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.24)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 28
  roundedRectPath(ctx, cardX, cardTop, cardW, cardHeight, radius)
  ctx.fillStyle = CARD_BG
  ctx.fill()
  ctx.restore()

  // Quote marks.
  ctx.fillStyle = QUOTE_MARK
  ctx.font = `700 ${Math.round(width * 0.15)}px ${CANVAS_FONTS.display}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('\u201C', cardX + Math.round(padding * 0.4), cardTop + Math.round(width * 0.12))
  ctx.fillText('\u201D', cardX + cardW - Math.round(padding * 1.1), cardTop + cardHeight - Math.round(width * 0.02))

  // Body.
  const textTop = cardTop + topInset
  drawRichText(ctx, safeHtml, cardX + padding, textTop, innerMaxW, bodyStyle)

  // Name + role.
  const nameY = textTop + textHeight + gapTextToName
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = CARD_TEXT
  ctx.font = `700 ${nameSize}px ${CANVAS_FONTS.display}`
  ctx.fillText(name, cardX + padding, nameY + nameSize)
  if (role) {
    ctx.fillStyle = ROLE_TEXT
    ctx.font = `400 ${roleSize}px ${CANVAS_FONTS.body}`
    ctx.fillText(role, cardX + padding, nameY + nameSize + Math.round(roleSize * 1.5))
  }

  // Avatar (drawn over the card's top edge).
  if (showAvatar) {
    const avatarR = Math.round(width * 0.105)
    const cx = width / 2
    const cy = cardTop

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, avatarR + Math.round(avatarR * 0.08), 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(248, 244, 239, 0.28)'
    ctx.fill()
    ctx.restore()

    const avatar = await loadImageSafe(avatarUrl)
    if (avatar) {
      drawCircleImageCover(ctx, avatar, cx, cy, avatarR)
    } else {
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, avatarR, 0, Math.PI * 2)
      const gradient = ctx.createLinearGradient(cx - avatarR, cy - avatarR, cx + avatarR, cy + avatarR)
      gradient.addColorStop(0, '#7a27d8')
      gradient.addColorStop(1, '#5e17eb')
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = `700 ${Math.round(avatarR * 0.7)}px ${CANVAS_FONTS.display}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(getInitials(name), cx, cy + avatarR * 0.05)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.restore()
    }
  }

  // Brand footer.
  const brand = await loadImageSafe(themeAssetUrl('brand.png'))
  if (brand) {
    const ratio = brand.width / brand.height
    const targetH = brandHeight
    const targetW = targetH * ratio
    ctx.drawImage(brand, (width - targetW) / 2, brandTop, targetW, targetH)
  }
}

export function getQuoteFrames(state: EditorState, platform: Platform): BannerFrame[] {
  const preset = platformPresets[platform]
  const isStories = platform === 'Instagram Stories (1080x1920)'
  const displayName = state.speakerName.trim() || initialEditorState.speakerName
  const displayRole = state.speakerRole.trim()
  const hasSecond = Boolean(state.quoteSecondText.trim()) && !isStories

  const frames: BannerFrame[] = [
    {
      id: 'quote-primary',
      label: hasSecond ? 'Imagem 1' : 'Citação',
      suffix: hasSecond ? 'imagem-1' : 'quote',
      width: preset.width,
      height: preset.height,
      draw: (ctx) =>
        drawQuoteArt(ctx, {
          width: preset.width,
          height: preset.height,
          html: state.quoteText,
          name: displayName,
          role: displayRole,
          avatarUrl: state.speakerImageUrl,
          backgroundUrl: state.quoteBackgroundImageUrl,
          showAvatar: true,
          anchor: isStories ? 'top' : 'bottom',
        }),
    },
  ]

  if (hasSecond) {
    frames.push({
      id: 'quote-secondary',
      label: 'Imagem 2',
      suffix: 'imagem-2',
      width: preset.width,
      height: preset.height,
      draw: (ctx) =>
        drawQuoteArt(ctx, {
          width: preset.width,
          height: preset.height,
          html: state.quoteSecondText || state.quoteText,
          name: displayName,
          role: displayRole,
          avatarUrl: state.speakerImageUrl,
          backgroundUrl: state.quoteBackgroundImageUrl,
          showAvatar: false,
          anchor: 'bottom',
        }),
    })
  }

  return frames
}
