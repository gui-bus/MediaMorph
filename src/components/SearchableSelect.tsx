import React, { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  desc?: string
  badge?: string
  category?: string
  icon?: React.ReactNode
}

interface SearchableSelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.desc && opt.desc.toLowerCase().includes(search.toLowerCase())) ||
      (opt.badge && opt.badge.toLowerCase().includes(search.toLowerCase())) ||
      (opt.category && opt.category.toLowerCase().includes(search.toLowerCase()))
  )

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }, [isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    }
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} onKeyDown={handleKeyDown}>
      {label && <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen)
        }}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all text-left bg-background/90 ${
          isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
            : 'border-border hover:border-gray-400 dark:hover:border-gray-500 hover:bg-surface'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <div className="truncate">
            <span className="text-gray-900 dark:text-gray-100 font-semibold">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.desc && (
              <span className="text-gray-500 dark:text-gray-400 text-[11px] ml-2 hidden sm:inline truncate">
                • {selectedOption.desc}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption?.badge && (
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-gray-600 dark:text-gray-400">
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-500' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-72 flex flex-col">

          <div className="p-2.5 border-b border-border bg-background/60 flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar opções..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30 max-h-56">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-gray-900 dark:text-white font-medium'
                        : 'hover:bg-surface-hover text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold">{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-background border border-border text-gray-600 dark:text-gray-400">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        {opt.desc && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{opt.desc}</p>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                  </button>
                )
              })
            ) : (
              <div className="py-6 text-center text-xs text-gray-500">
                Nenhum formato encontrado para "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
