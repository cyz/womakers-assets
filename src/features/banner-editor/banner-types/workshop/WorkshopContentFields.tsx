import { workshopAccentColors, type WorkshopAccentColor } from '../../model'

type WorkshopContentFieldsProps = {
  isDualSpeaker: boolean
  onWorkshopAccentColorChange: (value: WorkshopAccentColor) => void
  onWorkshopBadgeChange: (value: string) => void
  onWorkshopBulletOneChange: (value: string) => void
  onWorkshopBulletThreeChange: (value: string) => void
  onWorkshopBulletTwoChange: (value: string) => void
  onWorkshopDescriptionChange: (value: string) => void
  onWorkshopFooterLeftLineOneChange: (value: string) => void
  onWorkshopFooterLeftLineTwoChange: (value: string) => void
  onWorkshopFooterTagChange: (value: string) => void
  onWorkshopHighlightChange: (value: string) => void
  onWorkshopTitleChange: (value: string) => void
  workshopAccentColor: WorkshopAccentColor
  workshopBadge: string
  workshopBulletOne: string
  workshopBulletThree: string
  workshopBulletTwo: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopHighlight: string
  workshopTitle: string
}

export function WorkshopContentFields({
  isDualSpeaker,
  onWorkshopAccentColorChange,
  onWorkshopBadgeChange,
  onWorkshopBulletOneChange,
  onWorkshopBulletThreeChange,
  onWorkshopBulletTwoChange,
  onWorkshopDescriptionChange,
  onWorkshopFooterLeftLineOneChange,
  onWorkshopFooterLeftLineTwoChange,
  onWorkshopFooterTagChange,
  onWorkshopHighlightChange,
  onWorkshopTitleChange,
  workshopAccentColor,
  workshopBadge,
  workshopBulletOne,
  workshopBulletThree,
  workshopBulletTwo,
  workshopDescription,
  workshopFooterLeftLineOne,
  workshopFooterLeftLineTwo,
  workshopFooterTag,
  workshopHighlight,
  workshopTitle,
}: WorkshopContentFieldsProps) {
  return (
    <>
      <label className="field-label" htmlFor="workshop-badge">
        Faixa superior
      </label>
      <input
        id="workshop-badge"
        type="text"
        value={workshopBadge}
        onChange={(event) => onWorkshopBadgeChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-title">
        Titulo principal
      </label>
      <input
        id="workshop-title"
        type="text"
        value={workshopTitle}
        onChange={(event) => onWorkshopTitleChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-highlight">
        Linha em destaque
      </label>
      <input
        id="workshop-highlight"
        type="text"
        value={workshopHighlight}
        onChange={(event) => onWorkshopHighlightChange(event.target.value)}
      />

      <fieldset className="workshop-accent-picker">
        <legend className="field-label">Cor de destaque</legend>
        <div className="workshop-accent-options" role="radiogroup" aria-label="Cor de destaque do workshop">
          {workshopAccentColors.map((accentColor) => (
            <label
              key={accentColor}
              className={`workshop-accent-option ${workshopAccentColor === accentColor ? 'is-selected' : ''}`}
            >
              <input
                type="radio"
                name="workshop-accent-color"
                value={accentColor}
                checked={workshopAccentColor === accentColor}
                onChange={() => onWorkshopAccentColorChange(accentColor)}
              />
              <span>{accentColor}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {!isDualSpeaker ? (
        <>
          <label className="field-label" htmlFor="workshop-description">
            Texto de apoio
          </label>
          <textarea
            id="workshop-description"
            value={workshopDescription}
            onChange={(event) => onWorkshopDescriptionChange(event.target.value)}
          />
        </>
      ) : null}

      <label className="field-label" htmlFor="workshop-bullet-one">
        Bullet 1
      </label>
      <input
        id="workshop-bullet-one"
        type="text"
        value={workshopBulletOne}
        onChange={(event) => onWorkshopBulletOneChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-bullet-two">
        Bullet 2
      </label>
      <input
        id="workshop-bullet-two"
        type="text"
        value={workshopBulletTwo}
        onChange={(event) => onWorkshopBulletTwoChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-bullet-three">
        Bullet 3
      </label>
      <input
        id="workshop-bullet-three"
        type="text"
        value={workshopBulletThree}
        onChange={(event) => onWorkshopBulletThreeChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-footer-left-line-one">
        Rodapé esquerdo linha 1
      </label>
      <input
        id="workshop-footer-left-line-one"
        type="text"
        value={workshopFooterLeftLineOne}
        onChange={(event) => onWorkshopFooterLeftLineOneChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-footer-left-line-two">
        Rodapé esquerdo linha 2
      </label>
      <input
        id="workshop-footer-left-line-two"
        type="text"
        value={workshopFooterLeftLineTwo}
        onChange={(event) => onWorkshopFooterLeftLineTwoChange(event.target.value)}
      />

      <label className="field-label" htmlFor="workshop-footer-tag">
        Rodapé direito
      </label>
      <input
        id="workshop-footer-tag"
        type="text"
        value={workshopFooterTag}
        onChange={(event) => onWorkshopFooterTagChange(event.target.value)}
      />
    </>
  )
}