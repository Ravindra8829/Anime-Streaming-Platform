import express from 'express';
import { executeQuery } from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    // Get user statistics
    const [userStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_users_7d,
        COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users
      FROM users
    `);

    // Get anime statistics
    const [animeStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total_anime,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_anime_30d,
        AVG(rating) as avg_rating,
        SUM(view_count) as total_views
      FROM anime
    `);

    // Get review statistics
    const [reviewStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_reviews_30d,
        AVG(rating) as avg_review_rating
      FROM reviews
    `);

    // Get watchlist statistics
    const [watchlistStats] = await executeQuery(`
      SELECT 
        COUNT(*) as total_entries,
        COUNT(CASE WHEN status = 'watching' THEN 1 END) as currently_watching,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorites
      FROM watchlists
    `);

    // Get recent activity
    const recentUsers = await executeQuery(`
      SELECT id, username, email, created_at, last_login, is_verified
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    const recentReviews = await executeQuery(`
      SELECT r.id, r.rating, r.title, r.created_at, u.username, a.title as anime_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN anime a ON r.anime_id = a.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: {
          users: userStats[0],
          anime: animeStats[0],
          reviews: reviewStats[0],
          watchlists: watchlistStats[0]
        },
        recent: {
          users: recentUsers,
          reviews: recentReviews
        }
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (search) {
      whereClause += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status === 'verified') {
      whereClause += ' AND is_verified = 1';
    } else if (status === 'unverified') {
      whereClause += ' AND is_verified = 0';
    } else if (status === 'admin') {
      whereClause += ' AND is_admin = 1';
    }

    const users = await executeQuery(`
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
             u.is_admin, u.is_verified, u.created_at, u.last_login,
             COUNT(DISTINCT w.id) as anime_count,
             COUNT(DISTINCT r.id) as review_count
      FROM users u
      LEFT JOIN watchlists w ON u.id = w.user_id
      LEFT JOIN reviews r ON u.id = r.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user status
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, isAdmin } = req.body;

    const updates = [];
    const params = [];

    if (typeof isVerified === 'boolean') {
      updates.push('is_verified = ?');
      params.push(isVerified);
    }

    if (typeof isAdmin === 'boolean') {
      updates.push('is_admin = ?');
      params.push(isAdmin);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
      });
    }

    params.push(id);

    await executeQuery(`
      UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, params);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const result = await executeQuery('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get all reviews with moderation info
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20, flagged = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    if (flagged === 'true') {
      whereClause = 'WHERE r.helpful_count < -5'; // Reviews with many unhelpful votes
    }

    const reviews = await executeQuery(`
      SELECT r.*, u.username, a.title as anime_title,
             COUNT(rv.id) as vote_count,
             SUM(CASE WHEN rv.is_helpful = 1 THEN 1 ELSE 0 END) as helpful_votes,
             SUM(CASE WHEN rv.is_helpful = 0 THEN 1 ELSE 0 END) as unhelpful_votes
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN anime a ON r.anime_id = a.id
      LEFT JOIN review_votes rv ON r.id = rv.review_id
      ${whereClause}
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const [countResult] = await executeQuery(`
      SELECT COUNT(*) as total FROM reviews r ${whereClause}
    `);

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
    console.error('Admin get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Delete review
router.delete('/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await executeQuery('DELETE FROM reviews WHERE id = ?', [id]);

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
    console.error('Admin delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Get system logs
router.get('/logs', async (req, res) => {
  try {
    const { page = 1, limit = 50, action = '', user_id = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (action) {
      whereClause += ' AND action LIKE ?';
      params.push(`%${action}%`);
    }

    if (user_id) {
      whereClause += ' AND user_id = ?';
      params.push(user_id);
    }

    const logs = await executeQuery(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: { logs }
    });

  } catch (error) {
    console.error('Admin get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs'
    });
  }
});

export default router;