export type AppIconName =
  | 'spark'
  | 'calendar'
  | 'layout'
  | 'swatch'
  | 'text'
  | 'download'
  | 'chevronDown'
  | 'layers'
  | 'refresh'
  | 'undo'
  | 'redo'
  | 'pin'
  | 'image'
  | 'close'
  | 'save'

type AppIconProps = {
  name: AppIconName
  className?: string
}

export function AppIcon({ name, className }: AppIconProps) {
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
    case 'undo':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M10 8 5 12l5 4" />
          <path d="M6 12h8a5 5 0 1 1 0 10h-2" />
        </svg>
      )
    case 'redo':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="m14 8 5 4-5 4" />
          <path d="M18 12h-8a5 5 0 1 0 0 10h2" />
        </svg>
      )
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      )
    case 'image':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 16-5.5-5.5L7 19" />
        </svg>
      )
    case 'close':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </svg>
      )
    case 'save':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v6h8" />
          <path d="M9 20v-6h6v6" />
        </svg>
      )
  }
}