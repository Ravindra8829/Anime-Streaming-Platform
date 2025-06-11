import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { executeQuery } from '../config/database.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50).optional(),
  lastName: Joi.string().max(50).optional(),
  bio: Joi.string().max(500).optional(),
  avatarUrl: Joi.string().uri().optional()
});

const updatePreferencesSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'auto').optional(),
  language: Joi.string().max(10).optional(),
  notificationsEnabled: Joi.boolean().optional(),
  emailNotifications: Joi.boolean().optional(),
  publicProfile: Joi.boolean().optional(),
  showAdultContent: Joi.boolean().optional(),
  preferredGenres: Joi.array().items(Joi.string()).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// Get user profile
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const isOwnProfile = req.user && req.user.id == id;

    // Get user basic info
    const [users] = await executeQuery(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
              u.avatar_url, u.bio, u.created_at, u.last_login,
              up.public_profile, up.theme, up.language
       FROM users u
       LEFT JOIN user_preferences up ON u.id = up.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Check if profile is public or if it's the user's own profile
    if (!user.public_profile && !isOwnProfile) {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }

    // Get user statistics
    const [stats] = await executeQuery(
      `SELECT 
        COUNT(DISTINCT w.id) as total_anime,
        COUNT(DISTINCT CASE WHEN w.status = 'completed' THEN w.id END) as completed_anime,
        COUNT(DISTINCT CASE WHEN w.status = 'watching' THEN w.id END) as watching_anime,
        COUNT(DISTINCT CASE WHEN w.is_favorite = 1 THEN w.id END) as favorites,
        COUNT(DISTINCT r.id) as reviews_written,
        AVG(w.score) as avg_score,
        SUM(w.episodes_watched) as total_episodes
       FROM users u
       LEFT JOIN watchlists w ON u.id = w.user_id
       LEFT JOIN reviews r ON u.id = r.user_id
       WHERE u.id = ?`,
      [id]
    );

    // Get recent activity (if public or own profile)
    let recentActivity = [];
    if (user.public_profile || isOwnProfile) {
      recentActivity = await executeQuery(
        `SELECT w.status, w.updated_at, a.title, a.image_url, a.id as anime_id
         FROM watchlists w
         JOIN anime a ON w.anime_id = a.id
         WHERE w.user_id = ?
         ORDER BY w.updated_at DESC
         LIMIT 5`,
        [id]
      );
    }

    // Get favorite genres
    const [genreStats] = await executeQuery(
      `SELECT genre, COUNT(*) as count
       FROM (
         SELECT JSON_UNQUOTE(JSON_EXTRACT(a.genres, CONCAT('$[', numbers.n, ']'))) as genre
         FROM anime a
         JOIN watchlists w ON a.id = w.anime_id
         JOIN (SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) numbers
         WHERE w.user_id = ? AND w.status IN ('completed', 'watching')
         AND JSON_UNQUOTE(JSON_EXTRACT(a.genres, CONCAT('$[', numbers.n, ']'))) IS NOT NULL
       ) genre_list
       WHERE genre IS NOT NULL
       GROUP BY genre
       ORDER BY count DESC
       LIMIT 5`,
      [id]
    );

    const responseData = {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        isPublic: user.public_profile
      },
      stats: stats[0],
      recentActivity,
      favoriteGenres: genreStats
    };

    // Add email and preferences for own profile
    if (isOwnProfile) {
      responseData.user.email = user.email;
      responseData.user.preferences = {
        theme: user.theme,
        language: user.language
      };
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { firstName, lastName, bio, avatarUrl } = value;

    await executeQuery(
      `UPDATE users SET 
       first_name = ?, last_name = ?, bio = ?, avatar_url = ?, updated_at = NOW()
       WHERE id = ?`,
      [firstName || null, lastName || null, bio || null, avatarUrl || null, req.user.id]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updatePreferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const {
      theme,
      language,
      notificationsEnabled,
      emailNotifications,
      publicProfile,
      showAdultContent,
      preferredGenres
    } = value;

    await executeQuery(
      `UPDATE user_preferences SET 
       theme = COALESCE(?, theme),
       language = COALESCE(?, language),
       notifications_enabled = COALESCE(?, notifications_enabled),
       email_notifications = COALESCE(?, email_notifications),
       public_profile = COALESCE(?, public_profile),
       show_adult_content = COALESCE(?, show_adult_content),
       preferred_genres = COALESCE(?, preferred_genres),
       updated_at = NOW()
       WHERE user_id = ?`,
      [
        theme, language, notificationsEnabled, emailNotifications,
        publicProfile, showAdultContent, 
        preferredGenres ? JSON.stringify(preferredGenres) : null,
        req.user.id
      ]
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }

    const { currentPassword, newPassword } = value;

    // Get current password hash
    const [users] = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newPasswordHash, req.user.id]
    );

    // Invalidate all user sessions
    await executeQuery(
      'DELETE FROM user_sessions WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// Get user activity
router.get('/:id/activity', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const isOwnProfile = req.user && req.user.id == id;

    // Check if profile is public
    const [users] = await executeQuery(
      'SELECT public_profile FROM user_preferences WHERE user_id = ?',
      [id]
    );

    if (users.length === 0 || (!users[0].public_profile && !isOwnProfile)) {
      return res.status(403).json({
        success: false,
        message: 'Activity is private'
      });
    }

    const activity = await executeQuery(
      `SELECT al.action, al.entity_type, al.entity_id, al.details, al.created_at,
              a.title, a.image_url
       FROM activity_logs al
       LEFT JOIN anime a ON al.entity_type = 'anime' AND al.entity_id = a.id
       WHERE al.user_id = ?
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [id, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: { activity }
    });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user activity'
    });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await executeQuery(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url,
              COUNT(DISTINCT w.id) as anime_count,
              COUNT(DISTINCT r.id) as review_count
       FROM users u
       JOIN user_preferences up ON u.id = up.user_id
       LEFT JOIN watchlists w ON u.id = w.user_id
       LEFT JOIN reviews r ON u.id = r.user_id
       WHERE up.public_profile = 1 
       AND (u.username LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)
       GROUP BY u.id
       ORDER BY anime_count DESC, review_count DESC
       LIMIT ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]
    );

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

export default router;