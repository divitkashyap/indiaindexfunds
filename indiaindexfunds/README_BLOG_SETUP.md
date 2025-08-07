# Real-Time Blog Data Setup

This guide explains how to set up real-time blog data fetching for the India Index Funds website.

## Features

- **Real-time RSS Feed Integration**: Fetches blog posts from financial news sources
- **News API Integration**: Gets latest news about index funds and mutual funds
- **Fallback Data**: Shows cached content when external APIs are unavailable
- **Category Filtering**: Filter posts by category (Education, Analysis, News, etc.)
- **Search Functionality**: Search through blog posts by title and content
- **External Links**: Direct links to original articles when available

## Setup Instructions

### 1. Install Server Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Get News API Key (Optional)

For real-time news data, get a free API key from [NewsAPI.org](https://newsapi.org/):

1. Sign up at https://newsapi.org/
2. Get your API key
3. Create a `.env` file in the root directory:

```env
REACT_APP_NEWS_API_KEY=your_api_key_here
```

### 3. Start the Server

In the server directory:

```bash
npm run dev
```

The server will run on `http://localhost:3001`

### 4. Start the Frontend

In the root directory:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Data Sources

### RSS Feeds
The system fetches from these RSS feeds:
- MoneyControl Mutual Funds: `https://www.moneycontrol.com/rss/mf.xml`
- Economic Times: `https://economictimes.indiatimes.com/rss.cms`
- Livemint Markets: `https://www.livemint.com/rss/markets`

### News API
Fetches articles about:
- Index funds
- Mutual funds
- Investment strategies
- Market analysis

### Fallback Data
When external sources are unavailable, the system shows curated content about:
- Index fund education
- Investment strategies
- Market insights
- Tax planning

## API Endpoints

### Server Endpoints

- `GET /api/rss/:encodedUrl` - Fetch RSS feed data
- `GET /api/news?q=query&apiKey=key` - Fetch news articles
- `GET /api/health` - Health check

### Frontend Hook

The `useBlogData` hook provides:
- `posts` - Array of blog posts
- `loading` - Loading state
- `error` - Error message if any
- `refetch` - Function to refresh data

## Usage

### In Components

```tsx
import { useBlogData } from '@/hooks/useBlogData';

const BlogComponent = () => {
  const { posts, loading, error, refetch } = useBlogData();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          {post.url && (
            <a href={post.url} target="_blank" rel="noopener noreferrer">
              Read Full Article
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Blog Post Interface

```tsx
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  url?: string;
  source?: string;
}
```

## Customization

### Adding New RSS Feeds

Edit `src/hooks/useBlogData.ts`:

```tsx
const BLOG_SOURCES = [
  // ... existing sources
  {
    name: 'Your Source',
    url: 'https://your-source.com/rss.xml',
    category: 'Your Category'
  }
];
```

### Adding New Categories

Update the categories array in `src/pages/Blog.tsx`:

```tsx
const categories = ['All', 'Education', 'Comparison', 'Analysis', 'Strategy', 'Tax Planning', 'Market Insights', 'Finance', 'News', 'Your Category'];
```

### Modifying Search Queries

Edit the News API query in `src/hooks/useBlogData.ts`:

```tsx
const response = await fetch(
  `http://localhost:3001/api/news?q=your+search+terms&apiKey=${API_KEY}`
);
```

## Troubleshooting

### CORS Issues
- Make sure the server is running on port 3001
- Check that the server has CORS enabled

### API Key Issues
- Verify your News API key is correct
- Check the `.env` file is in the root directory
- Restart the development server after adding the API key

### RSS Feed Issues
- Some RSS feeds may be blocked or unavailable
- The system will fall back to cached content
- Check the browser console for specific error messages

### Server Connection Issues
- Ensure the server is running: `cd server && npm run dev`
- Check the server logs for error messages
- Verify the server is accessible at `http://localhost:3001`

## Production Deployment

For production, you'll need to:

1. Deploy the server to a hosting service (Heroku, Vercel, etc.)
2. Update the API URLs in `useBlogData.ts` to point to your production server
3. Set up environment variables on your hosting platform
4. Configure CORS settings for your domain

## Security Notes

- Never expose API keys in client-side code
- Use environment variables for sensitive data
- Implement rate limiting on the server
- Validate and sanitize all input data 