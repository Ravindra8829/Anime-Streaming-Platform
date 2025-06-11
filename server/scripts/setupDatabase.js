import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
  try {
    console.log('🔧 Setting up AnimeSugez Database...');

    // Create database if it doesn't exist
    await pool.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✅ Database created/verified');

    // Users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        avatar_url VARCHAR(255),
        bio TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email)
      )
    `);

    // Anime table (for caching and custom data)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS anime (
        id INT PRIMARY KEY AUTO_INCREMENT,
        mal_id INT UNIQUE,
        title VARCHAR(255) NOT NULL,
        title_english VARCHAR(255),
        title_japanese VARCHAR(255),
        image_url VARCHAR(500),
        trailer_url VARCHAR(500),
        synopsis TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        year INT,
        episodes INT DEFAULT 0,
        duration VARCHAR(50),
        status ENUM('Ongoing', 'Completed', 'Upcoming') DEFAULT 'Completed',
        type ENUM('TV', 'Movie', 'OVA', 'Special', 'ONA') DEFAULT 'TV',
        source VARCHAR(100),
        studio VARCHAR(100),
        genres JSON,
        themes JSON,
        demographics JSON,
        view_count INT DEFAULT 0,
        favorite_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_mal_id (mal_id),
        INDEX idx_title (title),
        INDEX idx_rating (rating),
        INDEX idx_year (year),
        INDEX idx_status (status),
        INDEX idx_type (type)
      )
    `);

    // User watchlists
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS watchlists (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        anime_id INT NOT NULL,
        status ENUM('watching', 'completed', 'on_hold', 'dropped', 'plan_to_watch') DEFAULT 'plan_to_watch',
        score INT CHECK (score >= 1 AND score <= 10),
        episodes_watched INT DEFAULT 0,
        start_date DATE,
        finish_date DATE,
        notes TEXT,
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_anime (user_id, anime_id),
        INDEX idx_user_status (user_id, status),
        INDEX idx_anime_status (anime_id, status)
      )
    `);

    // Reviews and ratings
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        anime_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 10),
        title VARCHAR(200),
        content TEXT,
        is_spoiler BOOLEAN DEFAULT FALSE,
        helpful_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (anime_id) REFERENCES anime(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_anime_review (user_id, anime_id),
        INDEX idx_anime_rating (anime_id, rating),
        INDEX idx_user_reviews (user_id),
        INDEX idx_helpful (helpful_count)
      )
    `);

    // Review helpfulness votes
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS review_votes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        review_id INT NOT NULL,
        is_helpful BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_review_vote (user_id, review_id)
      )
    `);

    // User sessions (for JWT blacklisting)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      )
    `);

    // User preferences
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        theme ENUM('light', 'dark', 'auto') DEFAULT 'dark',
        language VARCHAR(10) DEFAULT 'en',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        public_profile BOOLEAN DEFAULT TRUE,
        show_adult_content BOOLEAN DEFAULT FALSE,
        preferred_genres JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preferences (user_id)
      )
    `);

    // Activity logs
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_activity (user_id, created_at),
        INDEX idx_action (action),
        INDEX idx_entity (entity_type, entity_id)
      )
    `);

    console.log('✅ All tables created successfully!');
    console.log('🎉 Database setup completed!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run setup
createTables();