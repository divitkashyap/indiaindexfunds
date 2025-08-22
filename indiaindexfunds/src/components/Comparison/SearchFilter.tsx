import React, { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  options: FilterOption[];
  onSelectionChange: (selectedOptions: FilterOption[]) => void;
  selectedOptions: FilterOption[];
  placeholder?: string;
  multiSelect?: boolean;
  searchable?: boolean;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  options,
  onSelectionChange,
  selectedOptions,
  placeholder = "Search and select...",
  multiSelect = false,
  searchable = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedOptions.some(selected => selected.value === option.value)
      )
    : options.filter(option =>
        !selectedOptions.some(selected => selected.value === option.value)
      );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: FilterOption) => {
    if (multiSelect) {
      onSelectionChange([...selectedOptions, option]);
    } else {
      onSelectionChange([option]);
      setIsOpen(false);
    }
    
    if (searchable) {
      setSearchTerm('');
    }
  };

  const handleRemoveOption = (optionToRemove: FilterOption) => {
    onSelectionChange(selectedOptions.filter(option => option.value !== optionToRemove.value));
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Options Display */}
      {selectedOptions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent rounded-full text-sm"
            >
              <span>{option.label}</span>
              <button
                onClick={() => handleRemoveOption(option)}
                className="text-accent hover:text-white focus:outline-none"
                type="button"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full px-4 py-3 pr-10 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          readOnly={!searchable}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none border-b border-gray-700 last:border-b-0 text-white"
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              {searchTerm ? 'No options found' : 'All options selected'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
