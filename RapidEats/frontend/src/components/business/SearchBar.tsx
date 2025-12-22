import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export interface SearchSuggestion {
  type: 'restaurant' | 'product' | 'category';
  id: string;
  name: string;
  image?: string;
  restaurant?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar restaurantes, platos...',
  onSearch,
  onSuggestionClick,
  suggestions = [],
  loading = false,
  className,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveToHistory(query);
      onSearch(query);
      setIsFocused(false);
    }
  };

  const saveToHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    saveToHistory(suggestion.name);
    onSuggestionClick?.(suggestion);
    setQuery('');
    setIsFocused(false);

    // Navigate based on type
    if (suggestion.type === 'restaurant') {
      navigate(`/restaurant/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/restaurants?category=${suggestion.id}`);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    onSearch(historyQuery);
    setIsFocused(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const showDropdown = isFocused && (query.length > 0 || searchHistory.length > 0);

  return (
    <div ref={searchRef} className={clsx('relative', className)}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[var(--rapid-green)] focus:outline-none transition-colors text-gray-900 placeholder-gray-400"
          />

          {/* Clear/Loading Button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <svg
                  className="w-5 h-5 text-[var(--rapid-green)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </motion.div>
            ) : (
              query && (
                <motion.button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XMarkIcon className="w-5 h-5" />
                </motion.button>
              )
            )}
          </div>
        </div>
      </form>

      {/* Dropdown with Suggestions */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Search Results */}
            {query.length > 0 && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Sugerencias
                </div>
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    {suggestion.image ? (
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                        {suggestion.type === 'restaurant' ? '🏪' : suggestion.type === 'product' ? '🍽️' : '📂'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.name}
                      </div>
                      {suggestion.restaurant && (
                        <div className="text-sm text-gray-500 truncate">
                          {suggestion.restaurant}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && suggestions.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-gray-500">
                No se encontraron resultados para "{query}"
              </div>
            )}

            {/* Search History */}
            {query.length === 0 && searchHistory.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Búsquedas recientes
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-[var(--rapid-green)] hover:text-[var(--rapid-green-hover)] font-medium"
                  >
                    Limpiar
                  </button>
                </div>
                {searchHistory.map((historyQuery, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleHistoryClick(historyQuery)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                    whileHover={{ x: 4 }}
                  >
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{historyQuery}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
