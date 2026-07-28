import type { ClipboardEvent, RefObject } from 'react'

import { RichTextEditor } from '../../components/RichTextEditor'

type QuoteContentFieldsProps = {
  onQuoteBold: () => void
  onQuoteInput: () => void
  onQuotePaste: (event: ClipboardEvent<HTMLDivElement>) => void
  quoteEditorRef: RefObject<HTMLDivElement | null>
}

export function QuoteContentFields({
  onQuoteBold,
  onQuoteInput,
  onQuotePaste,
  quoteEditorRef,
}: QuoteContentFieldsProps) {
  return (
    <>
      <label className="field-label" htmlFor="quote-text">
        Texto da citação
      </label>
      <RichTextEditor
        editorRef={quoteEditorRef}
        id="quote-text"
        onBold={onQuoteBold}
        onInput={onQuoteInput}
        onPaste={onQuotePaste}
        placeholder="Digite a citação aqui"
        toolbarLabel="Formatação da citação"
      />
      <p className="field-hint">
        Use uma frase curta: até 4 linhas no feed e 5 no Stories. O conteúdo excedente não aparecerá na arte. Selecione um trecho e use o botão para aplicar negrito.
      </p>
    </>
  )
}