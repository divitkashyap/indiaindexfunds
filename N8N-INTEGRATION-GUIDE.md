# 🔄 N8N to Database Integration Guide

## Current Setup Analysis
- ✅ **N8N Automation**: Working, creates JSON with YouTube videos
- ✅ **Backend API**: Ready to receive videos via POST /api/videos
- ✅ **Database**: PostgreSQL setup complete
- 🔄 **Missing**: Connection between N8N → Backend

## 🎯 **Option 1: Direct N8N → Backend (Recommended)**

### Step 1: Add HTTP Request Node to N8N

Replace your "Write JSON" node with "HTTP Request" node:

**HTTP Request Node Configuration:**
- **URL**: `http://localhost:5000/api/videos`
- **Method**: `POST`
- **Headers**: 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Body**: Use expression to map your YouTube data

### Step 2: Data Mapping

Your N8N output needs to match backend expected format:

**N8N Current Output:**
```json
{
  "videoId": "abc123",
  "title": "Video Title",
  "thumbnail": "https://...",
  "publishedAt": "2025-08-24T11:30:31Z"
}
```

**Backend Expected Format:**
```json
{
  "video_id": "abc123",
  "title": "Video Title", 
  "description": "Video description",
  "thumbnail_url": "https://...",
  "published_at": "2025-08-24T11:30:31Z",
  "view_count": 1000,
  "like_count": 50,
  "channel_title": "Your Channel"
}
```

### Step 3: N8N Expression Mapping

In the HTTP Request body, use expressions:
```javascript
{
  "video_id": "{{ $json.videoId }}",
  "title": "{{ $json.title }}",
  "description": "{{ $json.description }}",
  "thumbnail_url": "{{ $json.thumbnail }}",
  "published_at": "{{ $json.publishedAt }}",
  "view_count": {{ $json.viewCount }},
  "like_count": {{ $json.likeCount }},
  "channel_title": "{{ $json.channelTitle }}"
}
```

## 🔄 **Option 2: JSON to Database Script**

If you want to keep your current N8N workflow:

### Step 1: Create Import Script

```javascript
// scripts/import-from-json.js
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: parseInt(process.env.PG_PORT)
});

async function importFromJSON() {
  const jsonData = JSON.parse(fs.readFileSync('/path/to/your/videos.json', 'utf8'));
  const videos = Array.isArray(jsonData) ? jsonData[0].videos : jsonData.videos;
  
  for (const video of videos) {
    await pool.query(`
      INSERT INTO videos (video_id, title, description, thumbnail_url, published_at, view_count, channel_title)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (video_id) DO NOTHING
    `, [
      video.videoId,
      video.title,
      video.description || '',
      video.thumbnail,
      video.publishedAt,
      video.viewCount || 0,
      video.channelTitle || 'Your Channel'
    ]);
  }
  
  console.log(`Imported ${videos.length} videos`);
  await pool.end();
}

importFromJSON();
```

### Step 2: Run Import
```bash
cd backend
node scripts/import-from-json.js
```

## 🚀 **Option 3: Hybrid Webhook Approach**

### Step 1: Add Webhook Endpoint to N8N
- Create N8N webhook that receives JSON
- N8N processes and sends to your backend

### Step 2: Trigger from External Script
```javascript
// Send your JSON to N8N webhook
fetch('http://localhost:5678/webhook/youtube-import', {
  method: 'POST',
  body: JSON.stringify(yourVideoData)
});
```

## 🎯 **Recommended Implementation**

**Go with Option 1** because it's:
- ✅ Real-time: Videos appear immediately
- ✅ Simple: No intermediate files
- ✅ Scalable: Handles any number of videos
- ✅ Error handling: Backend can validate data

## 📝 **Step-by-Step Implementation**

1. **Start your backend server**:
   ```bash
   cd backend
   PORT=5001 node dist/server.js  # Use different port if 5000 busy
   ```

2. **Test backend API**:
   ```bash
   curl -X POST http://localhost:5001/api/videos \
     -H "Content-Type: application/json" \
     -d '{
       "video_id": "test123",
       "title": "Test Video",
       "thumbnail_url": "https://example.com/thumb.jpg"
     }'
   ```

3. **Modify N8N workflow**:
   - Replace JSON output node with HTTP Request
   - Point to your backend URL
   - Map data fields correctly

4. **Update frontend**:
   - Switch from static JSON to backend API
   - Test with your existing video cards

Would you like me to help you with any of these specific steps?
