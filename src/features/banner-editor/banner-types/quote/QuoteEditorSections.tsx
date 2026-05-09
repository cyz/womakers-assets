import type { ClipboardEvent, RefObject } from 'react'

import { AppIcon } from '../../components/AppIcon'
import { RichTextEditor } from '../../components/RichTextEditor'

type QuoteEditorSectionsProps = {
  photoFeedback: string
  quoteBackgroundFeedback: string
  quoteBackgroundImageUrl: string
  quoteEditorRef: RefObject<HTMLDivElement | null>
  quoteSecondEditorRef: RefObject<HTMLDivElement | null>
  speakerImageUrl: string
  speakerName: string
  speakerRole: string
  onQuoteInput: () => void
  onQuotePaste: (event: ClipboardEvent<HTMLDivElement>) => void
  onQuoteBold: () => void
  onQuoteSecondInput: () => void
  onQuoteSecondPaste: (event: ClipboardEvent<HTMLDivElement>) => void
  onQuoteSecondBold: () => void
  onQuoteBackgroundUpload: React.ChangeEventHandler<HTMLInputElement>
  onRemoveQuoteBackground: () => void
  onRemoveSpeakerPhoto: () => void
  onSpeakerNameChange: React.ChangeEventHandler<HTMLInputElement>
  onSpeakerPhotoUpload: React.ChangeEventHandler<HTMLInputElement>
  onSpeakerRoleChange: React.ChangeEventHandler<HTMLInputElement>
}

export function QuoteEditorSections({
  photoFeedback,
  quoteBackgroundFeedback,
  quoteBackgroundImageUrl,
  quoteEditorRef,
  quoteSecondEditorRef,
  speakerImageUrl,
  speakerName,
  speakerRole,
  onQuoteInput,
  onQuotePaste,
  onQuoteBold,
  onQuoteSecondInput,
  onQuoteSecondPaste,
  onQuoteSecondBold,
  onQuoteBackgroundUpload,
  onRemoveQuoteBackground,
  onRemoveSpeakerPhoto,
  onSpeakerNameChange,
  onSpeakerPhotoUpload,
  onSpeakerRoleChange,
}: QuoteEditorSectionsProps) {
  return (
    <>
      <section className="control-section muted-card">
        <div className="section-heading">
          <span className="section-icon" aria-hidden="true">
            <AppIcon name="text" />
          </span>
          <p className="section-label">Conteudo da citacao</p>
        </div>

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
      </section>

      <section className="control-section muted-card">
        <div className="section-heading">
          <span className="section-icon" aria-hidden="true">
            <AppIcon name="image" />
          </span>
          <p className="section-label">Autoria e background</p>
        </div>

        <label className="field-label" htmlFor="quote-name">
          Nome
        </label>
        <input
          id="quote-name"
          type="text"
          value={speakerName}
          onChange={onSpeakerNameChange}
        />

        <label className="field-label" htmlFor="quote-role">
          Funcao
        </label>
        <input
          id="quote-role"
          type="text"
          value={speakerRole}
          onChange={onSpeakerRoleChange}
        />

        <label className="field-label" htmlFor="quote-image-upload">
          Foto da aluna
        </label>
        <input
          id="quote-image-upload"
          type="file"
          accept="image/*"
          onChange={onSpeakerPhotoUpload}
        />
        <div className="photo-actions-row">
          <p className="field-hint">
            Upload de imagem com ate 8 MB. A foto aparece arredondada acima do bloco do depoimento.
          </p>
          {speakerImageUrl ? (
            <button type="button" className="secondary-inline-action" onClick={onRemoveSpeakerPhoto}>
              Remover foto
            </button>
          ) : null}
        </div>
        {photoFeedback ? <p className="field-hint upload-feedback">{photoFeedback}</p> : null}

        <label className="field-label" htmlFor="quote-background-upload">
          Imagem de fundo
        </label>
        <input
          id="quote-background-upload"
          type="file"
          accept="image/*"
          onChange={onQuoteBackgroundUpload}
        />
        <div className="photo-actions-row">
          <p className="field-hint">
            A imagem cobre o fundo do banner e recebe o layer oficial por cima para manter o enquadramento.
          </p>
          {quoteBackgroundImageUrl ? (
            <button type="button" className="secondary-inline-action" onClick={onRemoveQuoteBackground}>
              Remover fundo
            </button>
          ) : null}
        </div>
        {quoteBackgroundFeedback ? <p className="field-hint upload-feedback">{quoteBackgroundFeedback}</p> : null}
      </section>
    </>
  )
}