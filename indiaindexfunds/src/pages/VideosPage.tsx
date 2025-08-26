// src/pages/VideosPage.tsx
import { useEffect, useState } from "react";
import { fetchVideos, type Video } from "../api/videos";

function timeAgo(iso: string) {
  const secs = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [[31536000,'y'],[2592000,'mo'],[604800,'w'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [s, l] of steps) if (secs >= s) return `${Math.floor(secs / s)}${l} ago`;
  return `${secs}s ago`;
}

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map(v => (
            <button
              key={v.videoId}
              onClick={() => setActive(v)}
              className="text-left bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:bg-white/15 transition"
            >
              <div className="relative">
                <img
                  src={v.thumbnail}
                  alt={v.title}
                  loading="lazy"
                  className="w-full aspect-video object-cover"
                />
                {v.durationLabel && (
                  <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-black/70 text-white">
                    {v.durationLabel}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-white text-sm">{v.title}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {timeAgo(v.publishedAt)} · {Intl.NumberFormat("en-IN").format(v.viewCount ?? 0)} views
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog" aria-modal="true" onClick={() => setActive(null)}
        >
          <div
            className="bg-white/10 border border-white/10 rounded-2xl w-full max-w-5xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full">
              <iframe
                title={active.title}
                className="w-full h-full"
                src={`${active.embed}&enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <h2 className="text-white text-base pr-4">{active.title}</h2>
              <div className="space-x-4">
                <a
                  href={`https://www.youtube.com/watch?v=${active.videoId}`}
                  target="_blank" rel="noreferrer"
                  className="text-accent text-sm hover:underline"
                >
                  Watch on YouTube →
                </a>
                <button className="text-gray-300 text-sm hover:underline" onClick={() => setActive(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
