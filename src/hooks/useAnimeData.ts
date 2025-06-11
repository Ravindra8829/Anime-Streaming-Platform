import { useState, useEffect, useCallback } from 'react';
import { Anime, SearchFilters } from '../types/anime';
import { 
  comprehensiveAnimeDatabase, 
  searchAnime as searchLocal,
  getAnimeByGenre,
  getAnimeByStatus,
  getAnimeByType,
  getAllGenres
} from '../data/animeDatabase';
import { 
  searchAnimeAPI, 
  getTopAnimeAPI, 
  getSeasonalAnimeAPI,
  getAnimeSuggestions 
} from '../services/animeApi';

export const useAnimeData = () => {
  const [animeList, setAnimeList] = useState<Anime[]>(comprehensiveAnimeDatabase);
  const [filteredAnime, setFilteredAnime] = useState<Anime[]>(comprehensiveAnimeDatabase);
  const [suggestions, setSuggestions] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    genre: 'All',
    status: 'All',
    type: 'All',
    year: 'All',
    sortBy: 'Popular'
  });

  // Apply filters and sorting
  const applyFilters = useCallback((animeData: Anime[], currentFilters: SearchFilters) => {
    let filtered = [...animeData];

    // Apply search query
    if (currentFilters.query) {
      const queryLower = currentFilters.query.toLowerCase();
      filtered = filtered.filter(anime =>
        anime.title.toLowerCase().includes(queryLower) ||
        anime.genre.some(g => g.toLowerCase().includes(queryLower)) ||
        anime.studio?.toLowerCase().includes(queryLower)
      );
    }

    // Apply genre filter
    if (currentFilters.genre !== 'All') {
      filtered = filtered.filter(anime => anime.genre.includes(currentFilters.genre));
    }

    // Apply status filter
    if (currentFilters.status !== 'All') {
      filtered = filtered.filter(anime => anime.status === currentFilters.status);
    }

    // Apply type filter
    if (currentFilters.type !== 'All') {
      filtered = filtered.filter(anime => anime.type === currentFilters.type);
    }

    // Apply year filter
    if (currentFilters.year !== 'All') {
      filtered = filtered.filter(anime => anime.year.toString() === currentFilters.year);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (currentFilters.sortBy) {
        case 'Rating':
          return b.rating - a.rating;
        case 'Latest':
          return b.year - a.year;
        case 'A-Z':
          return a.title.localeCompare(b.title);
        case 'Z-A':
          return b.title.localeCompare(a.title);
        case 'Episodes':
          return b.episodes - a.episodes;
        default: // Popular
          return parseFloat(b.views.replace('M', '')) - parseFloat(a.views.replace('M', ''));
      }
    });

    return filtered;
  }, []);

  // Update filtered anime when filters change
  useEffect(() => {
    const filtered = applyFilters(animeList, filters);
    setFilteredAnime(filtered);
  }, [animeList, filters, applyFilters]);

  // Search function that combines local and API results
  const searchAnime = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setAnimeList(comprehensiveAnimeDatabase);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get local results
      const localResults = searchLocal(query);
      
      // Get API results if query is substantial
      let apiResults: Anime[] = [];
      if (query.length >= 3) {
        apiResults = await searchAnimeAPI(query, 20);
      }

      // Combine results, prioritizing local matches
      const combinedResults = [...localResults];
      
      // Add API results that aren't already in local results
      apiResults.forEach(apiAnime => {
        const exists = combinedResults.some(localAnime => 
          localAnime.title.toLowerCase() === apiAnime.title.toLowerCase() ||
          localAnime.malId === apiAnime.malId
        );
        if (!exists) {
          combinedResults.push(apiAnime);
        }
      });

      setAnimeList(combinedResults);
    } catch (err) {
      setError('Failed to search anime. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get suggestions for search autocomplete
  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestionResults = await getAnimeSuggestions(query);
      setSuggestions(suggestionResults);
    } catch (err) {
      console.error('Suggestions error:', err);
      // Fallback to local search
      const localSuggestions = searchLocal(query).slice(0, 5);
      setSuggestions(localSuggestions);
    }
  }, []);

  // Load top anime from API
  const loadTopAnime = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const topAnime = await getTopAnimeAPI(25);
      
      // Combine with local database, avoiding duplicates
      const combined = [...comprehensiveAnimeDatabase];
      topAnime.forEach(apiAnime => {
        const exists = combined.some(localAnime => 
          localAnime.malId === apiAnime.malId ||
          localAnime.title.toLowerCase() === apiAnime.title.toLowerCase()
        );
        if (!exists) {
          combined.push(apiAnime);
        }
      });

      setAnimeList(combined);
    } catch (err) {
      setError('Failed to load top anime.');
      console.error('Top anime error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load seasonal anime
  const loadSeasonalAnime = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const seasonalAnime = await getSeasonalAnimeAPI();
      
      // Combine with local database
      const combined = [...comprehensiveAnimeDatabase];
      seasonalAnime.forEach(apiAnime => {
        const exists = combined.some(localAnime => 
          localAnime.malId === apiAnime.malId ||
          localAnime.title.toLowerCase() === apiAnime.title.toLowerCase()
        );
        if (!exists) {
          combined.push(apiAnime);
        }
      });

      setAnimeList(combined);
    } catch (err) {
      setError('Failed to load seasonal anime.');
      console.error('Seasonal anime error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      query: '',
      genre: 'All',
      status: 'All',
      type: 'All',
      year: 'All',
      sortBy: 'Popular'
    });
    setAnimeList(comprehensiveAnimeDatabase);
  }, []);

  // Get available filter options
  const getFilterOptions = useCallback(() => {
    const genres = ['All', ...getAllGenres()];
    const statuses = ['All', 'Ongoing', 'Completed', 'Upcoming'];
    const types = ['All', 'TV', 'Movie', 'OVA', 'Special', 'ONA'];
    const years = ['All', ...Array.from(new Set(animeList.map(a => a.year.toString()))).sort().reverse()];
    const sortOptions = ['Popular', 'Rating', 'Latest', 'A-Z', 'Z-A', 'Episodes'];

    return { genres, statuses, types, years, sortOptions };
  }, [animeList]);

  return {
    animeList: filteredAnime,
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
  };
};