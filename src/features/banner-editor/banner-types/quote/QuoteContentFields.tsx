import type { ClipboardEvent, RefObject } from 'react'

import { RichTextEditor } from '../../components/RichTextEditor'

type QuoteContentFieldsProps = {
  onQuoteBold: () => void
  onQuoteInput: () => void
  onQuotePaste: (event: ClipboardEvent<HTMLDivElement>) => void
  onQuoteSecondBold: () => void
  onQuoteSecondInput: () => void
  onQuoteSecondPaste: (event: ClipboardEvent<HTMLDivElement>) => void
  quoteEditorRef: RefObject<HTMLDivElement | null>
  quoteSecondEditorRef: RefObject<HTMLDivElement | null>
}

export function QuoteContentFields({
  onQuoteBold,
  onQuoteInput,
  onQuotePaste,
  onQuoteSecondBold,
  onQuoteSecondInput,
  onQuoteSecondPaste,
  quoteEditorRef,
  quoteSecondEditorRef,
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
        Selecione um trecho e use o botão para aplicar negrito sem precisar editar HTML.
      </p>

      <label className="field-label" htmlFor="quote-second-text">
        Texto da segunda imagem
      </label>
      <RichTextEditor
        editorClassName="quote-second-editor"
        editorRef={quoteSecondEditorRef}
        id="quote-second-text"
        onBold={onQuoteSecondBold}
        onInput={onQuoteSecondInput}
        onPaste={onQuoteSecondPaste}
        placeholder="Digite o depoimento completo para a segunda imagem"
        toolbarLabel="Formatação da segunda imagem da citação"
      />
      <p className="field-hint">
        Se preencher este campo, a preview passa a exibir uma segunda imagem com o texto completo centralizado.
      </p>
    </>
  )
}