// src/pages/VideosPage.tsx - ORIGINAL WORKING VERSION (FALLBACK)
// This version uses static JSON file - keep as backup!

import { useEffect, useState } from "react";
import { fetchVideos, type Video } from "../api/videos";
import { VideoCard } from "../components/ui/video-card";

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos()
      .then(({ videos }) => {
        console.log('Fetched videos:', videos.length);
        setVideos(videos.sort((a,b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)));
      })
      .catch((err) => {
        console.error('Error fetching videos:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-white">Latest Videos</h1>

      {loading ? (
        <div className="text-gray-300">Loading…</div>
      ) : error ? (
        <div className="text-red-400">Error loading videos: {error}</div>
      ) : videos.length === 0 ? (
        <div className="text-gray-300">No videos found</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((v, index) => {
            // Cycle through glow colors for variety
            const glowColors: Array<'blue' | 'purple' | 'green' | 'red' | 'orange'> = ['blue', 'purple', 'green', 'red', 'orange'];
            const glowColor = glowColors[index % glowColors.length];
            
            return (
              <VideoCard
                key={v.videoId}
                video={v}
                onClick={() => setActive(v)}
                glowColor={glowColor}
              />
            );
          })}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setActive(null)}
              className="absolute -top-8 right-0 text-white hover:text-gray-300"
            >
              ✕
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={active.embed}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
