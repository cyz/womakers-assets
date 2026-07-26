import type { EditorState, Platform } from '../model'

// A single exportable art (one Instagram image). A banner type may produce
// multiple frames (e.g. Quote feed has two slides).
export type BannerFrame = {
  id: string
  label: string
  // Filename suffix used when downloading this frame individually.
  suffix: string
  width: number
  height: number
  draw: (ctx: CanvasRenderingContext2D) => Promise<void> | void
}

export type FrameRenderArgs = {
  state: EditorState
  platform: Platform
  width: number
  height: number
}
