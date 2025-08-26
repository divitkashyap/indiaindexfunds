import React from 'react';
import { Play } from 'lucide-react';
import { GlowCard } from './spotlight-card';
import type { Video } from '../../api/videos';

interface VideoCardProps {
  video: Video;
  onClick: () => void;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
}

function timeAgo(iso: string) {
  const secs = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const steps: [number, string][] = [[31536000,'y'],[2592000,'mo'],[604800,'w'],[86400,'d'],[3600,'h'],[60,'m']];
  for (const [s, l] of steps) if (secs >= s) return `${Math.floor(secs / s)}${l} ago`;
  return `${secs}s ago`;
}

const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onClick, 
  glowColor = 'blue' 
}) => {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left group transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 rounded-2xl"
    >
      <GlowCard
        customSize
        glowColor={glowColor}
        className="w-full !p-0 !gap-0"
      >
        {/* Thumbnail - this will be the main content area */}
        <div className="relative aspect-video overflow-hidden rounded-t-2xl">
          <img
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <Play className="w-6 h-6 text-white fill-current" />
            </div>
          </div>
          
          {/* Duration badge */}
          {video.durationLabel && (
            <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-black/80 text-white font-medium">
              {video.durationLabel}
            </span>
          )}
        </div>
        
        {/* Content - this will be the auto-sized footer */}
        <div className="p-4 space-y-2 bg-gray-900/80 backdrop-blur-sm rounded-b-2xl">
          <h3 className="text-white text-sm font-medium line-clamp-2 group-hover:text-accent transition-colors">
            {video.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>
              {timeAgo(video.publishedAt)}
            </span>
            <span>
              {Intl.NumberFormat("en-IN").format(video.viewCount ?? 0)} views
            </span>
          </div>
          
          {/* Channel info */}
          <div className="flex items-center gap-2 pt-1">
            <div className="w-6 h-6 bg-gradient-to-br from-accent to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">IF</span>
            </div>
            <span className="text-xs text-gray-300 font-medium">
              Index Funds Sahi hai
            </span>
          </div>
        </div>
      </GlowCard>
    </button>
  );
};

export { VideoCard };
