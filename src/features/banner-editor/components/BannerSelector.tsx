import { useMemo, useState, type RefObject } from 'react'

import type { BannerOption } from '../model'
import { getBannerOptionGroupLabel, getBannerOptionMenuName } from '../utils'
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

const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function BannerSelector({
  bannerMenuRef,
  groupedBannerOptions,
  hasSelectedBannerOption,
  isBannerMenuOpen,
  selectedBannerOption,
  onSelect,
  onToggle,
}: BannerSelectorProps) {
  const [query, setQuery] = useState('')

  // Clear the search each time the menu opens so it reopens fresh.
  const handleToggle = () => {
    if (!isBannerMenuOpen) {
      setQuery('')
    }
    onToggle()
  }

  const filteredGroups = useMemo(() => {
    const term = normalizeSearch(query)
    if (!term) {
      return groupedBannerOptions
    }

    return groupedBannerOptions
      .map((group) => {
        const groupMatches = normalizeSearch(group.label).includes(term)
        const options = group.options.filter(
          (option) => groupMatches || normalizeSearch(getBannerOptionMenuName(option)).includes(term),
        )
        return { label: group.label, options }
      })
      .filter((group) => group.options.length > 0)
  }, [groupedBannerOptions, query])

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
          onClick={handleToggle}
        >
          <span className="banner-select-value">
            {hasSelectedBannerOption ? (
              <>
                <span className="banner-select-group-name">
                  {getBannerOptionGroupLabel(selectedBannerOption.type)}
                </span>
                <span className="banner-select-option-name">
                  {getBannerOptionMenuName(selectedBannerOption)}
                </span>
              </>
            ) : (
              'Escolha um formato'
            )}
          </span>
          <span className="select-chevron" aria-hidden="true">
            <AppIcon name="chevronDown" />
          </span>
        </button>

        {isBannerMenuOpen ? (
          <div className="banner-select-menu" role="listbox" aria-label="Tipo de banner">
            <div className="banner-select-search">
              <input
                type="text"
                className="banner-select-search-input"
                placeholder="Buscar formato..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
              />
            </div>

            <div className="banner-select-scroll">
              {filteredGroups.length === 0 ? (
                <p className="banner-select-empty">Nenhum formato encontrado.</p>
              ) : (
                filteredGroups.map((group) => (
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
                          <span className="banner-option-name">{getBannerOptionMenuName(option)}</span>
                        </button>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}