import { createContext, useContext } from 'react'

import type { EditorState } from './model'
import type { FeedbackKey, FeedbackState } from './hooks/useFeedback'

type EditorStateUpdater = EditorState | ((current: EditorState) => EditorState)

export type EditorContextValue = {
  editorState: EditorState
  commitState: (updater: EditorStateUpdater) => void
  updateField: <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => void
  undo: () => void
  redo: () => void
  resetToInitial: () => void
  canUndo: boolean
  canRedo: boolean
  canReset: boolean
  feedback: FeedbackState
  setFeedback: (key: FeedbackKey, message: string) => void
  clearFeedback: (keys: FeedbackKey[]) => void
}

export const EditorContext = createContext<EditorContextValue | null>(null)

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext)

  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }

  return context
}
