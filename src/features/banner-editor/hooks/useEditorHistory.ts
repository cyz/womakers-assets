import { useCallback, useEffect, useReducer, useRef } from 'react'
import { initialEditorState, type EditorState } from '../model'
import { isEditorStateEqual, loadSavedEditorState } from '../utils'

type EditorStateUpdater = EditorState | ((current: EditorState) => EditorState)

type HistoryState = {
  editorState: EditorState
  undoStack: EditorState[]
  redoStack: EditorState[]
  lastHistoryCapture: number
  commitCount: number
}

type HistoryAction =
  | { type: 'commit'; updater: EditorStateUpdater; now: number }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }

function createInitialHistoryState(): HistoryState {
  return {
    editorState: loadSavedEditorState(),
    undoStack: [],
    redoStack: [],
    lastHistoryCapture: 0,
    commitCount: 0,
  }
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'commit': {
      const { editorState, undoStack, lastHistoryCapture } = state
      const next =
        typeof action.updater === 'function' ? action.updater(editorState) : action.updater

      if (isEditorStateEqual(editorState, next)) {
        return state
      }

      // Coalesce rapid edits (e.g. typing) into a single undo entry so the
      // history stays word-level instead of per-keystroke.
      let nextUndoStack = undoStack
      let nextCapture = lastHistoryCapture
      if (action.now - lastHistoryCapture > 500) {
        nextCapture = action.now
        nextUndoStack = [...undoStack, editorState]
      }

      return {
        editorState: next,
        undoStack: nextUndoStack,
        redoStack: [],
        lastHistoryCapture: nextCapture,
        commitCount: state.commitCount + 1,
      }
    }
    case 'undo': {
      const previousState = state.undoStack[state.undoStack.length - 1]

      if (!previousState) {
        return state
      }

      return {
        ...state,
        editorState: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [state.editorState, ...state.redoStack],
      }
    }
    case 'redo': {
      const [nextState, ...remainingStates] = state.redoStack

      if (!nextState) {
        return state
      }

      return {
        ...state,
        editorState: nextState,
        undoStack: [...state.undoStack, state.editorState],
        redoStack: remainingStates,
      }
    }
    case 'reset': {
      return {
        ...state,
        editorState: initialEditorState,
        undoStack: [...state.undoStack, state.editorState],
        redoStack: [],
      }
    }
    default:
      return state
  }
}

export function useEditorHistory(onCommit: () => void) {
  const [state, dispatch] = useReducer(historyReducer, undefined, createInitialHistoryState)
  const { editorState, undoStack, redoStack, commitCount } = state

  // Fire onCommit only when a real commit changed the state (never on
  // undo/redo/reset), matching the original inline behavior.
  const lastCommitCountRef = useRef(commitCount)
  useEffect(() => {
    if (commitCount !== lastCommitCountRef.current) {
      lastCommitCountRef.current = commitCount
      onCommit()
    }
  }, [commitCount, onCommit])

  const commitState = useCallback((updater: EditorStateUpdater) => {
    dispatch({ type: 'commit', updater, now: Date.now() })
  }, [])

  const updateField = useCallback(
    <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => {
      commitState((current) => {
        if (current[key] === value) {
          return current
        }

        return {
          ...current,
          [key]: value,
        }
      })
    },
    [commitState],
  )

  const undo = useCallback(() => {
    dispatch({ type: 'undo' })
  }, [])

  const redo = useCallback(() => {
    dispatch({ type: 'redo' })
  }, [])

  const resetToInitial = useCallback(() => {
    dispatch({ type: 'reset' })
  }, [])

  const canUndo = undoStack.length > 0
  const canRedo = redoStack.length > 0
  const canReset = !isEditorStateEqual(editorState, initialEditorState)

  return {
    editorState,
    commitState,
    updateField,
    undo,
    redo,
    resetToInitial,
    canUndo,
    canRedo,
    canReset,
  }
}
