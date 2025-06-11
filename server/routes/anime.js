import express from 'express';
import axios from 'axios';
import { executeQuery } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const JIKAN_BASE_URL = process.env.JIKAN_API_BASE_URL || 'https://api.jikan.moe/v4';

// Rate limiting for external API
let lastApiCall = 0;
const API_DELAY = 1000; // 1 second between calls

const rateLimitedApiCall = async (url) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_DELAY) {
    await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastCall));
  }
  
  lastApiCall = Date.now();
  return axios.get(url);
};

// Search anime
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, limit = 25, page = 1 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Search in local database first
    const localResults = await executeQuery(
      `SELECT a.*, 
              COALESCE(AVG(r.rating), a.rating) as avg_rating,
              COUNT(r.id) as review_count,
              COUNT(w.id) as watchlist_count
       FROM anime a
       LEFT JOIN reviews r ON a.id = r.anime_id
       LEFT JOIN watchlists w ON a.id = w.anime_id
       WHERE a.title LIKE ? OR a.title_english LIKE ? OR a.title_japanese LIKE ?
       GROUP BY a.id
       ORDER BY a.view_count DESC, avg_rating DESC
       LIMIT ?`,
      [`%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit)]
    );

    // If we have enough local results, return them
    if (localResults.length >= 10) {
      return res.json({
        success: true,
        data: {
          anime: localResults.map(formatAnimeResponse),
          pagination: {
            current_page: parseInt(page),
            has_next_page: false,
            total: localResults.length
          }
        }
      });
    }

    // Otherwise, fetch from external API
    const apiResponse = await rateLimitedApiCall(
      `${JIKAN_BASE_URL}/anime?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}&order_by=popularity&sort=asc`
    );

    const apiAnime = apiResponse.data.data;
    
    // Cache API results in database
    for (const anime of apiAnime) {
      await cacheAnimeData(anime);
    }

    // Combine local and API results
    const combinedResults = [...localResults];
    
    for (const apiAnime of apiResponse.data.data) {
      const exists = combinedResults.some(local => local.mal_id === apiAnime.mal_id);
      if (!exists) {
        combinedResults.push(await formatApiAnime(apiAnime));
      }
    }

    res.json({
      success: true,
      data: {
        anime: combinedResults.map(formatAnimeResponse),
        pagination: apiResponse.data.pagination
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
});

// Get top anime
router.get('/top', optionalAuth, async (req, res) => {
  try {
    const { type = 'all', limit = 25, page = 1 } = req.query;

    const apiResponse = await rateLimitedApiCall(
      `${JIKAN_BASE_URL}/top/anime?type=${type}&limit=${limit}&page=${page}`
    );

    // Cache results
    for (const anime of apiResponse.data.data) {
      await cacheAnimeData(anime);
    }

    res.json({
      success: true,
      data: {
        anime: apiResponse.data.data.map(formatApiAnime),
        pagination: apiResponse.data.pagination
      }
    });

  } catch (error) {
    console.error('Top anime error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top anime'
    });
  }
});

// Get seasonal anime
router.get('/seasonal', optionalAuth, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), season = getCurrentSeason() } = req.query;

    const apiResponse = await rateLimitedApiCall(
      `${JIKAN_BASE_URL}/seasons/${year}/${season}`
    );

    // Cache results
    for (const anime of apiResponse.data.data) {
      await cacheAnimeData(anime);
    }

    res.json({
      success: true,
      data: {
        anime: apiResponse.data.data.map(formatApiAnime),
        season: { year: parseInt(year), season }
      }
    });

  } catch (error) {
    console.error('Seasonal anime error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seasonal anime'
    });
  }
});

// Get anime by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isMALId = !isNaN(id);

    let anime;

    if (isMALId) {
      // Try local database first
      const [localResults] = await executeQuery(
        `SELECT a.*, 
                COALESCE(AVG(r.rating), a.rating) as avg_rating,
                COUNT(DISTINCT r.id) as review_count,
                COUNT(DISTINCT w.id) as watchlist_count
         FROM anime a
         LEFT JOIN reviews r ON a.id = r.anime_id
         LEFT JOIN watchlists w ON a.id = w.anime_id
         WHERE a.mal_id = ?
         GROUP BY a.id`,
        [id]
      );

      if (localResults.length > 0) {
        anime = localResults[0];
      } else {
        // Fetch from API
        const apiResponse = await rateLimitedApiCall(`${JIKAN_BASE_URL}/anime/${id}/full`);
        anime = await cacheAnimeData(apiResponse.data.data);
      }
    } else {
      // Database ID
      const [results] = await executeQuery(
        `SELECT a.*, 
                COALESCE(AVG(r.rating), a.rating) as avg_rating,
                COUNT(DISTINCT r.id) as review_count,
                COUNT(DISTINCT w.id) as watchlist_count
         FROM anime a
         LEFT JOIN reviews r ON a.id = r.anime_id
         LEFT JOIN watchlists w ON a.id = w.anime_id
         WHERE a.id = ?
         GROUP BY a.id`,
        [id]
      );

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Anime not found'
        });
      }

      anime = results[0];
    }

    // Increment view count
    await executeQuery(
      'UPDATE anime SET view_count = view_count + 1 WHERE id = ?',
      [anime.id]
    );

    // Get user's watchlist status if authenticated
    let userStatus = null;
    if (req.user) {
      const [watchlistResults] = await executeQuery(
        'SELECT status, score, episodes_watched, is_favorite FROM watchlists WHERE user_id = ? AND anime_id = ?',
        [req.user.id, anime.id]
      );
      
      if (watchlistResults.length > 0) {
        userStatus = watchlistResults[0];
      }
    }

    res.json({
      success: true,
      data: {
        anime: formatAnimeResponse(anime),
        userStatus
      }
    });

  } catch (error) {
    console.error('Get anime error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch anime'
    });
  }
});

// Get anime recommendations
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { id } = req.params;

    const apiResponse = await rateLimitedApiCall(
      `${JIKAN_BASE_URL}/anime/${id}/recommendations`
    );

    res.json({
      success: true,
      data: apiResponse.data.data
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

// Helper functions
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 1 && month <= 3) return 'winter';
  if (month >= 4 && month <= 6) return 'spring';
  if (month >= 7 && month <= 9) return 'summer';
  return 'fall';
};

const cacheAnimeData = async (apiAnime) => {
  try {
    const existingAnime = await executeQuery(
      'SELECT id FROM anime WHERE mal_id = ?',
      [apiAnime.mal_id]
    );

    const animeData = {
      mal_id: apiAnime.mal_id,
      title: apiAnime.title,
      title_english: apiAnime.title_english,
      title_japanese: apiAnime.title_japanese,
      image_url: apiAnime.images?.jpg?.large_image_url || apiAnime.images?.jpg?.image_url,
      trailer_url: apiAnime.trailer?.url,
      synopsis: apiAnime.synopsis,
      rating: apiAnime.score || 0,
      year: apiAnime.year,
      episodes: apiAnime.episodes || 0,
      duration: apiAnime.duration,
      status: mapStatus(apiAnime.status),
      type: apiAnime.type,
      source: apiAnime.source,
      studio: apiAnime.studios?.[0]?.name,
      genres: JSON.stringify(apiAnime.genres?.map(g => g.name) || []),
      themes: JSON.stringify(apiAnime.themes?.map(t => t.name) || []),
      demographics: JSON.stringify(apiAnime.demographics?.map(d => d.name) || [])
    };

    if (existingAnime.length > 0) {
      await executeQuery(
        `UPDATE anime SET 
         title = ?, title_english = ?, title_japanese = ?, image_url = ?, 
         trailer_url = ?, synopsis = ?, rating = ?, year = ?, episodes = ?, 
         duration = ?, status = ?, type = ?, source = ?, studio = ?, 
         genres = ?, themes = ?, demographics = ?, updated_at = NOW()
         WHERE mal_id = ?`,
        [
          animeData.title, animeData.title_english, animeData.title_japanese,
          animeData.image_url, animeData.trailer_url, animeData.synopsis,
          animeData.rating, animeData.year, animeData.episodes, animeData.duration,
          animeData.status, animeData.type, animeData.source, animeData.studio,
          animeData.genres, animeData.themes, animeData.demographics,
          apiAnime.mal_id
        ]
      );
      return { ...animeData, id: existingAnime[0].id };
    } else {
      const result = await executeQuery(
        `INSERT INTO anime (
          mal_id, title, title_english, title_japanese, image_url, trailer_url,
          synopsis, rating, year, episodes, duration, status, type, source,
          studio, genres, themes, demographics
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          animeData.mal_id, animeData.title, animeData.title_english,
          animeData.title_japanese, animeData.image_url, animeData.trailer_url,
          animeData.synopsis, animeData.rating, animeData.year, animeData.episodes,
          animeData.duration, animeData.status, animeData.type, animeData.source,
          animeData.studio, animeData.genres, animeData.themes, animeData.demographics
        ]
      );
      return { ...animeData, id: result.insertId };
    }
  } catch (error) {
    console.error('Cache anime error:', error);
    return apiAnime;
  }
};

