import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Star, Calendar, Eye, Menu, X, Filter, ChevronDown, TrendingUp, Clock, Award } from 'lucide-react';
import { useAnimeData } from './hooks/useAnimeData';
import { comprehensiveAnimeDatabase } from './data/animeDatabase';

function App() {
  const {
    animeList,
    suggestions,
    loading,
    error,
    filters,
    searchAnime,
    getSuggestions,
    loadTopAnime,
    loadSeasonalAnime,
    updateFilters,
    clearFilters,
    getFilterOptions
  } = useAnimeData();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const { genres, statuses, types, years, sortOptions } = getFilterOptions();

  // Hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % Math.min(comprehensiveAnimeDatabase.length, 10));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Click outside handler for search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node) &&
          mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentHeroAnime = comprehensiveAnimeDatabase[currentHeroIndex];

  const handleSearchChange = async (value: string) => {
    updateFilters({ query: value });
    
    if (value.length >= 3) {
      await getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    if (value.length >= 2) {
      await searchAnime(value);
    }
  };

  const handleSuggestionClick = (title: string) => {
    updateFilters({ query: title });
    setShowSuggestions(false);
    searchAnime(title);
  };

  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);
    
    switch (tab) {
      case 'top':
        await loadTopAnime();
        break;
      case 'seasonal':
        await loadSeasonalAnime();
        break;
      default:
        clearFilters();
        break;
    }
  };

  const SearchInput = ({ isMobile = false }) => (
    <div className={`relative ${isMobile ? 'w-full' : 'w-64'}`} ref={isMobile ? mobileSearchRef : searchRef}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder="Search anime..."
        value={filters.query}
        onChange={(e) => handleSearchChange(e.target.value)}
        onFocus={() => filters.query.length >= 3 && setShowSuggestions(true)}
        className={`${
          isMobile 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-800 border-gray-700'
        } border rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-400`}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute top-full left-0 right-0 mt-1 ${
          isMobile ? 'bg-gray-700 border-gray-600' : 'bg-gray-800 border-gray-700'
        } border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto`}>
          {suggestions.map((anime) => (
            <button
              key={anime.id}
              onClick={() => handleSuggestionClick(anime.title)}
              className={`w-full text-left px-4 py-3 ${
                isMobile ? 'hover:bg-gray-600' : 'hover:bg-gray-700'
              } transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg`}
            >
              <img
                src={anime.image}
                alt={anime.title}
                className="w-12 h-16 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/48x64/374151/9CA3AF?text=No+Image';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{anime.title}</div>
                <div className="text-gray-400 text-sm">
                  {anime.year} • {anime.genre.slice(0, 2).join(', ')}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span>{anime.rating}</span>
                  </span>
                  <span>•</span>
                  <span>{anime.type}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Play className="w-8 h-8 text-purple-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  AnimeSugez
                </span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button 
                  onClick={() => handleTabChange('all')}
                  className={`${activeTab === 'all' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors flex items-center space-x-1`}
                >
                  <span>All Anime</span>
                </button>
                <button 
                  onClick={() => handleTabChange('top')}
                  className={`${activeTab === 'top' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors flex items-center space-x-1`}
                >
                  <Award className="w-4 h-4" />
                  <span>Top Rated</span>
                </button>
                <button 
                  onClick={() => handleTabChange('seasonal')}
                  className={`${activeTab === 'seasonal' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors flex items-center space-x-1`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Seasonal</span>
                </button>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <SearchInput />
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-3 space-y-3">
              <SearchInput isMobile />
              <nav className="flex flex-col space-y-2">
                <button 
                  onClick={() => {
                    handleTabChange('all');
                    setIsMenuOpen(false);
                  }}
                  className={`${activeTab === 'all' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors py-2 text-left`}
                >
                  All Anime
                </button>
                <button 
                  onClick={() => {
                    handleTabChange('top');
                    setIsMenuOpen(false);
                  }}
                  className={`${activeTab === 'top' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors py-2 text-left flex items-center space-x-2`}
                >
                  <Award className="w-4 h-4" />
                  <span>Top Rated</span>
                </button>
                <button 
                  onClick={() => {
                    handleTabChange('seasonal');
                    setIsMenuOpen(false);
                  }}
                  className={`${activeTab === 'seasonal' ? 'text-white' : 'text-gray-300'} hover:text-purple-400 transition-colors py-2 text-left flex items-center space-x-2`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Seasonal</span>
                </button>
                <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors py-2 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending</span>
                </a>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10"></div>
        <img
          src={currentHeroAnime.image}
          alt={currentHeroAnime.title}
          className="w-full h-full object-cover transition-all duration-1000"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/1920x500/374151/9CA3AF?text=Hero+Image';
          }}
        />
        <div className="absolute inset-0 z-20 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {currentHeroAnime.title}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                {currentHeroAnime.description}
              </p>
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-semibold">{currentHeroAnime.rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{currentHeroAnime.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <span>{currentHeroAnime.views}</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Now</span>
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Add to List
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {comprehensiveAnimeDatabase.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentHeroIndex ? 'bg-purple-500' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-semibold">Advanced Filters</span>
              {loading && (
                <div className="flex items-center space-x-2 text-purple-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                  <span className="text-sm">Loading...</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="md:hidden flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>{isFiltersOpen ? 'Hide' : 'Show'} Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-6 gap-4 ${isFiltersOpen ? 'block' : 'hidden md:grid'}`}>
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
              <select
                value={filters.genre}
                onChange={(e) => updateFilters({ genre: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
              <select
                value={filters.year}
                onChange={(e) => updateFilters({ year: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            {filters.query ? `Search Results for "${filters.query}" (${animeList.length})` : 
             activeTab === 'top' ? `Top Rated Anime (${animeList.length})` :
             activeTab === 'seasonal' ? `Seasonal Anime (${animeList.length})` :
             `${filters.sortBy} Anime (${animeList.length})`}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {animeList.map((anime) => (
            <div
              key={anime.id}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg">
                <img
                  src={anime.image}
                  alt={anime.title}
                  className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x400/374151/9CA3AF?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    anime.status === 'Ongoing' ? 'bg-green-600' : 
                    anime.status === 'Upcoming' ? 'bg-yellow-600' : 'bg-blue-600'
                  }`}>
                    {anime.status}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-600">
                    {anime.type}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold">{anime.rating}</span>
                    </div>
                    <span className="text-xs text-gray-300">{anime.episodes} eps</span>
                  </div>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold transition-colors flex items-center justify-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Watch</span>
                  </button>
                </div>
              </div>
              <div className="pt-3">
                <h3 className="font-semibold text-sm md:text-base leading-tight mb-1 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {anime.title}
                </h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {anime.genre.slice(0, 2).map((g) => (
                    <span key={g} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{anime.year}</span>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{anime.views}</span>
                  </div>
                </div>
                {anime.studio && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {anime.studio}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {animeList.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {filters.query ? 'No anime found matching your search criteria' : 'No anime found matching your filters'}
            </div>
            <button
              onClick={clearFilters}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Play className="w-6 h-6 text-purple-500" />
                <span className="text-lg font-bold">AnimeSugez</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your ultimate destination for discovering and watching anime. Explore thousands of titles with real-time data from MyAnimeList.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Browse</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => handleTabChange('all')} className="hover:text-purple-400 transition-colors">All Anime</button></li>
                <li><button onClick={() => handleTabChange('top')} className="hover:text-purple-400 transition-colors">Top Rated</button></li>
                <li><button onClick={() => handleTabChange('seasonal')} className="hover:text-purple-400 transition-colors">Seasonal</button></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Random</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Genres</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => updateFilters({ genre: 'Action' })} className="hover:text-purple-400 transition-colors">Action</button></li>
                <li><button onClick={() => updateFilters({ genre: 'Adventure' })} className="hover:text-purple-400 transition-colors">Adventure</button></li>
                <li><button onClick={() => updateFilters({ genre: 'Romance' })} className="hover:text-purple-400 transition-colors">Romance</button></li>
                <li><button onClick={() => updateFilters({ genre: 'Comedy' })} className="hover:text-purple-400 transition-colors">Comedy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Data Source</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">MyAnimeList</a></li>
                <li><a href="https://jikan.moe" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">Jikan API</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AnimeSugez. All rights reserved. Powered by MyAnimeList & Jikan API. Made with ❤️ for anime fans worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;