// Font families used by the canvas renderers. Mirrors the CSS variables in
// index.css so canvas text matches the DOM previews.
export const CANVAS_FONTS = {
  body: "'IBM Plex Sans', 'Segoe UI', sans-serif",
  heading: "'Space Grotesk', 'IBM Plex Sans', sans-serif",
  display: "'NextNew', 'Space Grotesk', sans-serif",
  mono: "'JetBrains Mono', 'SFMono-Regular', monospace",
} as const

// Preload the fonts before the first canvas draw so text metrics are correct.
// document.fonts.load is a no-op cost after the first resolution.
let fontsPromise: Promise<void> | null = null

export function ensureCanvasFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) {
    return Promise.resolve()
  }

  if (fontsPromise) return fontsPromise

  const specs = [
    "400 48px 'IBM Plex Sans'",
    "500 48px 'IBM Plex Sans'",
    "600 48px 'IBM Plex Sans'",
    "700 48px 'IBM Plex Sans'",
    "400 48px 'NextNew'",
    "600 48px 'NextNew'",
    "700 48px 'NextNew'",
    "800 48px 'NextNew'",
    "500 48px 'Space Grotesk'",
    "700 48px 'Space Grotesk'",
    "400 48px 'Barlow'",
    "600 48px 'Barlow'",
    "700 48px 'Barlow'",
    "400 48px 'JetBrains Mono'",
  ]

  fontsPromise = Promise.all(specs.map((spec) => document.fonts.load(spec)))
    .then(() => document.fonts.ready.then(() => undefined))
    .catch(() => undefined)

  return fontsPromise
}
