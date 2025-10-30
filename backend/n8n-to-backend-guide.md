# N8N to Backend Integration Guide

## Current State
- ✅ Backend API running on http://localhost:5001
- ✅ Database schema ready with videos table
- ✅ N8N automation generating videos.json with rich video data
- ✅ API endpoint `/api/videos` working (tested with curl)

## Goal
Replace N8N's JSON file output with direct POST requests to your backend API.

## Steps to Update Your N8N Workflow

### Step 1: Add HTTP Request Node
1. In your N8N workflow, replace the "Write JSON File" node with an "HTTP Request" node
2. Configure the HTTP Request node:

**HTTP Request Node Configuration:**
```
Method: POST
URL: http://localhost:5001/api/videos
Headers:
  Content-Type: application/json
Authentication: None
```

### Step 2: Transform Data Format
Your N8N currently outputs this structure:
```json
{
  "videoId": "ULbDhtFRuJ8",
  "title": "...",
  "thumbnail": "...",
  "publishedAt": "2025-08-24T11:30:31Z",
  "channelTitle": "...",
  "durationSec": 116,
  "viewCount": 809,
  "embed": "...",
  "watchUrl": "..."
}
```

But your backend expects:
```json
{
  "video_id": "ULbDhtFRuJ8",
  "title": "...",
  "description": "...",
  "thumbnail_url": "...",
  "published_at": "2025-08-24T11:30:31Z",
  "duration": 116,
  "view_count": 809,
  "like_count": null,
  "channel_title": "..."
}
```

### Step 3: Add Data Transformation Node
Add a "Code" or "Function" node before the HTTP Request to map the fields:

```javascript
// N8N Function Node Code
for (const item of $input.all()) {
  const video = item.json;
  
  // Transform the data structure
  const transformedVideo = {
    video_id: video.videoId,
    title: video.title,
    description: video.description || '',
    thumbnail_url: video.thumbnail,
    published_at: video.publishedAt,
    duration: video.durationSec,
    view_count: video.viewCount || 0,
    like_count: null, // YouTube API doesn't provide this in your current data
    channel_title: video.channelTitle
  };
  item.json = transformedVideo;
}

return $input.all();
```

### Step 4: Handle Batch Processing
Since you have multiple videos per run, you have two options:

**Option A: Single API Call (Recommended)**
Modify your backend to accept an array of videos:
```javascript
// In your HTTP Request node body:
{
  "videos": [
    // ... all transformed videos
  ]
}
```

**Option B: Individual API Calls**
Use a "Split In Batches" node to send one video at a time.

### Step 5: Error Handling
Add error handling to your HTTP Request node:
- Set "Ignore SSL Issues" to true if needed
- Add "Continue on Fail" to handle errors gracefully
- Add a "Merge" node to handle both success and error responses

## Backend Modifications Needed

### Update API to Accept Batch Inserts
I'll create an endpoint that can handle multiple videos at once:

```typescript
// Add this to your server.ts
app.post('/api/videos/batch', async (req: Request, res: Response) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos must be an array' });
    }
    
    const insertPromises = videos.map((video: Video) => {
      return pool.query(`
        INSERT INTO videos (video_id, title, description, thumbnail_url, published_at, duration, view_count, like_count, channel_title)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (video_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          thumbnail_url = EXCLUDED.thumbnail_url,
          published_at = EXCLUDED.published_at,
          duration = EXCLUDED.duration,
          view_count = EXCLUDED.view_count,
          like_count = EXCLUDED.like_count,
          channel_title = EXCLUDED.channel_title
      `, [
        video.video_id,
        video.title,
        video.description,
        video.thumbnail_url,
        video.published_at,
        video.duration,
        video.view_count,
        video.like_count,
        video.channel_title
      ]);
    });
    
    await Promise.all(insertPromises);
    
    res.json({ 
      success: true, 
      message: `Successfully processed ${videos.length} videos`,
      count: videos.length 
    });
  } catch (error) {
    console.error('Batch insert error:', error);
    res.status(500).json({ error: 'Failed to insert videos' });
  }
});
```

## Testing Your Integration

1. **Test the batch endpoint:**
```bash
curl -X POST http://localhost:5001/api/videos/batch \
  -H "Content-Type: application/json" \
  -d '{"videos": [{"video_id": "test123", "title": "Test Video", "description": "Test", "thumbnail_url": "https://example.com/thumb.jpg", "published_at": "2025-09-08T00:00:00Z", "duration": 120, "view_count": 100, "like_count": null, "channel_title": "Test Channel"}]}'
```

2. **Verify data in database:**
```bash
curl http://localhost:5001/api/videos
```

## Migration Strategy

1. **Phase 1:** Keep both systems running (N8N writes to JSON AND posts to backend)
2. **Phase 2:** Update frontend to read from backend API instead of JSON
3. **Phase 3:** Remove JSON file output from N8N workflow

Would you like me to implement the backend batch endpoint first, or help you with the N8N workflow modification?
