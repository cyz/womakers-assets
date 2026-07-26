import { workshopAccentColors, type WorkshopAccentColor } from '../../model'

type WorkshopContentFieldsProps = {
  isDualSpeaker: boolean
  onWorkshopAccentColorChange: (value: WorkshopAccentColor) => void
  onWorkshopBackgroundImageChange: (value: string) => void
  onWorkshopBadgeChange: (value: string) => void
  onWorkshopBulletCountChange: (value: number) => void
  onWorkshopBulletOneChange: (value: string) => void
  onWorkshopBulletThreeChange: (value: string) => void
  onWorkshopBulletTwoChange: (value: string) => void
  onWorkshopBulletsIntroChange: (value: string) => void
  onWorkshopDescriptionChange: (value: string) => void
  onWorkshopFooterLeftLineOneChange: (value: string) => void
  onWorkshopFooterLeftLineTwoChange: (value: string) => void
  onWorkshopFooterTagChange: (value: string) => void
  onWorkshopHighlightChange: (value: string) => void
  onWorkshopHighlightColoredChange: (value: boolean) => void
  onWorkshopTitleChange: (value: string) => void
  workshopAccentColor: WorkshopAccentColor
  workshopBackgroundImageUrl: string
  workshopBadge: string
  workshopBulletCount: number
  workshopBulletOne: string
  workshopBulletThree: string
  workshopBulletTwo: string
  workshopBulletsIntro: string
  workshopDescription: string
  workshopFooterLeftLineOne: string
  workshopFooterLeftLineTwo: string
  workshopFooterTag: string
  workshopHighlight: string
  workshopHighlightColored: boolean
  workshopTitle: string
}

export function WorkshopContentFields({
  isDualSpeaker,
  onWorkshopAccentColorChange,
  onWorkshopBackgroundImageChange,
  onWorkshopBadgeChange,
  onWorkshopBulletCountChange,
  onWorkshopBulletOneChange,
  onWorkshopBulletThreeChange,
  onWorkshopBulletTwoChange,
  onWorkshopBulletsIntroChange,
  onWorkshopDescriptionChange,
  onWorkshopFooterLeftLineOneChange,
  onWorkshopFooterLeftLineTwoChange,
  onWorkshopFooterTagChange,
  onWorkshopHighlightChange,
  onWorkshopHighlightColoredChange,
  onWorkshopTitleChange,
  workshopAccentColor,
  workshopBackgroundImageUrl,
  workshopBadge,
  workshopBulletCount,
  workshopBulletOne,
  workshopBulletThree,
  workshopBulletTwo,
  workshopBulletsIntro,
  workshopDescription,
  workshopFooterLeftLineOne,
  workshopFooterLeftLineTwo,
  workshopFooterTag,
  workshopHighlight,
  workshopHighlightColored,
  workshopTitle,
}: WorkshopContentFieldsProps) {
  const workshopBackgroundAssetUrl = `${import.meta.env.BASE_URL}src/assets/themes/fundo.png`
  const bulletValues = [workshopBulletOne, workshopBulletTwo, workshopBulletThree]
  const bulletChangeHandlers = [
    onWorkshopBulletOneChange,
    onWorkshopBulletTwoChange,
    onWorkshopBulletThreeChange,
  ]
  const bulletCount = Math.min(Math.max(workshopBulletCount ?? 0, 0), 3)

  const handleAddBullet = () => {
    onWorkshopBulletCountChange(Math.min(bulletCount + 1, 3))
  }

  const handleRemoveBullet = (removeIndex: number) => {
    const nextValues = bulletValues.filter((_, index) => index !== removeIndex)
    nextValues.push('')
    nextValues.forEach((value, index) => {
      if (value !== bulletValues[index]) {
        bulletChangeHandlers[index](value)
      }
    })
    onWorkshopBulletCountChange(Math.max(bulletCount - 1, 0))
  }

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

      <button
        type="button"
        id="workshop-highlight-colored-toggle"
        className="switch-field"
        role="switch"
        aria-checked={workshopHighlightColored}
        onClick={() => onWorkshopHighlightColoredChange(!workshopHighlightColored)}
      >
        <span>Destaque colorido</span>
        <span className={`switch ${workshopHighlightColored ? 'is-on' : ''}`.trim()} aria-hidden="true">
          <span />
        </span>
      </button>

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

      <label className="field-label" htmlFor="workshop-background-image">
        Fundo do banner
      </label>
      <select
        id="workshop-background-image"
        value={workshopBackgroundImageUrl}
        onChange={(event) => onWorkshopBackgroundImageChange(event.target.value)}
      >
        <option value="">Padrão</option>
        <option value={workshopBackgroundAssetUrl}>fundo.png</option>
      </select>

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

      {isDualSpeaker ? (
        <>
          <label className="field-label" htmlFor="workshop-bullets-intro">
            Texto antes dos bullets
          </label>
          <textarea
            id="workshop-bullets-intro"
            value={workshopBulletsIntro}
            onChange={(event) => onWorkshopBulletsIntroChange(event.target.value)}
          />
        </>
      ) : null}

      <div className="workshop-bullets-editor">
        <p className="field-label">Bullets (até 3, máx. 100 caracteres)</p>

        {bulletValues.slice(0, bulletCount).map((value, index) => (
          <div key={`workshop-bullet-${index}`} className="workshop-bullet-field">
            <label className="field-label" htmlFor={`workshop-bullet-${index}`}>
              Bullet {index + 1}
            </label>
            <div className="workshop-bullet-field-row">
              <input
                id={`workshop-bullet-${index}`}
                type="text"
                maxLength={100}
                value={value}
                onChange={(event) => bulletChangeHandlers[index](event.target.value)}
              />
              <button
                type="button"
                className="secondary-inline-action"
                onClick={() => handleRemoveBullet(index)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        {bulletCount === 0 ? (
          <p className="field-hint">Nenhum bullet adicionado.</p>
        ) : null}

        {bulletCount < 3 ? (
          <button type="button" className="secondary-inline-action" onClick={handleAddBullet}>
            Adicionar bullet
          </button>
        ) : null}
      </div>

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