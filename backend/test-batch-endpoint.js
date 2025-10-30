#!/usr/bin/env node

// Test script for the batch video endpoint
const fetch = require('node-fetch');

// Sample video data in the format your N8N generates
const testVideos = [
  {
    video_id: "ULbDhtFRuJ8",
    title: "How Many Bank Accounts Do You Really Need? | With Dr. Mrinalini & Sooraj #stockmarket #newsupdate",
    description: "With Dr. Mrinalini & Sooraj\n\nHow many bank accounts should you actually have? 🤔\n\nIn this video, Dr. Mrinalini & Sooraj discuss:\n✅ The right number of bank accounts for Indians.\n✅ Which banks & accounts you should consider.\n✅ Smart credit card strategy for financial freedom.\n✅ Mistakes to avoid (including hidden charges & the ICICI AQB issue).\n\n👉 A must-watch for anyone confused about banking in India!",
    thumbnail_url: "https://i.ytimg.com/vi/ULbDhtFRuJ8/hqdefault.jpg",
    published_at: "2025-08-24T11:30:31Z",
    channel_title: "Index Funds Sahi hai",
    duration: 116,
    view_count: 809
  },
  {
    video_id: "Z2tk2657-is",
    title: "Momentum Funds Explained Simply | Factor Investing Basics",
    description: "In this video, we break down momentum index funds — a type of factor index that focuses on picking stocks already performing well, with the expectation that they'll continue to shine.",
    thumbnail_url: "https://i.ytimg.com/vi/Z2tk2657-is/hqdefault.jpg",
    published_at: "2025-08-17T11:30:25Z",
    channel_title: "Index Funds Sahi hai",
    duration: 90,
    view_count: 542
  }
];

async function testBatchEndpoint() {
  try {
    console.log('🧪 Testing batch video endpoint...');
    console.log(`📤 Sending ${testVideos.length} videos to http://localhost:5001/api/videos/batch`);
    
    const response = await fetch('http://localhost:5001/api/videos/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videos: testVideos })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Batch insert successful!');
      console.log('📊 Response:', result);
    } else {
      console.log('❌ Batch insert failed');
      console.log('🚨 Error:', result);
    }
    
    // Now test fetching the videos
    console.log('\n🔍 Fetching videos from API...');
    const fetchResponse = await fetch('http://localhost:5001/api/videos');
    const videos = await fetchResponse.json();
    
    console.log(`📹 Found ${videos.total} videos in database`);
    console.log('🎬 Video titles:', videos.videos.map(v => v.title));
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testBatchEndpoint();
