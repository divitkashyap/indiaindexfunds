#!/bin/bash

# Simple test of the batch endpoint using curl
echo "🧪 Testing batch video endpoint with curl..."

curl -X POST http://localhost:5001/api/videos/batch \
  -H "Content-Type: application/json" \
  -d '{
    "videos": [
      {
        "video_id": "test123",
        "title": "Test Video from curl",
        "description": "This is a test video uploaded via the batch endpoint",
        "thumbnail_url": "https://i.ytimg.com/vi/test123/hqdefault.jpg",
        "published_at": "2025-09-08T12:00:00Z",
        "channel_title": "Test Channel",
        "duration": 120,
        "view_count": 1000
      }
    ]
  }'

echo -e "\n\n🔍 Now fetching all videos..."
curl http://localhost:5001/api/videos
