import { useCallback, useMemo, type ReactNode } from 'react'

import { EditorContext, type EditorContextValue } from './EditorContext'
import { useEditorHistory } from './hooks/useEditorHistory'
import { useFeedback } from './hooks/useFeedback'

export function EditorProvider({ children }: { children: ReactNode }) {
  const { feedback, setFeedback, clearFeedback } = useFeedback()
  const handleAfterCommit = useCallback(() => setFeedback('save', ''), [setFeedback])
  const {
    editorState,
    commitState,
    updateField,
    undo,
    redo,
    resetToInitial,
    canUndo,
    canRedo,
    canReset,
  } = useEditorHistory(handleAfterCommit)

  const value = useMemo<EditorContextValue>(
    () => ({
      editorState,
      commitState,
      updateField,
      undo,
      redo,
      resetToInitial,
      canUndo,
      canRedo,
      canReset,
      feedback,
      setFeedback,
      clearFeedback,
    }),
    [
      editorState,
      commitState,
      updateField,
      undo,
      redo,
      resetToInitial,
      canUndo,
      canRedo,
      canReset,
      feedback,
      setFeedback,
      clearFeedback,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

