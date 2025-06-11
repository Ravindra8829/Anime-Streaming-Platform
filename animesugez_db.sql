-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 11, 2025 at 10:47 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `animesugez_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anime`
--

CREATE TABLE `anime` (
  `id` int(11) NOT NULL,
  `mal_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `title_english` varchar(255) DEFAULT NULL,
  `title_japanese` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(500) DEFAULT NULL,
  `synopsis` text DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT 0.00,
  `year` int(11) DEFAULT NULL,
  `episodes` int(11) DEFAULT 0,
  `duration` varchar(50) DEFAULT NULL,
  `status` enum('Ongoing','Completed','Upcoming') DEFAULT 'Completed',
  `type` enum('TV','Movie','OVA','Special','ONA') DEFAULT 'TV',
  `source` varchar(100) DEFAULT NULL,
  `studio` varchar(100) DEFAULT NULL,
  `genres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`genres`)),
  `themes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`themes`)),
  `demographics` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`demographics`)),
  `view_count` int(11) DEFAULT 0,
  `favorite_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `anime`
--

INSERT INTO `anime` (`id`, `mal_id`, `title`, `title_english`, `title_japanese`, `image_url`, `trailer_url`, `synopsis`, `rating`, `year`, `episodes`, `duration`, `status`, `type`, `source`, `studio`, `genres`, `themes`, `demographics`, `view_count`, `favorite_count`, `created_at`, `updated_at`) VALUES
(1, 16498, 'Attack on Titan', 'Attack on Titan', NULL, 'https://cdn.myanimelist.net/images/anime/10/47347.jpg', NULL, 'Humanity fights for survival against giant humanoid Titans that have brought civilization to the brink of extinction.', 9.00, 2013, 87, NULL, 'Completed', 'TV', NULL, 'Mappa', '[\"Action\",\"Drama\",\"Fantasy\",\"Military\"]', NULL, NULL, 144402, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(2, 38000, 'Demon Slayer: Kimetsu no Yaiba', 'Demon Slayer: Kimetsu no Yaiba', NULL, 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', NULL, 'A young boy becomes a demon slayer to save his sister and avenge his family.', 8.70, 2019, 44, NULL, 'Ongoing', 'TV', NULL, 'Ufotable', '[\"Action\",\"Historical\",\"Supernatural\"]', NULL, NULL, 827616, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(3, 40748, 'Jujutsu Kaisen', 'Jujutsu Kaisen', NULL, 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', NULL, 'Students battle cursed spirits in modern-day Japan using cursed energy.', 8.60, 2020, 24, NULL, 'Ongoing', 'TV', NULL, 'Mappa', '[\"Action\",\"School\",\"Supernatural\"]', NULL, NULL, 346755, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(4, 5114, 'Fullmetal Alchemist: Brotherhood', 'Fullmetal Alchemist: Brotherhood', NULL, 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg', NULL, 'Two brothers search for the Philosopher\'s Stone to restore their bodies.', 9.10, 2009, 64, NULL, 'Completed', 'TV', NULL, 'Bones', '[\"Action\",\"Adventure\",\"Drama\",\"Fantasy\"]', NULL, NULL, 211589, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(5, 1535, 'Death Note', 'Death Note', NULL, 'https://cdn.myanimelist.net/images/anime/9/9453.jpg', NULL, 'A high school student discovers a supernatural notebook that kills anyone whose name is written in it.', 9.00, 2006, 37, NULL, 'Completed', 'TV', NULL, 'Madhouse', '[\"Supernatural\",\"Thriller\",\"Psychological\"]', NULL, NULL, 227193, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `anime_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 10),
  `title` varchar(200) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `is_spoiler` tinyint(1) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `user_id`, `anime_id`, `rating`, `title`, `content`, `is_spoiler`, `helpful_count`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 8, 'Great anime: Attack on Titan', 'This is a sample review for Attack on Titan. Really enjoyed watching this series!', 0, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(2, 2, 5, 8, 'Great anime: Death Note', 'This is a sample review for Death Note. Really enjoyed watching this series!', 0, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(3, 2, 2, 9, 'Great anime: Demon Slayer: Kimetsu no Yaiba', 'This is a sample review for Demon Slayer: Kimetsu no Yaiba. Really enjoyed watching this series!', 0, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `review_id` int(11) NOT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `avatar_url`, `bio`, `is_admin`, `is_verified`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin', 'admin@animesugez.com', '$2a$12$tXGS9ijNQC114gzc93mfGuD/5sV2HhgWkQvHj5JN7ZGc7eiOm6Saq', 'Admin', 'User', NULL, NULL, 1, 1, '2025-06-11 08:45:14', '2025-06-11 08:45:14', NULL),
(2, 'testuser', 'test@animesugez.com', '$2a$12$VUydpfAmxCEUO/LNHFl0keMC1kBatZrUM/s/Nq89y9AMyR1gb5ByK', 'Test', 'User', NULL, NULL, 0, 1, '2025-06-11 08:45:14', '2025-06-11 08:45:14', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `theme` enum('light','dark','auto') DEFAULT 'dark',
  `language` varchar(10) DEFAULT 'en',
  `notifications_enabled` tinyint(1) DEFAULT 1,
  `email_notifications` tinyint(1) DEFAULT 1,
  `public_profile` tinyint(1) DEFAULT 1,
  `show_adult_content` tinyint(1) DEFAULT 0,
  `preferred_genres` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`preferred_genres`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `theme`, `language`, `notifications_enabled`, `email_notifications`, `public_profile`, `show_adult_content`, `preferred_genres`, `created_at`, `updated_at`) VALUES
(1, 1, 'dark', 'en', 1, 1, 1, 0, NULL, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(2, 2, 'dark', 'en', 1, 1, 1, 0, NULL, '2025-06-11 08:45:14', '2025-06-11 08:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `watchlists`
--

CREATE TABLE `watchlists` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `anime_id` int(11) NOT NULL,
  `status` enum('watching','completed','on_hold','dropped','plan_to_watch') DEFAULT 'plan_to_watch',
  `score` int(11) DEFAULT NULL CHECK (`score` >= 1 and `score` <= 10),
  `episodes_watched` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `finish_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `is_favorite` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `watchlists`
--

INSERT INTO `watchlists` (`id`, `user_id`, `anime_id`, `status`, `score`, `episodes_watched`, `start_date`, `finish_date`, `notes`, `is_favorite`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 'watching', 2, 4, NULL, NULL, NULL, 1, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(2, 2, 5, 'on_hold', 6, 22, NULL, NULL, NULL, 1, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(3, 2, 2, 'completed', 4, 21, NULL, NULL, NULL, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(4, 2, 4, 'on_hold', 6, 17, NULL, NULL, NULL, 1, '2025-06-11 08:45:14', '2025-06-11 08:45:14'),
(5, 2, 3, 'plan_to_watch', 10, 14, NULL, NULL, NULL, 0, '2025-06-11 08:45:14', '2025-06-11 08:45:14');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activity` (`user_id`,`created_at`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `anime`
--
ALTER TABLE `anime`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mal_id` (`mal_id`),
  ADD KEY `idx_mal_id` (`mal_id`),
  ADD KEY `idx_title` (`title`),
  ADD KEY `idx_rating` (`rating`),
  ADD KEY `idx_year` (`year`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_anime_review` (`user_id`,`anime_id`),
  ADD KEY `idx_anime_rating` (`anime_id`,`rating`),
  ADD KEY `idx_user_reviews` (`user_id`),
  ADD KEY `idx_helpful` (`helpful_count`);

--
-- Indexes for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_review_vote` (`user_id`,`review_id`),
  ADD KEY `review_id` (`review_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_preferences` (`user_id`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_anime` (`user_id`,`anime_id`),
  ADD KEY `idx_user_status` (`user_id`,`status`),
  ADD KEY `idx_anime_status` (`anime_id`,`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `anime`
--
ALTER TABLE `anime`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `watchlists`
--
ALTER TABLE `watchlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`anime_id`) REFERENCES `anime` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_votes`
--
ALTER TABLE `review_votes`
  ADD CONSTRAINT `review_votes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_votes_ibfk_2` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `watchlists`
--
ALTER TABLE `watchlists`
  ADD CONSTRAINT `watchlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `watchlists_ibfk_2` FOREIGN KEY (`anime_id`) REFERENCES `anime` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
