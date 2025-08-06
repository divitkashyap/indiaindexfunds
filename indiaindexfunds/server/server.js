const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Proxy for RSS feeds
app.get('/api/rss/:encodedUrl', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.encodedUrl);
    const response = await axios.get(url);
    
    // Parse XML to JSON
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(response.data);
    
    res.json(result);
  } catch (error) {
    console.error('RSS fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
});

// Proxy for News API
app.get('/api/news', async (req, res) => {
  try {
    const { q = 'index funds mutual funds', apiKey } = req.query;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }
    
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&sortBy=publishedAt&apiKey=${apiKey}`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('News API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 