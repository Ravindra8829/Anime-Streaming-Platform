import express from 'express';
import Joi from 'joi';
import { executeQuery } from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const reviewSchema = Joi.object({
  animeId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(10).required(),
  title: Joi.string().max(200).optional(),
  content: Joi.string().max(5000).optional(),
  isSpoiler: Joi.boolean().optional()
});

// Get reviews for an anime
router.get('/anime/:animeId', optionalAuth, async (req, res) => {
  try {
    const { animeId } = req.params;
    const { page = 1, limit = 10, sort = 'helpful' } = req.query;
    const offset = (page - 1) * limit;

    const sortOptions = {
      'helpful': 'r.helpful_count DESC, r.created_at DESC',
      'newest': 'r.created_at DESC',
      'oldest': 'r.created_at ASC',
      'rating_high': 'r.rating DESC, r.created_at DESC',
      'rating_low': 'r.rating ASC, r.created_at DESC'
    };

    const orderBy = sortOptions[sort] || sortOptions['helpful'];

    const reviews = await executeQuery(
      `SELECT r.*, u.username, u.avatar_url,
              COUNT(rv.id) as vote_count,
              SUM(CASE WHEN rv.is_helpful = 1 THEN 1 ELSE 0 END) as helpful_votes,
              SUM(CASE WHEN rv.is_helpful = 0 THEN 1 ELSE 0 END) as unhelpful_votes
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       LEFT JOIN review_votes rv ON r.id = rv.review_id
       WHERE r.anime_id = ?
       GROUP BY r.id
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [animeId, parseInt(limit), offset]
    );

    // Get user's votes if authenticated
    if (req.user) {
      for (let review of reviews) {
        const [userVote] = await executeQuery(
          'SELECT is_helpful FROM review_votes WHERE user_id = ? AND review_id = ?',
          [req.user.id, review.id]
        );
        review.user_vote = userVote.length > 0 ? userVote[0].is_helpful : null;
      }
    }

    // Get total count
    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM reviews WHERE anime_id = ?',
      [animeId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        reviews,
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
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get user's reviews
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const reviews = await executeQuery(
      `SELECT r.*, a.title, a.title_english, a.image_url, a.year,
              COUNT(rv.id) as vote_count,
              SUM(CASE WHEN rv.is_helpful = 1 THEN 1 ELSE 0 END) as helpful_votes
       FROM reviews r
       JOIN anime a ON r.anime_id = a.id
       LEFT JOIN review_votes rv ON r.id = rv.review_id
       WHERE r.user_id = ?
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM reviews WHERE user_id = ?',
      [userId]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        reviews,
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
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews'
    });
  }
});

// Create review
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { animeId, rating, title, content, isSpoiler } = value;

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

    // Check if user already reviewed this anime
    const [existingReview] = await executeQuery(
      'SELECT id FROM reviews WHERE user_id = ? AND anime_id = ?',
      [req.user.id, animeId]
    );

    if (existingReview.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this anime'
      });
    }

    // Create review
    const result = await executeQuery(
      `INSERT INTO reviews (user_id, anime_id, rating, title, content, is_spoiler)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, animeId, rating, title || null, content || null, isSpoiler || false]
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    });
  }
});

// Update review
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = reviewSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    // Check if review exists and belongs to user
    const [existing] = await executeQuery(
      'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const { rating, title, content, isSpoiler } = value;

    await executeQuery(
      `UPDATE reviews SET 
       rating = ?, title = ?, content = ?, is_spoiler = ?, updated_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [rating, title || null, content || null, isSpoiler || false, id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review'
    });
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery(
      'DELETE FROM reviews WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Vote on review helpfulness
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean'
      });
    }

    // Check if review exists
    const [reviewExists] = await executeQuery(
      'SELECT id, user_id FROM reviews WHERE id = ?',
      [id]
    );

    if (reviewExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Can't vote on own review
    if (reviewExists[0].user_id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot vote on your own review'
      });
    }

    // Check if user already voted
    const [existingVote] = await executeQuery(
      'SELECT id, is_helpful FROM review_votes WHERE user_id = ? AND review_id = ?',
      [req.user.id, id]
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await executeQuery(
        'UPDATE review_votes SET is_helpful = ? WHERE id = ?',
        [isHelpful, existingVote[0].id]
      );
    } else {
      // Create new vote
      await executeQuery(
        'INSERT INTO review_votes (user_id, review_id, is_helpful) VALUES (?, ?, ?)',
        [req.user.id, id, isHelpful]
      );
    }

    // Update helpful count on review
    const [voteCount] = await executeQuery(
      'SELECT SUM(CASE WHEN is_helpful = 1 THEN 1 ELSE -1 END) as helpful_count FROM review_votes WHERE review_id = ?',
      [id]
    );

    await executeQuery(
      'UPDATE reviews SET helpful_count = ? WHERE id = ?',
      [Math.max(0, voteCount[0].helpful_count || 0), id]
    );

    res.json({
      success: true,
      message: 'Vote recorded successfully'
    });

  } catch (error) {
    console.error('Vote on review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote'
    });
  }
});

export default router;