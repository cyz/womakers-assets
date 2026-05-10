import { useEffect } from 'react'
import type { SavedBannerAsset } from '../model'

export type SavedBannersPageProps = {
  banners: SavedBannerAsset[]
  onEdit: (asset: SavedBannerAsset) => void
  onDelete: (asset: SavedBannerAsset) => void
  onBack: () => void
}

export function SavedBannersPage({ banners, onEdit, onDelete, onBack }: SavedBannersPageProps) {
  useEffect(() => {
    document.title = 'Modelos salvos | WoMakers Social Assets'
  }, [])

  const totalSaved = banners.length

  return (
    <div className="saved-banners-page">
      <header className="saved-banners-header">
        <div className="saved-banners-header-copy">
          <button type="button" className="ghost-button" onClick={onBack}>
            Voltar para home
          </button>
          <div>
            <p className="toolbar-kicker">Biblioteca</p>
            <h1>Modelos salvos</h1>
            <p className="saved-banners-subtitle">
              Encontre versoes anteriores, identifique o tipo de template e retome a edicao rapidamente.
            </p>
          </div>
        </div>
        <div className="saved-banners-summary-card">
          <span className="saved-banners-summary-label">Total salvo</span>
          <strong className="saved-banners-summary-value">{totalSaved}</strong>
        </div>
      </header>
      <div className="saved-banners-list">
        {banners.length === 0 ? (
          <div className="saved-banners-empty-state">
            <p className="empty-message">Nenhum modelo salvo ainda.</p>
            <p className="saved-banners-subtitle">Use o botao Salvar versao dentro do construtor para criar sua biblioteca.</p>
          </div>
        ) : (
          <div className="saved-banners-table" role="table" aria-label="Modelos salvos">
            <div className="saved-banners-table-head" role="rowgroup">
              <div className="saved-banner-row is-header" role="row">
                <span className="saved-banner-column column-preview" role="columnheader">Preview</span>
                <span className="saved-banner-column column-template" role="columnheader">Template</span>
                <span className="saved-banner-column column-name" role="columnheader">Arquivo</span>
                <span className="saved-banner-column column-context" role="columnheader">Identificador</span>
                <span className="saved-banner-column column-date" role="columnheader">Salvo em</span>
                <span className="saved-banner-column column-actions" role="columnheader">Ações</span>
              </div>
            </div>
            <div className="saved-banners-table-body" role="rowgroup">
              {banners.map((asset) => (
                <article key={asset.id} className="saved-banner-row" role="row">
                  <div className="saved-banner-column column-preview" role="cell">
                    <button
                      type="button"
                      className="saved-banner-thumb-button"
                      onClick={() => onEdit(asset)}
                      aria-label={`Abrir ${asset.fileName}`}
                    >
                      <img src={asset.imageDataUrl} alt={asset.fileName} className="saved-banner-thumb" />
                    </button>
                  </div>
                  <div className="saved-banner-column column-template" role="cell">
                    <span className="saved-banner-type">{asset.editorState.selectedType}</span>
                  </div>
                  <div className="saved-banner-column column-name" role="cell">
                    <strong className="saved-banner-name">{asset.fileName}</strong>
                  </div>
                  <div className="saved-banner-column column-context" role="cell">
                    <p className="saved-banner-caption">
                      {asset.editorState.selectedType === 'Quote' || asset.editorState.selectedType === 'Artigo'
                        ? asset.editorState.speakerName || 'Sem nome da autora'
                        : asset.editorState.eventTitle || 'Sem titulo definido'}
                    </p>
                  </div>
                  <div className="saved-banner-column column-date" role="cell">
                    <span className="saved-banner-date">{new Date(asset.savedAt).toLocaleString()}</span>
                  </div>
                  <div className="saved-banner-column column-actions" role="cell">
                    <div className="saved-banner-actions">
                      <button type="button" className="ghost-button saved-banner-action" onClick={() => onEdit(asset)}>
                        Editar
                      </button>
                      <button type="button" className="ghost-button saved-banner-action is-danger" onClick={() => onDelete(asset)}>
                        Deletar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
