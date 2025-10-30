# 🎥 YouTube Videos Integration Setup

This guide explains how to set up the complete YouTube video management system with backend database storage.

## 📁 Project Structure

```
indiaindexfunds/
├── 📁 indiaindexfunds/          # Frontend (React)
│   ├── src/components/YouTubeVideos.tsx
│   ├── .env.example
│   └── package.json
├── 📁 backend/                  # Backend (Express + PostgreSQL)
│   ├── server.ts
│   ├── database/schema.sql
│   ├── scripts/setup-database.js
│   ├── .env.example
│   └── package.json
└── README-YOUTUBE-SETUP.md      # This file
```

## 🚀 Complete Setup Process

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Setup database
npm run db:setup

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd ../indiaindexfunds

# Create environment file
cp .env.example .env
# Add: REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm run dev
```

### 3. Database Setup Details

**Install PostgreSQL:**
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb indiaindexfunds_youtube

# Set up user (optional)
psql postgres
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE indiaindexfunds_youtube TO your_user;
```

## 🔄 Integration Options

### Option A: N8N Automation (Recommended)

**N8N Workflow:**
1. **Trigger**: YouTube RSS feed polling
2. **Process**: Extract video metadata
3. **Send**: POST to `http://localhost:5000/api/videos`

**N8N Node Configuration:**
- **HTTP Request Node**
- **URL**: `http://localhost:5000/api/videos`
- **Method**: `POST`
- **Body**: JSON with video data

### Option B: Direct API Integration

If you prefer to use YouTube API directly from frontend:

```typescript
// Use the original YouTubeVideos component
// Set REACT_APP_YOUTUBE_API_KEY in .env
```

### Option C: Hybrid Approach

- Use N8N for background video collection
- Use direct API for real-time updates
- Backend serves as cache and storage

## 📊 API Endpoints

### Backend API

```bash
GET  /api/videos          # Get all videos
GET  /api/videos/:id      # Get specific video
POST /api/videos          # Add new video (N8N uses this)
DELETE /api/videos/:id    # Delete video
GET  /health              # Server status
```

### Example API Usage

```javascript
// Fetch videos from backend
const response = await fetch('http://localhost:5000/api/videos');
const data = await response.json();
console.log(data.videos);

// Add new video (N8N does this)
await fetch('http://localhost:5000/api/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    video_id: 'dQw4w9WgXcQ',
    title: 'Video Title',
    description: 'Description...',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    published_at: '2024-01-15T10:30:00Z',
    view_count: 150000,
    like_count: 5200,
    channel_title: 'Channel Name'
  })
});
```

## 🔧 Environment Variables

### Backend (.env)
```env
PG_USER=your_postgres_username
PG_HOST=localhost
PG_DATABASE=indiaindexfunds_youtube
PG_PASSWORD=your_postgres_password
PG_PORT=5432
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Test database connection
psql -U your_user -d indiaindexfunds_youtube -c "SELECT COUNT(*) FROM videos;"

# Check backend logs
npm run dev  # Look for connection errors
```

### Frontend Issues
```bash
# Check if backend is running
curl http://localhost:5000/health

# Test API connection
curl http://localhost:5000/api/videos
```

### N8N Integration Issues
1. Verify N8N webhook URL: `http://localhost:5000/api/videos`
2. Check request payload format matches expected schema
3. Monitor backend logs for incoming requests

## 📈 Next Steps

1. **Production Deployment**:
   - Deploy backend to Heroku/Railway/DigitalOcean
   - Use managed PostgreSQL (AWS RDS, etc.)
   - Update frontend API_URL to production backend

2. **Enhanced Features**:
   - Add video categories/tags
   - Implement search functionality
   - Add video favorites/bookmarks
   - Video analytics and statistics

3. **N8N Enhancements**:
   - Multiple channel monitoring
   - Scheduled data updates
   - Video metadata enrichment
   - Automated thumbnail optimization

## 🎯 Benefits of This Setup

✅ **Separation of Concerns**: Frontend focuses on UI, backend handles data  
✅ **Scalability**: Database can handle thousands of videos  
✅ **Performance**: Cached data loads faster than API calls  
✅ **Reliability**: No dependency on YouTube API quotas  
✅ **Analytics**: Track video performance over time  
✅ **Automation**: N8N handles video discovery automatically  

Your senior's `server.ts` is now integrated into a complete, production-ready system! 🚀
