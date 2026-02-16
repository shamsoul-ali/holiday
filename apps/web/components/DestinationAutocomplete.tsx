'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Loader2 } from 'lucide-react'
import { useDestinationSearch, DestinationResult, UseDestinationSearchOptions } from '../lib/hooks/useDestinationSearch'
import DestinationDropdown from './ui/DestinationDropdown'

export interface DestinationAutocompleteProps {
  value: string
  onChange: (value: string, destination?: DestinationResult) => void
  placeholder?: string
  searchOptions?: UseDestinationSearchOptions
  disabled?: boolean
  className?: string
}

export default function DestinationAutocomplete({
  value,
  onChange,
  placeholder = "e.g., Tokyo, Paris, New York...",
  searchOptions = {},
  disabled = false,
  className = ""
}: DestinationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedDestination, setSelectedDestination] = useState<DestinationResult | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    query,
    setQuery,
    results,
    loading,
    error,
    popularDestinations,
    clearResults,
    selectDestination
  } = useDestinationSearch(searchOptions)

  // Sync external value with internal query
  useEffect(() => {
    if (value !== query) {
      setQuery(value)
    }
  }, [value])

  // Update external onChange when query changes
  useEffect(() => {
    onChange(query, selectedDestination)
  }, [query, selectedDestination])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => document.removeEventListener('keydown', handleEscapeKey)
  }, [isOpen])

  const currentResults = query.trim() ? results : popularDestinations
  const maxIndex = currentResults.length - 1

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setQuery(newValue)
    setSelectedIndex(-1)
    setSelectedDestination(null)
    
    if (!isOpen && newValue.trim()) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (event.key === 'ArrowDown' || event.key === 'Enter') {
        setIsOpen(true)
        event.preventDefault()
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => (prev < maxIndex ? prev + 1 : 0))
        break
      
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : maxIndex))
        break
      
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          handleDestinationSelect(currentResults[selectedIndex])
        }
        break
      
      case 'Tab':
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          event.preventDefault()
          handleDestinationSelect(currentResults[selectedIndex])
        } else {
          setIsOpen(false)
        }
        break
    }
  }

  const handleDestinationSelect = (destination: DestinationResult) => {
    setQuery(destination.name)
    setSelectedDestination(destination)
    setIsOpen(false)
    setSelectedIndex(-1)
    selectDestination(destination)
    inputRef.current?.blur()
  }

  const handleClearInput = () => {
    setQuery('')
    setSelectedDestination(null)
    setSelectedIndex(-1)
    clearResults()
    inputRef.current?.focus()
  }

  const handleMouseEnterItem = (index: number) => {
    setSelectedIndex(index)
  }

  const showClearButton = query.trim().length > 0 && !disabled
  const showSearchIcon = !loading && !showClearButton
  const showDropdown = isOpen && (currentResults.length > 0 || loading || error)

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input Container */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-4 pl-12 pr-12 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {showSearchIcon && <Search className="w-5 h-5 text-gray-400" />}
          {loading && <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />}
        </div>
        
        {/* Right Icons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {showClearButton && (
            <button
              type="button"
              onClick={handleClearInput}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
          
          {selectedDestination && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Destination selected" />
          )}
        </div>

        {/* Input Focus Ring */}
        {isOpen && (
          <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500/30 pointer-events-none" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <DestinationDropdown
          ref={dropdownRef}
          isOpen={isOpen}
          results={results}
          popularDestinations={popularDestinations}
          loading={loading}
          error={error}
          query={query}
          selectedIndex={selectedIndex}
          onSelect={handleDestinationSelect}
          onMouseEnter={handleMouseEnterItem}
        />
      )}

      {/* Screen Reader Announcements */}
      <div className="sr-only" role="status" aria-live="polite">
        {loading && "Searching destinations..."}
        {error && `Error: ${error}`}
        {currentResults.length > 0 && 
          `Found ${currentResults.length} destination${currentResults.length !== 1 ? 's' : ''}. Use arrow keys to navigate.`
        }
      </div>
    </div>
  )
}