import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding AnimeSugez Database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    await pool.execute(`
      INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, is_admin, is_verified)
      VALUES ('admin', 'admin@animesugez.com', ?, 'Admin', 'User', TRUE, TRUE)
    `, [adminPassword]);

    // Create test user
    const testPassword = await bcrypt.hash('test123', 12);
    await pool.execute(`
      INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, is_verified)
      VALUES ('testuser', 'test@animesugez.com', ?, 'Test', 'User', TRUE)
    `, [testPassword]);

    // Get user IDs
    const [adminUser] = await pool.execute('SELECT id FROM users WHERE username = "admin"');
    const [testUser] = await pool.execute('SELECT id FROM users WHERE username = "testuser"');

    const adminId = adminUser[0].id;
    const testUserId = testUser[0].id;

    // Create user preferences
    await pool.execute(`
      INSERT IGNORE INTO user_preferences (user_id, theme, public_profile)
      VALUES (?, 'dark', TRUE), (?, 'dark', TRUE)
    `, [adminId, testUserId]);

    // Sample anime data (from your existing database)
    const sampleAnime = [
      {
        mal_id: 16498,
        title: 'Attack on Titan',
        title_english: 'Attack on Titan',
        image_url: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg',
        synopsis: 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.',
        rating: 9.0,
        year: 2013,
        episodes: 87,
        status: 'Completed',
        type: 'TV',
        studio: 'Mappa',
        genres: JSON.stringify(['Action', 'Drama', 'Fantasy', 'Military'])
      },
      {
        mal_id: 38000,
        title: 'Demon Slayer: Kimetsu no Yaiba',
        title_english: 'Demon Slayer: Kimetsu no Yaiba',
        image_url: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg',
        synopsis: 'A young boy becomes a demon slayer to save his sister and avenge his family.',
        rating: 8.7,
        year: 2019,
        episodes: 44,
        status: 'Ongoing',
        type: 'TV',
        studio: 'Ufotable',
        genres: JSON.stringify(['Action', 'Historical', 'Supernatural'])
      },
      {
        mal_id: 40748,
        title: 'Jujutsu Kaisen',
        title_english: 'Jujutsu Kaisen',
        image_url: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg',
        synopsis: 'Students battle cursed spirits in modern-day Japan using cursed energy.',
        rating: 8.6,
        year: 2020,
        episodes: 24,
        status: 'Ongoing',
        type: 'TV',
        studio: 'Mappa',
        genres: JSON.stringify(['Action', 'School', 'Supernatural'])
      },
      {
        mal_id: 5114,
        title: 'Fullmetal Alchemist: Brotherhood',
        title_english: 'Fullmetal Alchemist: Brotherhood',
        image_url: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg',
        synopsis: 'Two brothers search for the Philosopher\'s Stone to restore their bodies.',
        rating: 9.1,
        year: 2009,
        episodes: 64,
        status: 'Completed',
        type: 'TV',
        studio: 'Bones',
        genres: JSON.stringify(['Action', 'Adventure', 'Drama', 'Fantasy'])
      },
      {
        mal_id: 1535,
        title: 'Death Note',
        title_english: 'Death Note',
        image_url: 'https://cdn.myanimelist.net/images/anime/9/9453.jpg',
        synopsis: 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.',
        rating: 9.0,
        year: 2006,
        episodes: 37,
        status: 'Completed',
        type: 'TV',
        studio: 'Madhouse',
        genres: JSON.stringify(['Supernatural', 'Thriller', 'Psychological'])
      }
    ];

    // Insert sample anime
    for (const anime of sampleAnime) {
      await pool.execute(`
        INSERT IGNORE INTO anime (
          mal_id, title, title_english, image_url, synopsis, rating, year, 
          episodes, status, type, studio, genres, view_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        anime.mal_id, anime.title, anime.title_english, anime.image_url,
        anime.synopsis, anime.rating, anime.year, anime.episodes,
        anime.status, anime.type, anime.studio, anime.genres,
        Math.floor(Math.random() * 1000000) + 100000 // Random view count
      ]);
    }

    // Get anime IDs for sample data
    const [animeList] = await pool.execute('SELECT id, title FROM anime LIMIT 5');

    // Add sample watchlist entries
    for (let i = 0; i < animeList.length; i++) {
      const anime = animeList[i];
      const statuses = ['watching', 'completed', 'plan_to_watch', 'on_hold'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const score = Math.floor(Math.random() * 10) + 1;
      
      await pool.execute(`
        INSERT IGNORE INTO watchlists (user_id, anime_id, status, score, episodes_watched, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        testUserId, anime.id, status, score, 
        Math.floor(Math.random() * 24) + 1,
        Math.random() > 0.7
      ]);
    }

    // Add sample reviews
    for (let i = 0; i < 3; i++) {
      const anime = animeList[i];
      await pool.execute(`
        INSERT IGNORE INTO reviews (user_id, anime_id, rating, title, content, is_spoiler)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        testUserId, anime.id, Math.floor(Math.random() * 10) + 1,
        `Great anime: ${anime.title}`,
        `This is a sample review for ${anime.title}. Really enjoyed watching this series!`,
        false
      ]);
    }

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin user: admin@animesugez.com / admin123');
    console.log('👤 Test user: test@animesugez.com / test123');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run seeding
seedDatabase();