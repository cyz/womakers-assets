import { AppIcon } from './AppIcon'

type PreviewZoomToolbarProps = {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
  onDownload: () => void
  isExporting: boolean
}

export function PreviewZoomToolbar({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onDownload,
  isExporting,
}: PreviewZoomToolbarProps) {
  return (
    <div className="preview-zoom-toolbar" role="toolbar" aria-label="Zoom da preview">
      <button
        type="button"
        className="preview-zoom-btn"
        onClick={onZoomIn}
        disabled={zoom >= 2}
        aria-label="Aproximar"
        title="Aproximar"
      >
        <AppIcon name="zoomIn" />
      </button>
      <button
        type="button"
        className="preview-zoom-btn"
        onClick={onZoomOut}
        disabled={zoom <= 0.4}
        aria-label="Afastar"
        title="Afastar"
      >
        <AppIcon name="zoomOut" />
      </button>
      <button
        type="button"
        className="preview-zoom-btn"
        onClick={onZoomFit}
        aria-label="Ajustar zoom"
        title="Ajustar zoom"
      >
        <AppIcon name="fit" />
      </button>
      <button
        type="button"
        className="preview-zoom-btn"
        onClick={onDownload}
        disabled={isExporting}
        aria-label="Baixar imagem atual"
        title="Baixar imagem atual"
      >
        <AppIcon name="download" />
      </button>
    </div>
  )
}
