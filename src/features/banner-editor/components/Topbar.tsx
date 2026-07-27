import { AppIcon } from './AppIcon'

type TopbarProps = {
  onBrandClick: () => void
  onUndo: () => void
  canUndo: boolean
  onRedo: () => void
  canRedo: boolean
  onOpenSaved: () => void
}

export function Topbar({
  onBrandClick,
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  onOpenSaved,
}: TopbarProps) {
  return (
    <header className="app-topbar">
      <button type="button" className="app-topbar-brand" onClick={onBrandClick} aria-label="Voltar para o editor">
        <span className="app-topbar-logo" aria-hidden="true">
          <AppIcon name="spark" />
        </span>
        <div className="app-topbar-brand-text">
          <strong>WoMakersCode</strong>
          <span>Social Assets</span>
        </div>
      </button>
      <div className="app-topbar-actions" aria-label="Ações">
        <button
          type="button"
          className="app-topbar-icon-btn"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Desfazer"
          title="Desfazer"
        >
          <AppIcon name="undo" />
        </button>
        <button
          type="button"
          className="app-topbar-icon-btn"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Refazer"
          title="Refazer"
        >
          <AppIcon name="redo" />
        </button>
        <a
          className="app-topbar-link"
          href="https://github.com/cyz/womakers-assets"
          target="_blank"
          rel="noreferrer"
          aria-label="Repositório no GitHub"
          title="Repositório no GitHub"
        >
          <AppIcon name="github" />
        </a>
        <button type="button" className="app-topbar-pill" onClick={onOpenSaved}>
          <AppIcon name="history" className="button-icon" />
          Banners salvos
        </button>
      </div>
    </header>
  )
}
