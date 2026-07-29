import { useEffect } from 'react'
import type { ClipboardEvent, RefObject } from 'react'
import { initialEditorState, type EditorState } from '../model'
import { sanitizeQuoteHtml } from '../utils'

type RichTextField =
  | 'quoteText'
  | 'quoteSecondText'
  | 'articleSecondText'
  | 'sponsorCarouselLeadText'
  | 'sponsorCarouselBodyText'
  | 'workshopBulletsIntro'

type UpdateField = <Key extends keyof EditorState>(key: Key, value: EditorState[Key]) => void

/**
 * Keeps a contentEditable element's innerHTML in sync with the sanitized
 * editor state value, without clobbering the caret when nothing changed.
 */
export function useSyncContentEditable(ref: RefObject<HTMLDivElement | null>, value: string) {
  useEffect(() => {
    const editor = ref.current

    if (!editor) {
      return
    }

    const normalized = sanitizeQuoteHtml(value)

    if (sanitizeQuoteHtml(editor.innerHTML) !== normalized) {
      editor.innerHTML = normalized
    }
  }, [ref, value])
}

export function useRichTextEditors(updateField: UpdateField) {
  const syncRichEditorState = (field: RichTextField, editor: HTMLDivElement | null) => {
    if (!editor) {
      return
    }

    const nextValue = sanitizeQuoteHtml(editor.innerHTML)
    updateField(field, nextValue)
  }

  const applyRichTextFormatting = (
    field: RichTextField,
    editor: HTMLDivElement | null,
    command: 'bold',
  ) => {
    if (!editor) {
      return
    }

    editor.focus()
    document.execCommand(command)
    syncRichEditorState(field, editor)
  }

  const renderRichText = (value: string, fallback = initialEditorState.quoteText) => ({
    __html: sanitizeQuoteHtml(value.trim() || fallback),
  })

  const handleRichEditorPaste = (
    event: ClipboardEvent<HTMLDivElement>,
    field: RichTextField,
    editor: HTMLDivElement | null,
  ) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    syncRichEditorState(field, editor)
  }

  return {
    syncRichEditorState,
    applyRichTextFormatting,
    renderRichText,
    handleRichEditorPaste,
  }
}
