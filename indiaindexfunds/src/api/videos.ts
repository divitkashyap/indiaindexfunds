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
