import express from 'express';
import Joi from 'joi';
import { executeQuery } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All watchlist routes require authentication
router.use(authenticateToken);

// Validation schemas
const watchlistSchema = Joi.object({
  animeId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch').required(),
  score: Joi.number().integer().min(1).max(10).optional(),
  episodesWatched: Joi.number().integer().min(0).optional(),
  startDate: Joi.date().optional(),
  finishDate: Joi.date().optional(),
  notes: Joi.string().max(1000).optional(),
  isFavorite: Joi.boolean().optional()
});

// Get user's watchlist
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = 'updated_at' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE w.user_id = ?';
    let params = [req.user.id];

    if (status && status !== 'all') {
      whereClause += ' AND w.status = ?';
      params.push(status);
    }

    const sortOptions = {
      'updated_at': 'w.updated_at DESC',
      'title': 'a.title ASC',
      'rating': 'w.score DESC, a.rating DESC',
      'year': 'a.year DESC',
      'episodes': 'a.episodes DESC'
    };

    const orderBy = sortOptions[sort] || sortOptions['updated_at'];

    const watchlist = await executeQuery(
      `SELECT w.*, a.title, a.title_english, a.image_url, a.rating, a.year, 
              a.episodes, a.status as anime_status, a.type, a.genres, a.studio
       FROM watchlists w
       JOIN anime a ON w.anime_id = a.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM watchlists w ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        watchlist: watchlist.map(item => ({
          ...item,
          genres: typeof item.genres === 'string' ? JSON.parse(item.genres) : item.genres || []
        })),
        pagination: {
          current_page: parseInt(page),
          total_pages: totalPages,
          total_items: total,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist'
    });
  }
});

// Add anime to watchlist
router.post('/', async (req, res) => {
  try {
    const { error, value } = watchlistSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      animeId,
      status,
      score,
      episodesWatched,
      startDate,
      finishDate,
      notes,
      isFavorite
    } = value;

    // Check if anime exists
    const [animeExists] = await executeQuery(
      'SELECT id FROM anime WHERE id = ?',
      [animeId]
    );

    if (animeExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Anime not found'
      });
    }

    // Check if already in watchlist
    const [existing] = await executeQuery(
      'SELECT id FROM watchlists WHERE user_id = ? AND anime_id = ?',
      [req.user.id, animeId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Anime already in watchlist'
      });
    }

    // Add to watchlist
    const result = await executeQuery(
      `INSERT INTO watchlists (
        user_id, anime_id, status, score, episodes_watched, 
        start_date, finish_date, notes, is_favorite
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, animeId, status, score || null, episodesWatched || 0,
        startDate || null, finishDate || null, notes || null, isFavorite || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Anime added to watchlist',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add anime to watchlist'
    });
  }
});

// Update watchlist entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = watchlistSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if entry exists and belongs to user
    const [existing] = await executeQuery(
      'SELECT id FROM watchlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist entry not found'
      });
    }

    const {
      status,
      score,
      episodesWatched,
      startDate,
      finishDate,
      notes,
      isFavorite
    } = value;

    await executeQuery(
      `UPDATE watchlists SET 
       status = ?, score = ?, episodes_watched = ?, start_date = ?, 
       finish_date = ?, notes = ?, is_favorite = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [
        status, score || null, episodesWatched || 0, startDate || null,
        finishDate || null, notes || null, isFavorite || false, id, req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'Watchlist entry updated'
    });

  } catch (error) {
    console.error('Update watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update watchlist entry'
    });
  }
});

// Remove from watchlist
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'DELETE FROM watchlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist entry not found'
      });
    }

    res.json({
      success: true,
      message: 'Anime removed from watchlist'
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove anime from watchlist'
    });
  }
});

// Get watchlist statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await executeQuery(
      `SELECT 
        status,
        COUNT(*) as count,
        AVG(score) as avg_score,
        SUM(episodes_watched) as total_episodes
       FROM watchlists 
       WHERE user_id = ? 
       GROUP BY status`,
      [req.user.id]
    );

    const [totalStats] = await executeQuery(
      `SELECT 
        COUNT(*) as total_anime,
        COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites,
        AVG(score) as overall_avg_score,
        SUM(episodes_watched) as total_episodes_watched
       FROM watchlists 
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        by_status: stats,
        overall: totalStats[0]
      }
    });

  } catch (error) {
    console.error('Get watchlist stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch watchlist statistics'
    });
  }
});

// Get favorites
router.get('/favorites', async (req, res) => {
  try {
    const favorites = await executeQuery(
      `SELECT w.*, a.title, a.title_english, a.image_url, a.rating, a.year, 
              a.episodes, a.status as anime_status, a.type, a.genres, a.studio
       FROM watchlists w
       JOIN anime a ON w.anime_id = a.id
       WHERE w.user_id = ? AND w.is_favorite = 1
       ORDER BY w.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        favorites: favorites.map(item => ({
          ...item,
          genres: typeof item.genres === 'string' ? JSON.parse(item.genres) : item.genres || []
        }))
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites'
    });
  }
});

export default router;