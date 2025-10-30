"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// PostgreSQL connection
const pool = new pg_1.Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'indiaindexfunds_youtube',
    password: process.env.PG_PASSWORD || '',
    port: parseInt(process.env.PG_PORT || '5432'),
});
// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    }
    else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});
// Initialize Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // React app URL
    credentials: true
}));
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'connected'
    });
});
// GET: Fetch all videos from the database
app.get('/api/videos', async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;
        const result = await pool.query(`SELECT video_id, title, description, thumbnail_url, published_at, 
              duration, view_count, like_count, channel_title, created_at
       FROM videos 
       ORDER BY published_at DESC 
       LIMIT $1 OFFSET $2`, [limit, offset]);
        res.json({
            videos: result.rows,
            total: result.rowCount,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    }
    catch (err) {
        console.error('Error fetching videos:', err);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});
// GET: Fetch a single video by ID
app.get('/api/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const result = await pool.query('SELECT * FROM videos WHERE video_id = $1', [videoId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Error fetching video:', err);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});
// POST: Save a video to the database (for N8N webhook)
app.post('/api/videos', async (req, res) => {
    const { video_id, title, description, thumbnail_url, published_at, duration, view_count, like_count, channel_title } = req.body;
    // Validation
    if (!video_id || !title) {
        return res.status(400).json({ error: 'video_id and title are required' });
    }
    try {
        const result = await pool.query(`INSERT INTO videos (
        video_id, title, description, thumbnail_url, published_at,
        duration, view_count, like_count, channel_title
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      ON CONFLICT (video_id) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        thumbnail_url = EXCLUDED.thumbnail_url,
        view_count = EXCLUDED.view_count,
        like_count = EXCLUDED.like_count,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`, [video_id, title, description, thumbnail_url, published_at, duration, view_count, like_count, channel_title]);
        res.status(201).json({
            message: 'Video saved successfully',
            video: result.rows[0]
        });
    }
    catch (err) {
        console.error('Error saving video:', err);
        res.status(500).json({ error: 'Failed to save video' });
    }
});
// POST: Batch save multiple videos (for N8N automation)
app.post('/api/videos/batch', async (req, res) => {
    try {
        const { videos } = req.body;
        if (!Array.isArray(videos)) {
            return res.status(400).json({ error: 'Videos must be an array' });
        }
        if (videos.length === 0) {
            return res.status(400).json({ error: 'No videos provided' });
        }
        console.log(`Processing batch of ${videos.length} videos...`);
        const insertPromises = videos.map((video) => {
            // Validation for each video
            if (!video.video_id || !video.title) {
                throw new Error(`Invalid video data: video_id and title are required`);
            }
            return pool.query(`
        INSERT INTO videos (
          video_id, title, description, thumbnail_url, published_at,
          duration, view_count, like_count, channel_title
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (video_id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          thumbnail_url = EXCLUDED.thumbnail_url,
          published_at = EXCLUDED.published_at,
          duration = EXCLUDED.duration,
          view_count = EXCLUDED.view_count,
          like_count = EXCLUDED.like_count,
          channel_title = EXCLUDED.channel_title,
          updated_at = CURRENT_TIMESTAMP
        RETURNING video_id
      `, [
                video.video_id,
                video.title,
                video.description || '',
                video.thumbnail_url,
                video.published_at,
                video.duration || null,
                video.view_count || 0,
                video.like_count || null,
                video.channel_title
            ]);
        });
        const results = await Promise.all(insertPromises);
        const processedVideoIds = results.map(result => result.rows[0]?.video_id).filter(Boolean);
        console.log(`✅ Successfully processed ${processedVideoIds.length} videos`);
        res.json({
            success: true,
            message: `Successfully processed ${processedVideoIds.length} videos`,
            count: processedVideoIds.length,
            videoIds: processedVideoIds
        });
    }
    catch (error) {
        console.error('❌ Batch insert error:', error);
        res.status(500).json({
            error: 'Failed to insert videos',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// DELETE: Remove a video
app.delete('/api/videos/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const result = await pool.query('DELETE FROM videos WHERE video_id = $1 RETURNING *', [videoId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }
        res.json({ message: 'Video deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting video:', err);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await pool.end();
    process.exit(0);
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
//# sourceMappingURL=server.js.map