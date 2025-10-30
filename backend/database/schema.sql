-- Create database (run this first as superuser)
-- CREATE DATABASE indiaindexfunds_youtube;

-- Connect to the database and run the following:

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    published_at TIMESTAMP,
    duration INTEGER, -- Duration in seconds
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    channel_title VARCHAR(255),
    tags TEXT[], -- Array of tags
    category_id VARCHAR(50),
    language VARCHAR(10) DEFAULT 'en',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    CONSTRAINT unique_video_id UNIQUE (video_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_view_count ON videos(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_videos_channel_title ON videos(channel_title);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional)
INSERT INTO videos (
    video_id, 
    title, 
    description, 
    thumbnail_url, 
    published_at,
    duration,
    view_count,
    like_count,
    channel_title
) VALUES (
    'dQw4w9WgXcQ',
    'Sample Video: Getting Started with Index Funds',
    'Learn the basics of index fund investing in India. This comprehensive guide covers everything you need to know.',
    'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    '2024-01-15 10:30:00',
    900, -- 15 minutes
    150000,
    5200,
    'India Index Funds Channel'
) ON CONFLICT (video_id) DO NOTHING;

-- View to get video statistics
CREATE OR REPLACE VIEW video_stats AS
SELECT 
    COUNT(*) as total_videos,
    AVG(view_count) as avg_views,
    MAX(view_count) as max_views,
    SUM(view_count) as total_views,
    AVG(like_count) as avg_likes,
    COUNT(DISTINCT channel_title) as unique_channels
FROM videos;
