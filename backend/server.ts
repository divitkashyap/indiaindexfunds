import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

// PostgreSQL connection
const pool = new Pool({
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
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // React app URL
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Interface for video data
interface Video {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  published_at?: string;
  duration?: string;
  view_count?: number;
  like_count?: number;
  channel_title?: string;
}

// -------------------------
// AMFI NAV fetcher & cache
// -------------------------

type AmfiRow = {
  schemeCode: string;
  isinDivGrowth?: string;
  isinDivReinv?: string;
  schemeName: string;
  nav: number;
  date: string; // DD-MMM-YYYY
  rta?: string;
  rtaCode?: string;
  amc?: string;
};

const AMFI_NAV_ALL_URL = process.env.AMFI_NAV_URL || 'https://www.amfiindia.com/spages/NAVAll.txt';
const AMFI_HISTORY_URL = 'https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx';
const AMFI_FETCH_TIMEOUT_MS = 10000; // 10 seconds

// In-memory cache
let amfiAllCache: { fetchedAt: number; rows: AmfiRow[] } | null = null;
const AMFI_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isIndexLikeName(name: string): boolean {
  const n = name.toLowerCase();
  // Broad filter for index-like schemes (adjust as needed)
  return (
    n.includes('index') ||
    n.includes('nifty') ||
    n.includes('sensex') ||
    n.includes('etf') ||
    n.includes('benchmark') ||
    n.includes('nse') ||
    n.includes('bse')
  );
}

async function fetchAmfiAll(): Promise<AmfiRow[]> {
  // Return fresh cache if within TTL
  if (amfiAllCache && Date.now() - amfiAllCache.fetchedAt < AMFI_CACHE_TTL_MS) {
    return amfiAllCache.rows;
  }

  // Try multiple URLs/protocols with retries and backoff
  const urlsToTry = [
    AMFI_NAV_ALL_URL,
    'http://www.amfiindia.com/spages/NAVAll.txt',
    'https://www.amfiindia.com/spages/NAVAll.txt'
  ];

  const maxAttempts = 3;
  const baseDelayMs = 1500;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    for (const url of urlsToTry) {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), AMFI_FETCH_TIMEOUT_MS);
      try {
        console.log(`Fetching AMFI NAVAll.txt (attempt ${attempt}/${maxAttempts}) from ${url}`);
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'indiaindexfunds/1.0 (+https://github.com/divitkashyap/indiaindexfunds)'
          },
          signal: controller.signal
        });
        if (!res.ok) {
          console.warn(`AMFI fetch non-OK status ${res.status} from ${url}`);
          continue;
        }
        const text = await res.text();
        if (!text || text.length < 1000) {
          console.warn(`AMFI fetch returned too small payload (${text.length} bytes) from ${url}`);
          continue;
        }
        const rows = parseAmfiNavAll(text);
        amfiAllCache = { fetchedAt: Date.now(), rows };
        console.log(`Fetched AMFI list: ${rows.length} rows`);
        return rows;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        console.warn(`AMFI fetch error from ${url}: ${reason}`);
      } finally {
        clearTimeout(to);
      }
    }
    // Backoff before next attempt
    const waitMs = baseDelayMs * attempt;
    await new Promise(r => setTimeout(r, waitMs));
  }

  throw new Error('All attempts to fetch AMFI NAVAll.txt failed');
}

function parseAmfiNavAll(text: string): AmfiRow[] {
  // AMFI text is semicolon delimited; header lines at top; blank lines present
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  // Find header index (line that contains Scheme Code;Scheme Name;...)
  const headerIndex = lines.findIndex(l => /Scheme Code;Scheme Name/i.test(l));
  const dataLines = headerIndex >= 0 ? lines.slice(headerIndex + 1) : lines;

  const rows: AmfiRow[] = [];
  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length < 6) continue;
    // Expected minimal columns: Scheme Code;Scheme Name;ISIN Div Payout/ Growth;ISIN Div Reinvestment;NAV;Date;... (may have more)
    const [schemeCode, schemeName, isinDivGrowth, isinDivReinv, navStr, date, rta, rtaCode, amc] = parts;
    const nav = parseFloat(navStr);
    if (Number.isNaN(nav)) continue;
    rows.push({
      schemeCode: schemeCode?.trim(),
      schemeName: schemeName?.trim(),
      isinDivGrowth: isinDivGrowth?.trim() || undefined,
      isinDivReinv: isinDivReinv?.trim() || undefined,
      nav,
      date: date?.trim(),
      rta: rta?.trim(),
      rtaCode: rtaCode?.trim(),
      amc: amc?.trim(),
    });
  }
  return rows;
}

