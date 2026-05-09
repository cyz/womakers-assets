import { useState } from 'react'
import './App.css'

const imageTypes = [
  'Encontro Pocket',
  'Encontro Anual',
  'Meetup Presencial',
  'Evento Online',
  'Imersão',
] as const

const assetKinds = ['Palestrante', 'Agenda'] as const

const platforms = [
  'Twitter / X (1200x675)',
  'Instagram Feed (1080x1350)',
  'Instagram Story (1080x1920)',
  'LinkedIn (1200x627)',
] as const

const graphicThemes = ['Dark', 'Light', 'WoMakers'] as const

const previewColumns = [
  {
    title: 'Theme #1',
    features: [
      { title: 'Feature #1', description: 'Concise description of the feature' },
      { title: 'Feature #2', description: 'Concise description of the feature' },
      { title: 'Feature #3', description: 'Concise description of the feature' },
    ],
  },
  {
    title: 'Theme #2',
    features: [
      { title: 'Feature #1', description: 'Concise description of the feature' },
      { title: 'Feature #2', description: 'Concise description of the feature' },
      { title: 'Feature #3', description: 'Concise description of the feature' },
    ],
  },
  {
    title: 'Theme #3',
    features: [
      { title: 'Feature #1', description: 'Concise description of the feature' },
      { title: 'Feature #2', description: 'Concise description of the feature' },
      { title: 'Feature #3', description: 'Concise description of the feature' },
    ],
  },
] as const

type IconName =
  | 'spark'
  | 'calendar'
  | 'layout'
  | 'swatch'
  | 'text'
  | 'download'
  | 'chevronDown'
  | 'layers'
  | 'refresh'

function AppIcon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case 'spark':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 2 13.9 7.1 19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2Z" />
          <path d="M18.5 15 19.4 17.6 22 18.5l-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
        </svg>
      )
    case 'calendar':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      )
    case 'layout':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <path d="M9 4v16M9 10h12" />
        </svg>
      )
    case 'swatch':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 9 9c0-1.6-1.1-2.7-2.7-2.7h-2.1a1.7 1.7 0 0 1 0-3.3H15A3 3 0 0 0 12 3Z" />
          <circle cx="7.5" cy="11" r="1" />
          <circle cx="10" cy="7.5" r="1" />
          <circle cx="14" cy="7.5" r="1" />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M4 6h16M8 6v12M16 6v12M6 18h12" />
        </svg>
      )
    case 'download':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 4v11" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 20h14" />
        </svg>
      )
    case 'chevronDown':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      )
    case 'layers':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m12 4 8 4-8 4-8-4 8-4Z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      )
    case 'refresh':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M20 11a8 8 0 0 0-14-4" />
          <path d="M4 4v5h5" />
          <path d="M4 13a8 8 0 0 0 14 4" />
          <path d="M20 20v-5h-5" />
        </svg>
      )
  }
}

