// src/api/videos.ts - ORIGINAL WORKING VERSION (FALLBACK)
// This version fetches from static JSON - keep as backup!

export type Video = {
  videoId: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  durationLabel?: string;
  durationSec?: number;
  viewCount?: number;
  isShorts?: boolean;
  embed: string;
};

export async function fetchVideos(): Promise<{ updatedAt: string; videos: Video[] }> {
  const res = await fetch('/videos.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load videos');
  const data = await res.json();
  // Handle array structure where data is [{ updatedAt, videos }]
  return Array.isArray(data) ? data[0] : data;
}

// ALTERNATIVE: Backend API version (uncomment to use superior's backend)
/*
export type VideoBackend = {
  id?: number;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at?: string;
  duration?: number;
  view_count?: number;
  like_count?: number;
  channel_title?: string;
  created_at?: string;
};

export async function fetchVideosFromBackend(): Promise<{ videos: VideoBackend[] }> {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const res = await fetch(`${API_BASE_URL}/api/videos`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Backend API error: ${res.status}`);
  return res.json();
}
*/
