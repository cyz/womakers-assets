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
        <label className="checkbox-field" htmlFor="live-support-bold">
          <input
            id="live-support-bold"
            type="checkbox"
            checked={liveSupportTextBold}
            onChange={(event) => onLiveSupportTextBoldToggle(event.target.checked)}
          />
          <span>Deixar em negrito</span>
        </label>

        <label className="checkbox-field" htmlFor="live-support-capslock">
          <input
            id="live-support-capslock"
            type="checkbox"
            checked={liveSupportTextCapslock}
            onChange={(event) => onLiveSupportTextCapslockToggle(event.target.checked)}
          />
          <span>Converter para MAIÚSCULA</span>
        </label>
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
