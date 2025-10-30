import React, { useState, useEffect } from 'react';

// Backend API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface YouTubeVideo {
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
}

const YouTubeVideos: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/videos?limit=10`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('API endpoint not found. Make sure the backend server is running.');
          } else if (response.status >= 500) {
            throw new Error('Backend server error. Please try again later.');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        if (!data.videos || data.videos.length === 0) {
          setError('No videos found. The database might be empty.');
          return;
        }
        
        setVideos(data.videos);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Cannot connect to backend server. Please make sure it\'s running on port 5000.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch videos');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Helper function to format duration (if stored as seconds)
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to format view count
  const formatViewCount = (count?: number) => {
    if (!count) return '';
    if (count > 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count > 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  // Helper function to truncate description
  const truncateDescription = (description: string, maxLength: number = 100) => {
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading videos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Videos</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Latest Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.video_id} 
            className="bg-gray-800/50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-600"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={video.thumbnail_url || 'https://via.placeholder.com/480x360?text=No+Thumbnail'}
                alt={video.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3 line-clamp-3">
                {truncateDescription(video.description)}
              </p>
              
              {/* Video metadata */}
              <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
                <span>
                  {video.published_at ? new Date(video.published_at).toLocaleDateString() : 'Unknown date'}
                </span>
                {video.duration && (
                  <span className="bg-gray-700 px-2 py-1 rounded">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Video stats */}
              {(video.view_count || video.like_count) && (
                <div className="flex justify-between items-center mb-3 text-xs text-gray-400">
                  {video.view_count && <span>{formatViewCount(video.view_count)}</span>}
                  {video.like_count && <span>👍 {video.like_count.toLocaleString()}</span>}
                </div>
              )}

              {/* Channel name */}
              {video.channel_title && (
                <div className="text-xs text-gray-500 mb-3">
                  By {video.channel_title}
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Added {video.created_at ? new Date(video.created_at).toLocaleDateString() : ''}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Watch
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Backend status indicator */}
      <div className="mt-8 text-center text-xs text-gray-500">
        Videos loaded from database • 
        <span className="text-green-400 ml-1">Backend Connected</span>
      </div>
    </div>
  );
};

export default YouTubeVideos;
