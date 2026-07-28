import type { RefObject } from 'react'
import { CollapsibleSection } from './components/CollapsibleSection'
import { RichTextEditor } from './components/RichTextEditor'
import { useEditor } from './EditorContext'
import { getBannerTypeModule } from './banner-types/registry'
import type { useRichTextEditors } from './hooks/useRichTextEditors'

interface ContentSectionProps {
  open: boolean
  onToggle: () => void
  richText: Pick<
    ReturnType<typeof useRichTextEditors>,
    'applyRichTextFormatting' | 'syncRichEditorState' | 'handleRichEditorPaste'
  >
  quoteEditorRef: RefObject<HTMLDivElement | null>
  quoteSecondEditorRef: RefObject<HTMLDivElement | null>
  articleSecondEditorRef: RefObject<HTMLDivElement | null>
}

export function ContentSection({
  open,
  onToggle,
  richText,
  quoteEditorRef,
  quoteSecondEditorRef,
  articleSecondEditorRef,
}: ContentSectionProps) {
  const { editorState, updateField } = useEditor()

  const {
    selectedType,
    selectedVariation,
    eventTitle,
    eventCity,
    eventDate,
    eventLocation,
    meetupSupportText,
    meetupCta,
    showAnnualCta,
    annualCtaUrl,
    annualCtaUrlBold,
    workshopTitle,
    workshopBadge,
    workshopHighlight,
    workshopHighlightColored,
    workshopSpeakerCount,
    workshopAccentColor,
    workshopBackgroundImageUrl,
    workshopBulletsIntro,
    workshopBulletCount,
    workshopBulletOne,
    workshopBulletTwo,
    workshopBulletThree,
    workshopFooterLeftLineOne,
    workshopFooterLeftLineTwo,
    workshopFooterTag,
  } = editorState

  const { applyRichTextFormatting, syncRichEditorState, handleRichEditorPaste } = richText

  const isQuoteLayout = selectedType === 'Quote'
  const isArticleLayout = selectedType === 'Artigo'
  const isWorkshopLayout = selectedType === 'Workshop'
  const isWorkshopDualSpeakerLayout = isWorkshopLayout && workshopSpeakerCount > 1
  const isOtherEventLayout =
    selectedType === 'Meetup Presencial' ||
    selectedType === 'Live' ||
    selectedType === 'Imersão'
  const isAnnualLayout = selectedType === 'Encontro Anual'
  const isAnnualSpeakerLayout = isAnnualLayout && selectedVariation === 'Palestrante'
  const activeBannerModule = getBannerTypeModule(selectedType)
  const quoteModule = activeBannerModule?.type === 'Quote' ? activeBannerModule : null
  const workshopModule = activeBannerModule?.type === 'Workshop' ? activeBannerModule : null

  return (
    <CollapsibleSection
      icon="text"
      title={isQuoteLayout ? 'Conteúdo da citação' : isArticleLayout ? 'Trecho do artigo' : isWorkshopLayout ? 'Conteúdo do workshop' : 'Conteúdo do evento'}
      open={open}
      onToggle={onToggle}
    >
      {isQuoteLayout || isArticleLayout ? (
        <>
          {quoteModule ? (
            <quoteModule.ContentFields
              isStoriesPlatform={false}
              onQuoteBold={() => applyRichTextFormatting('quoteText', quoteEditorRef.current, 'bold')}
              onQuoteInput={() => syncRichEditorState('quoteText', quoteEditorRef.current)}
              onQuotePaste={(event) => handleRichEditorPaste(event, 'quoteText', quoteEditorRef.current)}
              onQuoteSecondBold={() => applyRichTextFormatting('quoteSecondText', quoteSecondEditorRef.current, 'bold')}
              onQuoteSecondInput={() => syncRichEditorState('quoteSecondText', quoteSecondEditorRef.current)}
              onQuoteSecondPaste={(event) => handleRichEditorPaste(event, 'quoteSecondText', quoteSecondEditorRef.current)}
              quoteEditorRef={quoteEditorRef}
              quoteSecondEditorRef={quoteSecondEditorRef}
            />
          ) : null}

          {isArticleLayout ? (
            <>
              <label className="field-label" htmlFor="article-highlight-text">
                Trecho em destaque
              </label>
              <RichTextEditor
                editorClassName="article-highlight-editor"
                editorRef={quoteEditorRef}
                id="article-highlight-text"
                onBold={() => applyRichTextFormatting('quoteText', quoteEditorRef.current, 'bold')}
                onInput={() => syncRichEditorState('quoteText', quoteEditorRef.current)}
                onPaste={(event) => handleRichEditorPaste(event, 'quoteText', quoteEditorRef.current)}
                placeholder="Digite o trecho em destaque da primeira tela"
                toolbarLabel="Formatação do destaque do artigo"
              />

              <label className="field-label" htmlFor="article-second-text">
                Conteúdo da segunda tela
              </label>
              <RichTextEditor
                editorClassName="article-second-editor"
                editorRef={articleSecondEditorRef}
                id="article-second-text"
                onBold={() => applyRichTextFormatting('articleSecondText', articleSecondEditorRef.current, 'bold')}
                onInput={() => syncRichEditorState('articleSecondText', articleSecondEditorRef.current)}
                onPaste={(event) => handleRichEditorPaste(event, 'articleSecondText', articleSecondEditorRef.current)}
                placeholder="Digite o conselho da segunda tela"
                toolbarLabel="Formatação da segunda tela do artigo"
              />
              <p className="field-hint">
                Essa segunda tela aparece ao lado da primeira na preview e pode ser vista com scroll horizontal.
              </p>
            </>
          ) : null}
        </>
      ) : isWorkshopLayout ? (
        workshopModule ? (
          <workshopModule.ContentFields
            isDualSpeaker={isWorkshopDualSpeakerLayout}
            onWorkshopAccentColorChange={(value) => updateField('workshopAccentColor', value)}
            onWorkshopBackgroundImageChange={(value) => updateField('workshopBackgroundImageUrl', value)}
            onWorkshopBadgeChange={(value) => updateField('workshopBadge', value)}
            onWorkshopBulletCountChange={(value) => updateField('workshopBulletCount', value)}
            onWorkshopBulletOneChange={(value) => updateField('workshopBulletOne', value)}
            onWorkshopBulletThreeChange={(value) => updateField('workshopBulletThree', value)}
            onWorkshopBulletTwoChange={(value) => updateField('workshopBulletTwo', value)}
            onWorkshopBulletsIntroChange={(value) => updateField('workshopBulletsIntro', value)}
            onWorkshopFooterLeftLineOneChange={(value) => updateField('workshopFooterLeftLineOne', value)}
            onWorkshopFooterLeftLineTwoChange={(value) => updateField('workshopFooterLeftLineTwo', value)}
            onWorkshopFooterTagChange={(value) => updateField('workshopFooterTag', value)}
            onWorkshopHighlightChange={(value) => updateField('workshopHighlight', value)}
            onWorkshopHighlightColoredChange={(value) => updateField('workshopHighlightColored', value)}
            onWorkshopTitleChange={(value) => updateField('workshopTitle', value)}
            workshopAccentColor={workshopAccentColor}
            workshopBackgroundImageUrl={workshopBackgroundImageUrl}
            workshopBadge={workshopBadge}
            workshopBulletCount={workshopBulletCount}
            workshopBulletOne={workshopBulletOne}
            workshopBulletThree={workshopBulletThree}
            workshopBulletTwo={workshopBulletTwo}
            workshopBulletsIntro={workshopBulletsIntro}
            workshopFooterLeftLineOne={workshopFooterLeftLineOne}
            workshopFooterLeftLineTwo={workshopFooterLeftLineTwo}
            workshopFooterTag={workshopFooterTag}
            workshopHighlight={workshopHighlight}
            workshopHighlightColored={workshopHighlightColored}
            workshopTitle={workshopTitle}
          />
        ) : null
      ) : isOtherEventLayout ? (
        <>
          <label className="field-label" htmlFor="event-date">
            Data e horário
          </label>
          <input
            id="event-date"
            type="text"
            value={eventDate}
            onChange={(event) => updateField('eventDate', event.target.value)}
          />

          <label className="field-label" htmlFor="event-location">
            Local
          </label>
          <input
            id="event-location"
            type="text"
            value={eventLocation}
            onChange={(event) => updateField('eventLocation', event.target.value)}
          />

          <label className="field-label" htmlFor="meetup-support-text">
            Frase de apoio
          </label>
          <input
            id="meetup-support-text"
            type="text"
            value={meetupSupportText}
            onChange={(event) => updateField('meetupSupportText', event.target.value)}
          />

          <label className="field-label" htmlFor="meetup-cta">
            CTA em destaque
          </label>
          <input
            id="meetup-cta"
            type="text"
            value={meetupCta}
            onChange={(event) => updateField('meetupCta', event.target.value)}
          />
        </>
      ) : (
        <>
          <label className="field-label" htmlFor="event-title">
            Nome do evento
          </label>
          <input
            id="event-title"
            type="text"
            value={eventTitle}
            onChange={(event) => updateField('eventTitle', event.target.value)}
          />

          {!isAnnualSpeakerLayout ? (
            <>
              <label className="field-label" htmlFor="event-city">
                Cidade em destaque
              </label>
              <input
                id="event-city"
                type="text"
                value={eventCity}
                onChange={(event) => updateField('eventCity', event.target.value)}
              />
            </>
          ) : null}

          <label className="field-label" htmlFor="event-date">
            Data
          </label>
          <input
            id="event-date"
            type="text"
            value={eventDate}
            onChange={(event) => updateField('eventDate', event.target.value)}
          />

          <label className="field-label" htmlFor="event-location">
            Localização
          </label>
          <input
            id="event-location"
            type="text"
            value={eventLocation}
            onChange={(event) => updateField('eventLocation', event.target.value)}
          />

          {isAnnualSpeakerLayout ? (
            <>
              <button
                type="button"
                id="annual-cta-toggle"
                className="switch-field"
                role="switch"
                aria-checked={showAnnualCta}
                onClick={() => updateField('showAnnualCta', !showAnnualCta)}
              >
                <span>Incluir CTA no rodapé do Encontro Anual</span>
                <span className={`switch ${showAnnualCta ? 'is-on' : ''}`.trim()} aria-hidden="true">
                  <span />
                </span>
              </button>

              {showAnnualCta ? (
                <>
                  <label className="field-label" htmlFor="annual-cta-url">
                    CTA URL
                  </label>
                  <input
                    id="annual-cta-url"
                    type="text"
                    value={annualCtaUrl}
                    onChange={(event) => updateField('annualCtaUrl', event.target.value)}
                  />

                  <label className="field-label" htmlFor="annual-cta-url-bold">
                    CTA URL Bold
                  </label>
                  <input
                    id="annual-cta-url-bold"
                    type="text"
                    value={annualCtaUrlBold}
                    onChange={(event) => updateField('annualCtaUrlBold', event.target.value)}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </CollapsibleSection>
  )
}
