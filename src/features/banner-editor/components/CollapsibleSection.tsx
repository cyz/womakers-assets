import type { ReactNode } from 'react'
import { AppIcon, type AppIconName } from './AppIcon'

type CollapsibleSectionProps = {
  title: string
  icon?: AppIconName
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function CollapsibleSection({ title, icon, open, onToggle, children }: CollapsibleSectionProps) {
  return (
    <section className={`control-section collapsible-section ${open ? 'is-open' : ''}`.trim()}>
      <button
        type="button"
        className="collapsible-header"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="collapsible-header-label">
          {icon ? (
            <span className="section-icon" aria-hidden="true">
              <AppIcon name={icon} />
            </span>
          ) : null}
          <span className="section-label">{title}</span>
        </span>
        <span className="collapsible-chevron" aria-hidden="true">
          <AppIcon name="chevronDown" />
        </span>
      </button>
      {open ? <div className="collapsible-body">{children}</div> : null}
    </section>
  )
}