const mapStatus = (status) => {
  switch (status?.toLowerCase()) {
    case 'currently airing': return 'Ongoing';
    case 'finished airing': return 'Completed';
    case 'not yet aired': return 'Upcoming';
    default: return 'Completed';
  }
};

const formatApiAnime = (apiAnime) => ({
  id: apiAnime.mal_id,
  mal_id: apiAnime.mal_id,
  title: apiAnime.title,
  title_english: apiAnime.title_english,
  image_url: apiAnime.images?.jpg?.large_image_url || apiAnime.images?.jpg?.image_url,
  rating: apiAnime.score || 0,
  year: apiAnime.year,
  episodes: apiAnime.episodes || 0,
  status: mapStatus(apiAnime.status),
  type: apiAnime.type,
  genres: apiAnime.genres?.map(g => g.name) || [],
  synopsis: apiAnime.synopsis,
  studio: apiAnime.studios?.[0]?.name,
  duration: apiAnime.duration
});

const formatAnimeResponse = (anime) => ({
  id: anime.id,
  mal_id: anime.mal_id,
  title: anime.title,
  title_english: anime.title_english,
  image_url: anime.image_url,
  rating: parseFloat(anime.avg_rating || anime.rating || 0),
  year: anime.year,
  episodes: anime.episodes,
  status: anime.status,
  type: anime.type,
  genres: typeof anime.genres === 'string' ? JSON.parse(anime.genres) : anime.genres || [],
  synopsis: anime.synopsis,
  studio: anime.studio,
  duration: anime.duration,
  view_count: anime.view_count || 0,
  review_count: anime.review_count || 0,
  watchlist_count: anime.watchlist_count || 0
});

export default router;