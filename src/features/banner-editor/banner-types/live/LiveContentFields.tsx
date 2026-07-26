interface LiveContentFieldsProps {
  liveSupportText: string
  liveSupportTextBold: boolean
  liveSupportTextCapslock: boolean
  liveFooterLeftText: string
  liveFooterRightText: string
  onLiveSupportTextChange: (value: string) => void
  onLiveSupportTextBoldToggle: (value: boolean) => void
  onLiveSupportTextCapslockToggle: (value: boolean) => void
  onLiveFooterLeftTextChange: (value: string) => void
  onLiveFooterRightTextChange: (value: string) => void
}

export function LiveContentFields({
  liveSupportText,
  liveSupportTextBold,
  liveSupportTextCapslock,
  liveFooterLeftText,
  liveFooterRightText,
  onLiveSupportTextChange,
  onLiveSupportTextBoldToggle,
  onLiveSupportTextCapslockToggle,
  onLiveFooterLeftTextChange,
  onLiveFooterRightTextChange,
}: LiveContentFieldsProps) {
  return (
    <>
      <label className="field-label" htmlFor="live-support-text">
        Frase de apoio
      </label>
      <input
        id="live-support-text"
        type="text"
        value={liveSupportText}
        onChange={(event) => onLiveSupportTextChange(event.target.value)}
        placeholder="Digite a frase de apoio"
      />

      <div className="checkbox-group">
        <button
          type="button"
          id="live-support-bold"
          className="switch-field"
          role="switch"
          aria-checked={liveSupportTextBold}
          onClick={() => onLiveSupportTextBoldToggle(!liveSupportTextBold)}
        >
          <span>Deixar em negrito</span>
          <span className={`switch ${liveSupportTextBold ? 'is-on' : ''}`.trim()} aria-hidden="true">
            <span />
          </span>
        </button>

        <button
          type="button"
          id="live-support-capslock"
          className="switch-field"
          role="switch"
          aria-checked={liveSupportTextCapslock}
          onClick={() => onLiveSupportTextCapslockToggle(!liveSupportTextCapslock)}
        >
          <span>Converter para MAIÚSCULA</span>
          <span className={`switch ${liveSupportTextCapslock ? 'is-on' : ''}`.trim()} aria-hidden="true">
            <span />
          </span>
        </button>
      </div>

      <label className="field-label" htmlFor="live-footer-left">
        Texto do rodapé (esquerda)
      </label>
      <input
        id="live-footer-left"
        type="text"
        value={liveFooterLeftText}
        onChange={(event) => onLiveFooterLeftTextChange(event.target.value)}
        placeholder="Ex: ao vivo e gratuito"
      />

      <label className="field-label" htmlFor="live-footer-right">
        Texto do rodapé (direita)
      </label>
      <input
        id="live-footer-right"
        type="text"
        value={liveFooterRightText}
        onChange={(event) => onLiveFooterRightTextChange(event.target.value)}
        placeholder="Ex: com certificado"
      />
    </>
  )
}
