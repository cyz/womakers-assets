import type { RefObject } from 'react'
import { AppIcon } from './components/AppIcon'
import { CollapsibleSection } from './components/CollapsibleSection'
import { PhotoUploadField } from './components/PhotoUploadField'
import { RichTextEditor } from './components/RichTextEditor'
import { useEditor } from './EditorContext'
import { getBannerTypeModule } from './banner-types/registry'
import { isSponsorVariation } from './utils'
import type { useImageUpload } from './hooks/useImageUpload'
import type { useRichTextEditors } from './hooks/useRichTextEditors'

interface MediaSectionProps {
  open: boolean
  onToggle: () => void
  imageUpload: ReturnType<typeof useImageUpload>
  richText: Pick<
    ReturnType<typeof useRichTextEditors>,
    'applyRichTextFormatting' | 'syncRichEditorState' | 'handleRichEditorPaste'
  >
  sponsorCarouselLeadEditorRef: RefObject<HTMLDivElement | null>
  sponsorCarouselBodyEditorRef: RefObject<HTMLDivElement | null>
}

export function MediaSection({
  open,
  onToggle,
  imageUpload,
  richText,
  sponsorCarouselLeadEditorRef,
  sponsorCarouselBodyEditorRef,
}: MediaSectionProps) {
  const { editorState, updateField, feedback } = useEditor()

  const {
    selectedType,
    selectedVariation,
    speakerName,
    speakerRole,
    speakerTalk,
    speakerImageUrl,
    quoteBackgroundImageUrl,
    workshopSpeakerCount,
    workshopSecondSpeakerImageUrl,
    workshopSecondSpeakerName,
    workshopSecondSpeakerRole,
    workshopThirdSpeakerImageUrl,
    workshopThirdSpeakerName,
    workshopThirdSpeakerRole,
    workshopFourthSpeakerImageUrl,
    workshopFourthSpeakerName,
    workshopFourthSpeakerRole,
    workshopPartnerLogoUrl,
    articleSecondKeyword,
    liveSecondSpeakerName,
    liveSecondSpeakerRole,
    liveSecondSpeakerImageUrl,
    livePartnerLogoUrl1,
    livePartnerLogoUrl2,
    meetupBackgroundImageUrl,
    meetupPartnerLogoPrimaryUrl,
    meetupPartnerLogoSecondaryUrl,
    sponsorTitle,
    sponsorLogoUrl,
    sponsorCarouselImageUrl,
    sponsorCarouselCta,
  } = editorState

  const {
    handleSpeakerPhotoUpload,
    handleRemoveSpeakerPhoto,
    handleQuoteBackgroundUpload,
    handleRemoveQuoteBackground,
    handleSecondSpeakerPhotoUpload,
    handleRemoveSecondSpeakerPhoto,
    handleThirdSpeakerPhotoUpload,
    handleRemoveThirdSpeakerPhoto,
    handleFourthSpeakerPhotoUpload,
    handleRemoveFourthSpeakerPhoto,
    handleWorkshopPartnerLogoUpload,
    handleRemoveWorkshopPartnerLogo,
    handleLiveSecondSpeakerPhotoUpload,
    handleRemoveLiveSecondSpeakerPhoto,
    handleLivePartnerLogoUpload,
    handleRemoveLivePartnerLogo,
    handleMeetupBackgroundUpload,
    handleRemoveMeetupBackground,
    handleMeetupPartnerLogoUpload,
    handleRemoveMeetupPartnerLogo,
    handleSponsorLogoUpload,
    handleRemoveSponsorLogo,
    handleSponsorCarouselImageUpload,
    handleRemoveSponsorCarouselImage,
  } = imageUpload

  const { applyRichTextFormatting, syncRichEditorState, handleRichEditorPaste } = richText

  const isWorkshopLayout = selectedType === 'Workshop'
  const isWorkshopDualSpeakerLayout = isWorkshopLayout && selectedVariation === 'Palestrantes'
  const isOtherEventLayout =
    selectedType === 'Meetup Presencial' ||
    selectedType === 'Live' ||
    selectedType === 'Imersão'
  const isLiveLayout = selectedType === 'Live'
  const isAnnualLayout = selectedType === 'Encontro Anual'
  const isPocketLayout = selectedType === 'Encontro Pocket'
  const isArticleLayout = selectedType === 'Artigo'
  const isSponsorLayout = (isPocketLayout || isAnnualLayout) && isSponsorVariation(selectedVariation)
  const isSponsorCarouselLayout = isSponsorLayout && selectedVariation === 'Patrocinador Carousel'
  const activeBannerModule = getBannerTypeModule(selectedType)
  const quoteModule = activeBannerModule?.type === 'Quote' ? activeBannerModule : null
  const workshopModule = activeBannerModule?.type === 'Workshop' ? activeBannerModule : null
  const liveModule = activeBannerModule?.type === 'Live' ? activeBannerModule : null

  return (
    <CollapsibleSection icon="image" title="Palestrante" open={open} onToggle={onToggle}>
      {quoteModule ? (
        <quoteModule.MediaFields
          onQuoteBackgroundUpload={handleQuoteBackgroundUpload}
          onRemoveQuoteBackground={handleRemoveQuoteBackground}
          onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
          onSpeakerNameChange={(value) => updateField('speakerName', value)}
          onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
          onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
          photoFeedback={feedback.photo}
          quoteBackgroundFeedback={feedback.quoteBackground}
          quoteBackgroundImageUrl={quoteBackgroundImageUrl}
          speakerImageUrl={speakerImageUrl}
          speakerName={speakerName}
          speakerRole={speakerRole}
        />
      ) : workshopModule ? (
        <workshopModule.MediaFields
          isDualSpeaker={isWorkshopDualSpeakerLayout}
          onPartnerLogoUpload={handleWorkshopPartnerLogoUpload}
          onRemovePartnerLogo={handleRemoveWorkshopPartnerLogo}
          onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
          onRemoveSecondSpeakerPhoto={handleRemoveSecondSpeakerPhoto}
          onRemoveThirdSpeakerPhoto={handleRemoveThirdSpeakerPhoto}
          onRemoveFourthSpeakerPhoto={handleRemoveFourthSpeakerPhoto}
          onSpeakerCountChange={(value) => updateField('workshopSpeakerCount', value)}
          onSpeakerNameChange={(value) => updateField('speakerName', value)}
          onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
          onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
          onSecondSpeakerNameChange={(value) => updateField('workshopSecondSpeakerName', value)}
          onSecondSpeakerPhotoUpload={handleSecondSpeakerPhotoUpload}
          onSecondSpeakerRoleChange={(value) => updateField('workshopSecondSpeakerRole', value)}
          onThirdSpeakerNameChange={(value) => updateField('workshopThirdSpeakerName', value)}
          onThirdSpeakerPhotoUpload={handleThirdSpeakerPhotoUpload}
          onThirdSpeakerRoleChange={(value) => updateField('workshopThirdSpeakerRole', value)}
          onFourthSpeakerNameChange={(value) => updateField('workshopFourthSpeakerName', value)}
          onFourthSpeakerPhotoUpload={handleFourthSpeakerPhotoUpload}
          onFourthSpeakerRoleChange={(value) => updateField('workshopFourthSpeakerRole', value)}
          partnerLogoFeedback={feedback.workshopPartnerLogo}
          partnerLogoUrl={workshopPartnerLogoUrl}
          photoFeedback={feedback.photo}
          secondPhotoFeedback={feedback.secondPhoto}
          secondSpeakerImageUrl={workshopSecondSpeakerImageUrl}
          secondSpeakerName={workshopSecondSpeakerName}
          secondSpeakerRole={workshopSecondSpeakerRole}
          speakerCount={workshopSpeakerCount}
          speakerImageUrl={speakerImageUrl}
          speakerName={speakerName}
          speakerRole={speakerRole}
          thirdPhotoFeedback={feedback.thirdPhoto}
          thirdSpeakerImageUrl={workshopThirdSpeakerImageUrl}
          thirdSpeakerName={workshopThirdSpeakerName}
          thirdSpeakerRole={workshopThirdSpeakerRole}
          fourthPhotoFeedback={feedback.fourthPhoto}
          fourthSpeakerImageUrl={workshopFourthSpeakerImageUrl}
          fourthSpeakerName={workshopFourthSpeakerName}
          fourthSpeakerRole={workshopFourthSpeakerRole}
        />
      ) : isArticleLayout ? (
        <section className="control-section muted-card">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="image" />
            </span>
            <p className="section-label">Autoria e retrato</p>
          </div>

          <label className="field-label" htmlFor="article-name">
            Nome
          </label>
          <input
            id="article-name"
            type="text"
            value={speakerName}
            onChange={(event) => updateField('speakerName', event.target.value)}
          />

          <label className="field-label" htmlFor="article-role">
            Cargo
          </label>
          <input
            id="article-role"
            type="text"
            value={speakerRole}
            onChange={(event) => updateField('speakerRole', event.target.value)}
          />

          <label className="field-label" htmlFor="article-cta">
            CTA da primeira tela
          </label>
          <input
            id="article-cta"
            type="text"
            value={speakerTalk}
            onChange={(event) => updateField('speakerTalk', event.target.value)}
          />

          <label className="field-label" htmlFor="article-keyword">
            Palavra-chave da segunda tela
          </label>
          <input
            id="article-keyword"
            type="text"
            value={articleSecondKeyword}
            onChange={(event) => updateField('articleSecondKeyword', event.target.value)}
          />

          <PhotoUploadField
            id="article-image-upload"
            label="Foto da entrevistada"
            hint="Upload de imagem com até 8 MB. Se ficar vazio, a preview usa um placeholder com iniciais."
            imageUrl={speakerImageUrl}
            feedback={feedback.photo}
            removeLabel="Remover foto"
            onPhotoUpload={handleSpeakerPhotoUpload}
            onRemovePhoto={handleRemoveSpeakerPhoto}
          />
        </section>
      ) : isLiveLayout && liveModule ? (
        <liveModule.MediaFields
          speakerName={speakerName}
          speakerRole={speakerRole}
          speakerImageUrl={speakerImageUrl}
          liveSecondSpeakerName={liveSecondSpeakerName}
          liveSecondSpeakerRole={liveSecondSpeakerRole}
          liveSecondSpeakerImageUrl={liveSecondSpeakerImageUrl}
          livePartnerLogoUrl1={livePartnerLogoUrl1}
          livePartnerLogoUrl2={livePartnerLogoUrl2}
          photoFeedback={feedback.photo}
          secondPhotoFeedback={feedback.secondPhoto}
          partnerLogoFeedback={feedback.livePartnerLogo}
          onSpeakerNameChange={(value) => updateField('speakerName', value)}
          onSpeakerRoleChange={(value) => updateField('speakerRole', value)}
          onSpeakerPhotoUpload={handleSpeakerPhotoUpload}
          onRemoveSpeakerPhoto={handleRemoveSpeakerPhoto}
          onSecondSpeakerNameChange={(value) => updateField('liveSecondSpeakerName', value)}
          onSecondSpeakerRoleChange={(value) => updateField('liveSecondSpeakerRole', value)}
          onSecondSpeakerPhotoUpload={handleLiveSecondSpeakerPhotoUpload}
          onRemoveSecondSpeakerPhoto={handleRemoveLiveSecondSpeakerPhoto}
          onPartnerLogoUpload={handleLivePartnerLogoUpload}
          onRemovePartnerLogo={handleRemoveLivePartnerLogo}
        />
      ) : isOtherEventLayout ? (
        <section className="control-section muted-card">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="image" />
            </span>
            <p className="section-label">Background e logos</p>
          </div>

          <PhotoUploadField
            id="meetup-background-upload"
            label="Foto da seção inferior"
            hint="A imagem fica concentrada na faixa inferior do banner, com corte automático para preencher a seção."
            imageUrl={meetupBackgroundImageUrl}
            feedback={feedback.meetupBackground}
            removeLabel="Remover fundo"
            onPhotoUpload={handleMeetupBackgroundUpload}
            onRemovePhoto={handleRemoveMeetupBackground}
          />

          <label className="field-label" htmlFor="meetup-partner-logo-primary">
            Logo parceiro 1
          </label>
          <input
            id="meetup-partner-logo-primary"
            type="file"
            accept="image/*"
            onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoPrimaryUrl', 'meetupLogo', 'Logo parceiro 1 carregada')}
          />

          <label className="field-label" htmlFor="meetup-partner-logo-secondary">
            Logo parceiro 2
          </label>
          <input
            id="meetup-partner-logo-secondary"
            type="file"
            accept="image/*"
            onChange={handleMeetupPartnerLogoUpload('meetupPartnerLogoSecondaryUrl', 'meetupLogo', 'Logo parceiro 2 carregada')}
          />

          <div className="photo-actions-row meetup-actions-row">
            <p className="field-hint">
              Os logos parceiros ficam ao lado da marca WoMakers e se ajustam de forma proporcional e centralizada.
            </p>
            <div className="inline-actions-group">
              {meetupPartnerLogoPrimaryUrl ? (
                <button
                  type="button"
                  className="secondary-inline-action"
                  onClick={() => handleRemoveMeetupPartnerLogo('meetupPartnerLogoPrimaryUrl', 'Logo parceiro 1')}
                >
                  Remover logo 1
                </button>
              ) : null}
              {meetupPartnerLogoSecondaryUrl ? (
                <button
                  type="button"
                  className="secondary-inline-action"
                  onClick={() => handleRemoveMeetupPartnerLogo('meetupPartnerLogoSecondaryUrl', 'Logo parceiro 2')}
                >
                  Remover logo 2
                </button>
              ) : null}
            </div>
          </div>
          {feedback.meetupLogo ? <p className="field-hint upload-feedback">{feedback.meetupLogo}</p> : null}
        </section>
      ) : isSponsorLayout ? (
        <section className="control-section muted-card">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="image" />
            </span>
            <p className="section-label">Conteúdo do patrocínio</p>
          </div>

          <label className="field-label" htmlFor="sponsor-title">
            Título do bloco
          </label>
          <input
            id="sponsor-title"
            type="text"
            value={sponsorTitle}
            onChange={(event) => updateField('sponsorTitle', event.target.value)}
          />

          <PhotoUploadField
            id="sponsor-logo-upload"
            label="Logo do patrocinador"
            hint="O logo fica centralizado em uma área branca de 864x480 com borda rosa na preview."
            imageUrl={sponsorLogoUrl}
            feedback={feedback.sponsor}
            removeLabel="Remover logo"
            onPhotoUpload={handleSponsorLogoUpload}
            onRemovePhoto={handleRemoveSponsorLogo}
          />

          {isSponsorCarouselLayout ? (
            <>
              <label className="field-label" htmlFor="sponsor-carousel-lead-text">
                Texto 1 da segunda arte
              </label>
              <RichTextEditor
                editorClassName="sponsor-carousel-editor"
                editorRef={sponsorCarouselLeadEditorRef}
                id="sponsor-carousel-lead-text"
                onBold={() =>
                  applyRichTextFormatting(
                    'sponsorCarouselLeadText',
                    sponsorCarouselLeadEditorRef.current,
                    'bold',
                  )
                }
                onInput={() =>
                  syncRichEditorState('sponsorCarouselLeadText', sponsorCarouselLeadEditorRef.current)
                }
                onPaste={(event) =>
                  handleRichEditorPaste(
                    event,
                    'sponsorCarouselLeadText',
                    sponsorCarouselLeadEditorRef.current,
                  )
                }
                placeholder="Digite o texto 1 da segunda arte"
                toolbarLabel="Formatação do texto 1 da segunda arte"
              />

              <PhotoUploadField
                id="sponsor-carousel-image-upload"
                label="Imagem da segunda arte"
                hint="A imagem aparece inteira no quadro de destaque, com altura ajustada de forma proporcional."
                imageUrl={sponsorCarouselImageUrl}
                feedback={feedback.sponsorCarouselImage}
                removeLabel="Remover imagem"
                onPhotoUpload={handleSponsorCarouselImageUpload}
                onRemovePhoto={handleRemoveSponsorCarouselImage}
              />

              <label className="field-label" htmlFor="sponsor-carousel-body-text">
                Texto 2 da segunda arte
              </label>
              <RichTextEditor
                editorClassName="sponsor-carousel-editor sponsor-carousel-editor-secondary"
                editorRef={sponsorCarouselBodyEditorRef}
                id="sponsor-carousel-body-text"
                onBold={() =>
                  applyRichTextFormatting(
                    'sponsorCarouselBodyText',
                    sponsorCarouselBodyEditorRef.current,
                    'bold',
                  )
                }
                onInput={() =>
                  syncRichEditorState('sponsorCarouselBodyText', sponsorCarouselBodyEditorRef.current)
                }
                onPaste={(event) =>
                  handleRichEditorPaste(
                    event,
                    'sponsorCarouselBodyText',
                    sponsorCarouselBodyEditorRef.current,
                  )
                }
                placeholder="Digite o texto 2 da segunda arte"
                toolbarLabel="Formatação do texto 2 da segunda arte"
              />

              <label className="field-label" htmlFor="sponsor-carousel-cta">
                CTA da segunda arte
              </label>
              <input
                id="sponsor-carousel-cta"
                type="text"
                value={sponsorCarouselCta}
                onChange={(event) => updateField('sponsorCarouselCta', event.target.value)}
                placeholder="Ex.: Saiba mais no nosso site"
              />
            </>
          ) : null}
        </section>
      ) : (
        <section className="control-section muted-card">
          <label className="field-label" htmlFor="speaker-name">
            Nome
          </label>
          <input
            id="speaker-name"
            type="text"
            value={speakerName}
            onChange={(event) => updateField('speakerName', event.target.value)}
          />

          <label className="field-label" htmlFor="speaker-role">
            Função
          </label>
          <input
            id="speaker-role"
            type="text"
            value={speakerRole}
            onChange={(event) => updateField('speakerRole', event.target.value)}
          />

          <label className="field-label" htmlFor="speaker-talk">
            Conteúdo
          </label>
          <input
            id="speaker-talk"
            type="text"
            value={speakerTalk}
            onChange={(event) => updateField('speakerTalk', event.target.value)}
          />

          <PhotoUploadField
            id="speaker-image-upload"
            label="Foto da palestrante"
            hint="Upload de imagem com até 8 MB. Se ficar vazio, a preview mostra um placeholder com iniciais."
            imageUrl={speakerImageUrl}
            feedback={feedback.photo}
            removeLabel="Remover foto"
            onPhotoUpload={handleSpeakerPhotoUpload}
            onRemovePhoto={handleRemoveSpeakerPhoto}
          />
        </section>
      )}
    </CollapsibleSection>
  )
}
