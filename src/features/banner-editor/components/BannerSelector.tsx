import type { RefObject } from 'react'

import type { BannerOption } from '../model'
import { getBannerOptionGroupLabel, getBannerOptionLabel } from '../utils'
import { AppIcon } from './AppIcon'

type BannerOptionGroup = {
  label: string
  options: BannerOption[]
}

type BannerSelectorProps = {
  bannerMenuRef: RefObject<HTMLDivElement | null>
  groupedBannerOptions: BannerOptionGroup[]
  hasSelectedBannerOption: boolean
  isBannerMenuOpen: boolean
  selectedBannerOption: BannerOption
  onSelect: (option: BannerOption) => void
  onToggle: () => void
}

export function BannerSelector({
  bannerMenuRef,
  groupedBannerOptions,
  hasSelectedBannerOption,
  isBannerMenuOpen,
  selectedBannerOption,
  onSelect,
  onToggle,
}: BannerSelectorProps) {
  return (
    <>
      <label className="field-label" htmlFor="banner-type-trigger">
        Tipo de banner
      </label>
      <div className={`banner-select ${isBannerMenuOpen ? 'is-open' : ''}`} ref={bannerMenuRef}>
        <button
          type="button"
          id="banner-type-trigger"
          className="banner-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={isBannerMenuOpen}
          onClick={onToggle}
        >
          <span className="select-leading-icon" aria-hidden="true">
            <AppIcon name="calendar" />
          </span>
          <span className="banner-select-copy">
            <span className="banner-select-category">
              {hasSelectedBannerOption
                ? getBannerOptionGroupLabel(selectedBannerOption.type)
                : 'Escolha um formato'}
            </span>
            <span className="banner-select-value">
              {hasSelectedBannerOption ? (
                <>
                  {getBannerOptionLabel(
                    selectedBannerOption.type,
                    selectedBannerOption.variation,
                    selectedBannerOption.platform,
                  )}
                  <span className="banner-select-dimensions"> ({selectedBannerOption.dimensions})</span>
                </>
              ) : (
                'Veja todos os tipos na tela inicial e clique para começar.'
              )}
            </span>
          </span>
          <span className="select-chevron" aria-hidden="true">
            <AppIcon name="chevronDown" />
          </span>
        </button>

        {isBannerMenuOpen ? (
          <div className="banner-select-menu" role="listbox" aria-label="Tipo de banner">
            {groupedBannerOptions.map((group) => (
              <div key={group.label} className="banner-select-group">
                <p className="banner-select-group-label">{group.label}</p>
                {group.options.map((option) => {
                  const isSelected = option.id === selectedBannerOption.id

                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`banner-option ${isSelected ? 'is-selected' : ''}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => onSelect(option)}
                    >
                      <span className="banner-option-name">
                        {option.type} · {getBannerOptionLabel(option.type, option.variation, option.platform)}
                      </span>
                      <span className="banner-option-dimensions">({option.dimensions})</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )
}