function App() {
  const [selectedType, setSelectedType] = useState<(typeof imageTypes)[number]>(
    imageTypes[0],
  )
  const [selectedAssetKind, setSelectedAssetKind] = useState<
    (typeof assetKinds)[number]
  >(assetKinds[0])
  const [selectedPlatform, setSelectedPlatform] = useState<
    (typeof platforms)[number]
  >(platforms[0])
  const [selectedTheme, setSelectedTheme] = useState<
    (typeof graphicThemes)[number]
  >(graphicThemes[0])

  return (
    <div className="app-shell">
      <aside className="control-panel">
        <div className="panel-header">
          <div className="panel-badge">
            <span className="badge-icon" aria-hidden="true">
              <AppIcon name="spark" />
            </span>
            <span>Interface flow</span>
          </div>
          <h1>WoMakers Asset Generator</h1>
        </div>

        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layers" />
            </span>
            <p className="section-label">Tipo de imagem</p>
          </div>
          <label className="field-label" htmlFor="image-type">
            Evento
          </label>
          <div className="select-shell">
            <span className="select-leading-icon" aria-hidden="true">
              <AppIcon name="calendar" />
            </span>
            <select
              id="image-type"
              value={selectedType}
              onChange={(event) =>
                setSelectedType(event.target.value as (typeof imageTypes)[number])
              }
            >
              {imageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">
              <AppIcon name="chevronDown" />
            </span>
          </div>
          <p className="field-hint">Define o formato base do material que sera montado.</p>

          <label className="field-label" htmlFor="asset-kind">
            Tipo
          </label>
          <div className="select-shell">
            <span className="select-leading-icon" aria-hidden="true">
              <AppIcon name="layers" />
            </span>
            <select
              id="asset-kind"
              value={selectedAssetKind}
              onChange={(event) =>
                setSelectedAssetKind(
                  event.target.value as (typeof assetKinds)[number],
                )
              }
            >
              {assetKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">
              <AppIcon name="chevronDown" />
            </span>
          </div>
          <p className="field-hint">Marca se a arte sera usada para palestrante ou para agenda.</p>
        </section>

        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layout" />
            </span>
            <p className="section-label">Dimensions</p>
          </div>
          <label className="field-label" htmlFor="platform">
            Platform
          </label>
          <div className="select-shell">
            <span className="select-leading-icon" aria-hidden="true">
              <AppIcon name="layout" />
            </span>
            <select
              id="platform"
              value={selectedPlatform}
              onChange={(event) =>
                setSelectedPlatform(event.target.value as (typeof platforms)[number])
              }
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">
              <AppIcon name="chevronDown" />
            </span>
          </div>
          <p className="field-hint">Escolhe a proporcao final antes de preencher o conteudo.</p>
        </section>

        <section className="control-section">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="swatch" />
            </span>
            <p className="section-label">Theme</p>
          </div>
          <label className="field-label" htmlFor="graphic-theme">
            Graphic Theme
          </label>
          <div className="select-shell">
            <span className="select-leading-icon" aria-hidden="true">
              <AppIcon name="swatch" />
            </span>
            <select
              id="graphic-theme"
              value={selectedTheme}
              onChange={(event) =>
                setSelectedTheme(event.target.value as (typeof graphicThemes)[number])
              }
            >
              {graphicThemes.map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
            <span className="select-chevron" aria-hidden="true">
              <AppIcon name="chevronDown" />
            </span>
          </div>
          <p className="field-hint">Aplica o visual base da composicao antes da implementacao real.</p>
        </section>

        <section className="control-section muted-card">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="text" />
            </span>
            <p className="section-label">Content placeholders</p>
          </div>
          <label className="field-label" htmlFor="headline">
            Headline
          </label>
          <input id="headline" type="text" placeholder="May Release" disabled />

          <label className="field-label" htmlFor="version-badge">
            Badge
          </label>
          <input id="version-badge" type="text" placeholder="v1.113" disabled />
        </section>

        <section className="control-section setup-summary">
          <div className="section-heading">
            <span className="section-icon" aria-hidden="true">
              <AppIcon name="layers" />
            </span>
            <p className="section-label">Current setup</p>
          </div>
          <div className="summary-chips" aria-label="Current selections">
            <span>{selectedType}</span>
            <span>{selectedAssetKind}</span>
            <span>{selectedPlatform}</span>
            <span>{selectedTheme}</span>
          </div>
        </section>

        <div className="panel-footer">
          <button type="button" className="primary-action" disabled>
            <AppIcon name="download" className="button-icon" />
            <span>Download PNG</span>
          </button>
          <p className="footer-copy">Export and preview generation will be connected next.</p>
        </div>
      </aside>

      <main className="preview-area">
        <header className="preview-toolbar">
          <div>
            <p className="toolbar-kicker">Preview</p>
            <p className="toolbar-copy">Reference-inspired canvas for flow approval</p>
          </div>
          <div className="toolbar-actions" aria-label="Preview actions">
            <button type="button" className="icon-button" disabled aria-label="Undo">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7 4 12l5 5" />
                <path d="M20 7v6a4 4 0 0 1-4 4H4" />
              </svg>
            </button>
            <button type="button" className="icon-button" disabled aria-label="Redo">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 7 5 5-5 5" />
                <path d="M4 7v6a4 4 0 0 0 4 4h12" />
              </svg>
            </button>
            <button type="button" className="ghost-button" disabled>
              <AppIcon name="refresh" className="button-icon" />
              Reset all
            </button>
          </div>
        </header>

        <section className="preview-stage" aria-label="Banner preview mockup">
          <div className="preview-frame dark">
            <div className="preview-topline preview-meta-row">
              <span>{selectedType}</span>
              <span className="preview-type-pill">{selectedAssetKind}</span>
            </div>

            <div className="preview-header-row">
              <div className="preview-title-group">
                <h2>May Release</h2>
                <div className="release-badge">v1.113</div>
              </div>

              <div className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 82 72">
                  <path d="M48 6 72 18v36L48 66 36 54l24-12-24-12L48 6Z" />
                  <path d="M10 20 30 40 10 60l8 8 28-28L18 12l-8 8Z" />
                </svg>
              </div>
            </div>

            <div className="preview-grid">
              {previewColumns.map((column) => (
                <article key={column.title} className="preview-column">
                  <h3>{column.title}</h3>
                  <div className="preview-feature-list">
                    {column.features.map((feature) => (
                      <div key={feature.title} className="preview-feature">
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
