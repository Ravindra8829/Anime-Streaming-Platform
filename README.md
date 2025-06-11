# 🎬 Anime Streaming Platform (Full-Stack Project)

This is a full-stack **Anime Streaming Platform** built with `Node.js`, `Express.js`, and `MySQL`. It includes robust features like user authentication, anime discovery, personal watchlists, reviews, and an admin dashboard.

---

## 📦 Tech Stack

### Backend
- Node.js + Express.js
- MySQL (via XAMPP)
- JWT Authentication
- bcryptjs for password hashing
- Joi for request validation
- CORS + Helmet for security

### Database
- MySQL with 8 core tables:
  - `users`, `anime`, `watchlists`, `reviews`, `user_preferences`, `user_sessions`, `review_votes`, `activity_logs`
- Relationships with foreign keys
- JSON fields for flexible data (genres, themes)

---

## 🚀 Features

- Secure authentication (JWT + bcrypt)
- Anime search, seasonal listings, top-rated view
- Personalized watchlists with stats
- Review system with helpfulness voting
- Admin panel for user/content moderation
- MyAnimeList integration via [Jikan API](https://jikan.moe)

---

## 🛠️ Getting Started

### ✅ Prerequisites

- Node.js (v16+ recommended)
- XAMPP for macOS (includes Apache, MySQL)
- Git
- Code editor (VS Code recommended)

---

## 🖥️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/anime-streaming-platform.git
cd anime-streaming-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` file and update the following:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=animesugez_db

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development

JIKAN_API_BASE_URL=https://api.jikan.moe/v4
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880
```

---

## 🗄️ MySQL Database Setup (XAMPP on macOS)

### Step 1: Start MySQL in XAMPP

- Open **XAMPP Control Panel**
- Click **Start** next to MySQL
- Visit [http://localhost/phpmyadmin](http://localhost/phpmyadmin) to confirm

### Step 2: Create the Database

- In phpMyAdmin, click **New**
- Enter database name: `animesugez_db`
- Choose collation: `utf8mb4_general_ci`
- Click **Create**

### Step 3: Import the SQL File

- Click on `animesugez_db` in the left panel
- Go to the **Import** tab
- Choose the exported `.sql` file your friend shared
- Click **Go** to import the schema and data

---

## 🧪 Initialize the Backend

Run the following commands:

```bash
npm run db:setup       # if needed
npm run db:seed        # optional
npm run dev            # start server
```

---

## 🌐 API Endpoints Overview

### Auth
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Anime
- `GET /api/anime/search`
- `GET /api/anime/top`
- `GET /api/anime/:id`

### Watchlist
- `GET /api/watchlist`
- `POST /api/watchlist`
- `DELETE /api/watchlist/:id`

### Reviews
- `GET /api/reviews/anime/:animeId`
- `POST /api/reviews`
- `POST /api/reviews/:id/vote`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `DELETE /api/admin/reviews/:id`

---

## 🖼️ Frontend Setup (Optional if included)

If your frontend is located in a separate directory (e.g., `client/`), follow these steps:

### 1. Navigate to the Frontend Folder

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the `client/` directory with the following (if needed):

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### 4. Run the Frontend App

```bash
npm start
```

> Accessible at [http://localhost:3000](http://localhost:3000)

---

## 🧰 Development Tips

- Run frontend and backend together:
  ```bash
  # Terminal 1 (root)
  npm run dev

  # Terminal 2 (inside /client)
  npm start
  ```

- Use Postman or Thunder Client to test APIs

---

## 🪛 Troubleshooting

- **MySQL Connection Error (socket error)**  
  Ensure MySQL is running via XAMPP

- **CORS issues**  
  Ensure backend uses `cors` and frontend is pointing to correct API base URL

---

## 🙌 Contributions

Pull requests are welcome. Fork the repo and submit your changes with a clear message.

---

## ✅ To-Do List

- [ ] Email Verification
- [ ] Episode Tracker
- [ ] Dark Mode
- [ ] Admin Analytics
- [ ] Mobile Optimization

---

## 📄 License

Develop by © 2025 Ravindra kumar Suthar
