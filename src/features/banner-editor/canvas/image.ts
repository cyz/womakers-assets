// Image cache + loaders for the canvas rendering engine.
// Same-origin theme assets and data URLs never taint the canvas, so exported
// frames can be read back via toDataURL.

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src)
  if (cached) return cached

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })

  imageCache.set(src, promise)
  return promise
}

// Resolves to null instead of throwing, so optional artwork never breaks a draw.
export async function loadImageSafe(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return null
  try {
    return await loadImage(src)
  } catch {
    return null
  }
}

export const themeAssetUrl = (name: string) => `${import.meta.env.BASE_URL}src/assets/themes/${name}`
export const iconAssetUrl = (name: string) => `${import.meta.env.BASE_URL}src/assets/icons/${name}`

// Draws an image cropped to cover a circle centered at (cx, cy) with radius r.
export function drawCircleImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
) {
  const side = Math.min(img.width, img.height)
  const sx = (img.width - side) / 2
  const sy = (img.height - side) / 2

  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(img, sx, sy, side, side, cx - r, cy - r, r * 2, r * 2)
  ctx.restore()
}

// Draws an image cropped to cover a rectangle.
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const targetRatio = width / height
  const imageRatio = img.width / img.height
  let sw = img.width
  let sh = img.height
  let sx = 0
  let sy = 0

  if (imageRatio > targetRatio) {
    sw = img.height * targetRatio
    sx = (img.width - sw) / 2
  } else {
    sh = img.width / targetRatio
    sy = (img.height - sh) / 2
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height)
}

// Draws an image scaled to fit within a box (contain), returns drawn rect.
export function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
) {
  const ratio = img.width / img.height
  let targetW = boxW
  let targetH = targetW / ratio
  if (targetH > boxH) {
    targetH = boxH
    targetW = targetH * ratio
  }
  const x = boxX + (boxW - targetW) / 2
  const y = boxY + (boxH - targetH) / 2
  ctx.drawImage(img, x, y, targetW, targetH)
  return { x, y, width: targetW, height: targetH }
}
