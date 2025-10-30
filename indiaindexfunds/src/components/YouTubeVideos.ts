import React, { useState, useEffect } from 'react';

// Environment variables for security
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.REACT_APP_YOUTUBE_CHANNEL_ID || 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Default: Google Developers
const MAX_RESULTS = 10;

interface YouTubeVideo {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    publishTime: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

const YouTubeVideos: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      // Check if API key is configured
      if (!API_KEY) {
        setError('YouTube API key not configured. Please add REACT_APP_YOUTUBE_API_KEY to your .env file.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://youtube.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${CHANNEL_ID}&maxResults=${MAX_RESULTS}` +
          `&order=date&type=video&key=${API_KEY}`
        );
        
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('YouTube API quota exceeded or invalid API key');
          } else if (response.status === 404) {
            throw new Error('Channel not found');
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          setError('No videos found for this channel');
          return;
        }
        
        setVideos(data.items);
        setError(null);
      } catch (err) {
        console.error('YouTube API Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Helper function to get the best available thumbnail
  const getThumbnailUrl = (thumbnails: YouTubeVideo['snippet']['thumbnails']) => {
    return thumbnails.high?.url || thumbnails.medium?.url || thumbnails.default?.url || '';
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Latest Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div 
            key={video.id.videoId} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={getThumbnailUrl(video.snippet.thumbnails)}
                alt={video.snippet.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                {video.snippet.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {truncateDescription(video.snippet.description)}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
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
    </div>
  );
};

export default YouTubeVideos;