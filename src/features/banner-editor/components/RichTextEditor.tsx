import type { ClipboardEvent, RefObject } from 'react'

type RichTextEditorProps = {
  editorClassName?: string
  editorRef: RefObject<HTMLDivElement | null>
  id: string
  onBold: () => void
  onInput: () => void
  onPaste: (event: ClipboardEvent<HTMLDivElement>) => void
  placeholder: string
  toolbarLabel: string
}

export function RichTextEditor({
  editorClassName,
  editorRef,
  id,
  onBold,
  onInput,
  onPaste,
  placeholder,
  toolbarLabel,
}: RichTextEditorProps) {
  return (
    <div className="wysiwyg-editor-shell">
      <div className="wysiwyg-editor-toolbar">
        <div className="quote-format-toolbar" role="toolbar" aria-label={toolbarLabel}>
          <button
            type="button"
            className="quote-format-button quote-format-button-icon"
            aria-label="Aplicar negrito"
            title="Negrito"
            onClick={onBold}
          >
            <strong>B</strong>
          </button>
        </div>
        <span className="wysiwyg-editor-label">Editor WYSIWYG</span>
      </div>
      <div
        id={id}
        ref={editorRef}
        className={`quote-editor ${editorClassName ?? ''}`.trim()}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={onInput}
        onPaste={onPaste}
      />
    </div>
  )
}