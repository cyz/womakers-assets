import { useLayoutEffect, useRef, type DependencyList } from 'react'

type UseFitTextOptions = {
  /** Maximum number of text lines the content may occupy. */
  maxLines?: number
  /** Smallest fraction of the CSS design size the fitter may shrink to (0-1). */
  minScale?: number
  /** Values that should trigger a re-fit (text, layout, platform, ...). */
  deps: DependencyList
}

/**
 * Shrinks the font size of an element so its full text fits within `maxLines`
 * and does not overflow the element width (i.e. the container lateral padding).
 *
 * The upper bound is the font size defined in CSS for the current layout, so the
 * element keeps its design size for short titles and only scales down when the
 * text would otherwise be clipped.
 */
export function useFitText<T extends HTMLElement>({
  maxLines = 2,
  minScale = 0.45,
  deps,
}: UseFitTextOptions) {
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    let cancelled = false

    const fit = () => {
      if (cancelled || !el) return

      // Measure the current pixel value of one design unit (`--u`), so the final
      // size can be expressed as `calc(var(--u) * n)` and scale with the frame
      // (preview zoom, window resize and full-resolution export all use `--u`).
      el.style.fontSize = 'calc(var(--u) * 1000)'
      const unitPx = parseFloat(getComputedStyle(el).fontSize) / 1000

      // Reset to the CSS-defined size to read the design/max font size.
      el.style.fontSize = ''
      const maxFontSize = parseFloat(getComputedStyle(el).fontSize)
      if (!Number.isFinite(maxFontSize) || maxFontSize <= 0) return

      const lowerBound = maxFontSize * minScale

      const fitsAt = (fontSize: number) => {
        el.style.fontSize = `${fontSize}px`
        const computed = getComputedStyle(el)
        let lineHeight = parseFloat(computed.lineHeight)
        if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
          lineHeight = fontSize * 1.1
        }
        const lines = Math.round(el.scrollHeight / lineHeight)
        const overflowsWidth = el.scrollWidth - el.clientWidth > 1
        return lines <= maxLines && !overflowsWidth
      }

      const applyPx = (fontSize: number) => {
        if (Number.isFinite(unitPx) && unitPx > 0) {
          el.style.fontSize = `calc(var(--u) * ${fontSize / unitPx})`
        } else {
          el.style.fontSize = `${fontSize}px`
        }
      }

      if (fitsAt(maxFontSize)) {
        applyPx(maxFontSize)
        return
      }

      let low = lowerBound
      let high = maxFontSize
      let best = lowerBound
      for (let i = 0; i < 12; i += 1) {
        const mid = (low + high) / 2
        if (fitsAt(mid)) {
          best = mid
          low = mid
        } else {
          high = mid
        }
      }
      applyPx(best)
    }

    fit()

    // Web fonts can change text metrics after they finish loading; re-fit then.
    const fontSet = (document as Document & { fonts?: FontFaceSet }).fonts
    if (fontSet?.ready) {
      fontSet.ready
        .then(() => {
          if (!cancelled) fit()
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}