// GET: List index-like funds from AMFI daily dump
app.get('/api/index-funds', async (req: Request, res: Response) => {
  try {
    const all = await fetchAmfiAll();
    const uniqueByIsin = new Map<string, AmfiRow>();
    for (const row of all) {
      if (!row.schemeName) continue;
      if (!isIndexLikeName(row.schemeName)) continue;
      const key = row.isinDivGrowth || row.isinDivReinv || `${row.schemeCode}:${row.schemeName}`;
      if (!uniqueByIsin.has(key)) uniqueByIsin.set(key, row);
    }

    const list = Array.from(uniqueByIsin.values()).map(r => ({
      schemeCode: r.schemeCode,
      schemeName: r.schemeName,
      isin: r.isinDivGrowth || r.isinDivReinv || null,
      nav: r.nav,
      date: r.date,
      amc: r.amc || null,
    }));

    res.json({ count: list.length, funds: list });
  } catch (err) {
    console.error('Error fetching index funds from AMFI:', err);
    // Fallback: return a minimal verified list so UI doesn't block
    const today = new Date();
    const monthShort = today.toLocaleString('en-GB', { month: 'short' });
    const dd = String(today.getDate()).padStart(2, '0');
    const yyyy = today.getFullYear();
    const ddMmmYyyy = `${dd}-${monthShort}-${yyyy}`;
    const fallback = [{
      schemeCode: 'BANDHAN-N200M30-DG',
      schemeName: 'BANDHAN NIFTY200 MOMENTUM 30 INDEX FUND - GROWTH - DIRECT PLAN',
      isin: 'INF194KB1DP9',
      nav: 0,
      date: ddMmmYyyy,
      amc: 'Bandhan Mutual Fund'
    }];
    res.status(200).json({ count: fallback.length, funds: fallback, partial: true, source: 'fallback' });
  }
});

// GET: Proxy CAPTNEMO by ISIN (for historical NAV), with basic validation
app.get('/api/nav/:isin', async (req: Request, res: Response) => {
  const { isin } = req.params;
  try {
    if (!/^IN[A-Z0-9]{9,12}$/i.test(isin)) {
      return res.status(400).json({ error: 'Invalid ISIN format' });
    }
    const resp = await fetch(`https://mf.captnemo.in/nav/${encodeURIComponent(isin)}`);
    const contentType = resp.headers.get('content-type') || '';
    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(resp.status).type(contentType).send(txt);
    }
    const json = await resp.json();
    res.json(json);
  } catch (err) {
    console.error('Error proxying NAV:', err);
    res.status(500).json({ error: 'Failed to fetch NAV' });
  }
});

// GET: AMFI historical NAV download pass-through (date format DD-MMM-YYYY)
app.get('/api/amfi/history', async (req: Request, res: Response) => {
  const { frmdt, todt } = req.query as { frmdt?: string; todt?: string };
  if (!frmdt || !todt) {
    return res.status(400).json({ error: 'frmdt and todt are required (DD-MMM-YYYY)' });
  }
  try {
    const url = `${AMFI_HISTORY_URL}?frmdt=${encodeURIComponent(frmdt)}&todt=${encodeURIComponent(todt)}`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'indiaindexfunds/1.0 (+https://github.com/divitkashyap/indiaindexfunds)'
      }
    });
    const text = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).send(text);
    }
    res.type('text/plain').send(text);
  } catch (err) {
    console.error('Error fetching AMFI history:', err);
    res.status(500).json({ error: 'Failed to fetch AMFI history' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected' 
  });
});

// GET: Fetch all videos from the database
app.get('/api/videos', async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const result = await pool.query(
      `SELECT video_id, title, description, thumbnail_url, published_at, 
              duration, view_count, like_count, channel_title, created_at
       FROM videos 
       ORDER BY published_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    res.json({
      videos: result.rows,
      total: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (err) {
    console.error('Error fetching videos:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// GET: Fetch a single video by ID
app.get('/api/videos/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const result = await pool.query(
      'SELECT * FROM videos WHERE video_id = $1',
      [videoId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// POST: Save a video to the database (for N8N webhook)
app.post('/api/videos', async (req: Request, res: Response) => {
  const { 
    video_id, 
    title, 
    description, 
    thumbnail_url,
    published_at,
    duration,
    view_count,
    like_count,
    channel_title
  } = req.body as Video;

  // Validation
  if (!video_id || !title) {
    return res.status(400).json({ error: 'video_id and title are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO videos (
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
      RETURNING *`,
      [video_id, title, description, thumbnail_url, published_at, duration, view_count, like_count, channel_title]
    );
    
    res.status(201).json({ 
      message: 'Video saved successfully',
      video: result.rows[0]
    });
  } catch (err) {
    console.error('Error saving video:', err);
    res.status(500).json({ error: 'Failed to save video' });
  }
});

// POST: Batch save multiple videos (for N8N automation)
app.post('/api/videos/batch', async (req: Request, res: Response) => {
  try {
    const { videos } = req.body;
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos must be an array' });
    }
    
    if (videos.length === 0) {
      return res.status(400).json({ error: 'No videos provided' });
    }
    
    console.log(`Processing batch of ${videos.length} videos...`);
    
    const insertPromises = videos.map((video: Video) => {
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
  } catch (error) {
    console.error('❌ Batch insert error:', error);
    res.status(500).json({ 
      error: 'Failed to insert videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE: Remove a video
app.delete('/api/videos/:videoId', async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const result = await pool.query(
      'DELETE FROM videos WHERE video_id = $1 RETURNING *',
      [videoId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('Error deleting video:', err);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
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
