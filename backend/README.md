# India Index Funds - Backend API

Backend server for managing YouTube videos in the India Index Funds application.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Database Setup
Install PostgreSQL locally:
```bash
# macOS (with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb indiaindexfunds_youtube
```

### 3. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Initialize Database
```bash
npm run db:setup
```

### 5. Start Development Server
```bash
npm run dev
```

## 📚 API Endpoints

### Videos
- `GET /api/videos` - Get all videos (with pagination)
- `GET /api/videos/:videoId` - Get specific video
- `POST /api/videos` - Save new video (used by N8N)
- `DELETE /api/videos/:videoId` - Delete video

### Health Check
- `GET /health` - Server health status

## 🔧 Environment Variables

```env
# Database
PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=indiaindexfunds_youtube
PG_PASSWORD=your_postgres_password
PG_PORT=5432

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## 🔄 N8N Integration

This server is designed to work with N8N workflows. The N8N workflow should:

1. **Trigger**: YouTube RSS feed or API polling
2. **Process**: Extract video metadata
3. **Send**: POST request to `/api/videos` endpoint

### N8N Webhook Configuration:
- **URL**: `http://localhost:5000/api/videos`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`

### Expected JSON payload:
```json
{
  "video_id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "description": "Video description...",
  "thumbnail_url": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "published_at": "2024-01-15T10:30:00Z",
  "duration": "PT15M20S",
  "view_count": 150000,
  "like_count": 5200,
  "channel_title": "Channel Name"
}
```

## 🗄️ Database Schema

The `videos` table includes:
- **video_id**: Unique YouTube video ID
- **title**: Video title
- **description**: Video description
- **thumbnail_url**: Video thumbnail URL
- **published_at**: When video was published
- **duration**: Video duration in seconds
- **view_count, like_count**: Video statistics
- **channel_title**: YouTube channel name
- **created_at, updated_at**: Database timestamps

## 🔨 Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
npm start
```

### Database operations:
```bash
npm run db:setup    # Setup database schema
npm run db:migrate  # Run migrations (if any)
```

## 🐛 Troubleshooting

### Database Connection Issues:
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database exists: `createdb indiaindexfunds_youtube`

### Port Conflicts:
- Change `PORT` in `.env` if 5000 is in use
- Update CORS `FRONTEND_URL` if React app runs on different port

### N8N Integration Issues:
1. Check N8N webhook URL points to correct endpoint
2. Verify JSON payload structure matches expected format
3. Check server logs for incoming requests
