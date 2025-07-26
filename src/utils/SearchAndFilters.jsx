import React from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';

const SearchAndFilters = ({ 
  searchTerm, 
  onSearchChange, 
  filters = [], 
  onFilterChange = () => {},
  showFilters = false,
  onToggleFilters = () => {},
  searchPlaceholder = "Rechercher...",
  className = ""
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {filters.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={onToggleFilters}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Filtres
            </button>
          </div>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters; 