import { useState } from "react";
import { Search, Filter, Calendar, User, MapPin, X } from "lucide-react";

interface SearchFilters {
  query: string;
  type: string;
  dateRange: string;
  sender: string;
  location: string;
  status: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    type: "",
    dateRange: "",
    sender: "",
    location: "",
    status: ""
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: "",
      type: "",
      dateRange: "",
      sender: "",
      location: "",
      status: ""
    });
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Main Search */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj wiadomości..."
            value={filters.query}
            onChange={(e) => setFilters({...filters, query: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Szukaj</span>
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-3 rounded-xl border transition-colors flex items-center space-x-2 ${
            showAdvanced 
              ? "bg-blue-50 border-blue-200 text-blue-700" 
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtry</span>
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ wiadomości
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wszystkie typy</option>
                <option value="Informacja">Informacja</option>
                <option value="Ćwiczenia planowe">Ćwiczenia planowe</option>
                <option value="Pilne wezwanie">Pilne wezwanie</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Okres</span>
                </div>
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wszystkie daty</option>
                <option value="today">Dzisiaj</option>
                <option value="week">Ostatni tydzień</option>
                <option value="month">Ostatni miesiąc</option>
                <option value="year">Ostatni rok</option>
              </select>
            </div>

            {/* Sender Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Nadawca</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="Nazwa nadawcy..."
                value={filters.sender}
                onChange={(e) => setFilters({...filters, sender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>Lokalizacja</span>
                </div>
              </label>
              <input
                type="text"
                placeholder="Miejsce spotkania..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Wszystkie statusy</option>
                <option value="pending">Oczekujące</option>
                <option value="confirmed">Potwierdzone</option>
                <option value="declined">Odrzucone</option>
                <option value="urgent">Pilne</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Wyczyść filtry</span>
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Zastosuj filtry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


