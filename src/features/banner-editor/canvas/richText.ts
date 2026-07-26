// Minimal rich-text layout for canvas. Parses the sanitized quote HTML
// (text nodes, <strong>/<b>, <em>/<i>, <br>) into styled word tokens, then
// wraps and draws them, switching font weight/style per run.

type Token =
  | { type: 'word'; text: string; bold: boolean; italic: boolean }
  | { type: 'break' }

export type RichTextStyle = {
  fontSize: number
  lineHeight: number
  family: string
  color: string
  // Optional weight for non-bold runs (defaults to 400).
  regularWeight?: number
  boldWeight?: number
  align?: 'left' | 'center'
  maxLines?: number
}

function fontFor(style: RichTextStyle, bold: boolean, italic: boolean) {
  const weight = bold ? style.boldWeight ?? 700 : style.regularWeight ?? 400
  const italicPart = italic ? 'italic ' : ''
  return `${italicPart}${weight} ${style.fontSize}px ${style.family}`
}

function parseTokens(html: string): Token[] {
  const tokens: Token[] = []

  if (typeof document === 'undefined') {
    // Fallback: strip tags.
    html
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .forEach((text) => tokens.push({ type: 'word', text, bold: false, italic: false }))
    return tokens
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild ?? doc.body

  const walk = (node: Node, bold: boolean, italic: boolean) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const raw = child.textContent ?? ''
        const parts = raw.split(/(\s+)/)
        parts.forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) return
          tokens.push({ type: 'word', text: part, bold, italic })
        })
        return
      }

      if (child.nodeType !== Node.ELEMENT_NODE) return
      const el = child as Element
      const tag = el.tagName.toLowerCase()

      if (tag === 'br') {
        tokens.push({ type: 'break' })
        return
      }

      const nextBold = bold || tag === 'strong' || tag === 'b'
      const nextItalic = italic || tag === 'em' || tag === 'i'
      walk(el, nextBold, nextItalic)

      if (tag === 'p' || tag === 'div') {
        tokens.push({ type: 'break' })
      }
    })
  }

  walk(root, false, false)
  return tokens
}

type Line = { words: Array<{ text: string; bold: boolean; italic: boolean }> }

function layoutLines(
  ctx: CanvasRenderingContext2D,
  tokens: Token[],
  style: RichTextStyle,
  maxWidth: number,
): Line[] {
  const lines: Line[] = [{ words: [] }]
  let currentWidth = 0

  const spaceWidth = () => {
    ctx.font = fontFor(style, false, false)
    return ctx.measureText(' ').width
  }
  const sw = spaceWidth()

  for (const token of tokens) {
    if (token.type === 'break') {
      lines.push({ words: [] })
      currentWidth = 0
      continue
    }

    ctx.font = fontFor(style, token.bold, token.italic)
    const wordWidth = ctx.measureText(token.text).width
    const line = lines[lines.length - 1]
    const addWidth = line.words.length === 0 ? wordWidth : sw + wordWidth

    if (line.words.length > 0 && currentWidth + addWidth > maxWidth) {
      lines.push({ words: [{ text: token.text, bold: token.bold, italic: token.italic }] })
      currentWidth = wordWidth
    } else {
      line.words.push({ text: token.text, bold: token.bold, italic: token.italic })
      currentWidth += addWidth
    }
  }

  return lines.filter((line, index) => line.words.length > 0 || index < lines.length)
}

// Draws the rich text starting at (x, topY). Returns the bottom Y coordinate.
export function drawRichText(
  ctx: CanvasRenderingContext2D,
  html: string,
  x: number,
  topY: number,
  maxWidth: number,
  style: RichTextStyle,
): number {
  const tokens = parseTokens(html)
  let lines = layoutLines(ctx, tokens, style, maxWidth)

  if (style.maxLines && lines.length > style.maxLines) {
    lines = lines.slice(0, style.maxLines)
  }

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = style.color
  const spaceW = (() => {
    ctx.font = fontFor(style, false, false)
    return ctx.measureText(' ').width
  })()

  let y = topY + style.fontSize
  for (const line of lines) {
    if (line.words.length === 0) {
      y += style.lineHeight
      continue
    }

    let lineWidth = 0
    line.words.forEach((word, index) => {
      ctx.font = fontFor(style, word.bold, word.italic)
      lineWidth += ctx.measureText(word.text).width
      if (index > 0) lineWidth += spaceW
    })

    let cursorX = style.align === 'center' ? x + (maxWidth - lineWidth) / 2 : x
    line.words.forEach((word, index) => {
      ctx.font = fontFor(style, word.bold, word.italic)
      if (index > 0) cursorX += spaceW
      ctx.fillText(word.text, cursorX, y)
      cursorX += ctx.measureText(word.text).width
    })

    y += style.lineHeight
  }

  return y - style.lineHeight + style.fontSize * 0.25
}

// Measures the number of laid-out lines without drawing.
export function measureRichTextLines(
  ctx: CanvasRenderingContext2D,
  html: string,
  maxWidth: number,
  style: RichTextStyle,
): number {
  const tokens = parseTokens(html)
  const lines = layoutLines(ctx, tokens, style, maxWidth)
  return style.maxLines ? Math.min(lines.length, style.maxLines) : lines.length
}
