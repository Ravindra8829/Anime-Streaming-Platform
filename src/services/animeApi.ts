import { ApiAnime, Anime } from '../types/anime';

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Rate limiting helper
class RateLimiter {
  private lastRequest = 0;
  private readonly minInterval = 1000; // 1 second between requests

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    
    if (timeSinceLastRequest < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
  }
}

const rateLimiter = new RateLimiter();

// Convert API response to our Anime interface
const convertApiAnimeToAnime = (apiAnime: ApiAnime): Anime => {
  return {
    id: apiAnime.mal_id,
    title: apiAnime.title_english || apiAnime.title,
    image: apiAnime.images.jpg.large_image_url || apiAnime.images.jpg.image_url,
    rating: apiAnime.score || 0,
    year: apiAnime.year || 0,
    episodes: apiAnime.episodes || 0,
    status: mapStatus(apiAnime.status),
    genre: apiAnime.genres.map(g => g.name),
    description: apiAnime.synopsis || 'No description available.',
    views: generateViews(),
    type: mapType(apiAnime.type),
    duration: apiAnime.duration,
    studio: apiAnime.studios[0]?.name,
    malId: apiAnime.mal_id,
    trailer: apiAnime.trailer?.url
  };
};

const mapStatus = (status: string): 'Ongoing' | 'Completed' | 'Upcoming' => {
  switch (status.toLowerCase()) {
    case 'currently airing':
      return 'Ongoing';
    case 'finished airing':
      return 'Completed';
    case 'not yet aired':
      return 'Upcoming';
    default:
      return 'Completed';
  }
};

const mapType = (type: string): 'TV' | 'Movie' | 'OVA' | 'Special' | 'ONA' => {
  switch (type.toLowerCase()) {
    case 'tv':
      return 'TV';
    case 'movie':
      return 'Movie';
    case 'ova':
      return 'OVA';
    case 'special':
      return 'Special';
    case 'ona':
      return 'ONA';
    default:
      return 'TV';
  }
};

const generateViews = (): string => {
  const views = Math.random() * 20 + 1;
  return `${views.toFixed(1)}M`;
};

// API Functions
export const searchAnimeAPI = async (query: string, limit: number = 25): Promise<Anime[]> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=${limit}&order_by=popularity&sort=asc`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.map(convertApiAnimeToAnime);
  } catch (error) {
    console.error('Error searching anime:', error);
    return [];
  }
};

export const getTopAnimeAPI = async (limit: number = 25): Promise<Anime[]> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(
      `${JIKAN_BASE_URL}/top/anime?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.map(convertApiAnimeToAnime);
  } catch (error) {
    console.error('Error fetching top anime:', error);
    return [];
  }
};

export const getSeasonalAnimeAPI = async (year?: number, season?: string): Promise<Anime[]> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const currentYear = year || new Date().getFullYear();
    const currentSeason = season || getCurrentSeason();
    
    const response = await fetch(
      `${JIKAN_BASE_URL}/seasons/${currentYear}/${currentSeason}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.map(convertApiAnimeToAnime);
  } catch (error) {
    console.error('Error fetching seasonal anime:', error);
    return [];
  }
};

export const getAnimeByGenreAPI = async (genreId: number, limit: number = 25): Promise<Anime[]> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(
      `${JIKAN_BASE_URL}/anime?genres=${genreId}&limit=${limit}&order_by=popularity&sort=asc`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data.map(convertApiAnimeToAnime);
  } catch (error) {
    console.error('Error fetching anime by genre:', error);
    return [];
  }
};

export const getAnimeDetailsAPI = async (malId: number): Promise<Anime | null> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(`${JIKAN_BASE_URL}/anime/${malId}/full`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return convertApiAnimeToAnime(data.data);
  } catch (error) {
    console.error('Error fetching anime details:', error);
    return null;
  }
};

export const getRandomAnimeAPI = async (): Promise<Anime | null> => {
  try {
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(`${JIKAN_BASE_URL}/random/anime`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return convertApiAnimeToAnime(data.data);
  } catch (error) {
    console.error('Error fetching random anime:', error);
    return null;
  }
};

// Helper function to get current season
const getCurrentSeason = (): string => {
  const month = new Date().getMonth() + 1;
  
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
};

// Genre mapping for API calls
export const genreMap: { [key: string]: number } = {
  'Action': 1,
  'Adventure': 2,
  'Comedy': 4,
  'Drama': 8,
  'Fantasy': 10,
  'Horror': 14,
  'Mystery': 7,
  'Romance': 22,
  'Sci-Fi': 24,
  'Slice of Life': 36,
  'Sports': 30,
  'Supernatural': 37,
  'Thriller': 41,
  'Military': 38,
  'School': 23,
  'Historical': 13,
  'Music': 19,
  'Psychological': 40,
  'Mecha': 18,
  'Magic': 16
};

// Get suggestions with combined local and API results
export const getAnimeSuggestions = async (query: string): Promise<Anime[]> => {
  if (query.length < 3) return [];
  
  try {
    // Get API results (limited to prevent too many requests)
    const apiResults = await searchAnimeAPI(query, 10);
    
    // Combine and deduplicate results
    const combinedResults = [...apiResults];
    
    // Sort by popularity/rating and return top 8
    return combinedResults
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return [];
  }
};