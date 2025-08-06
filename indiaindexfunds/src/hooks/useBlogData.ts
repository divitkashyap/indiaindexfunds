import { useState, useEffect } from 'react';

export interface BlogPost {
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

interface BlogDataState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
}

// Sample blog sources for index funds
const BLOG_SOURCES = [
  {
    name: 'MoneyControl Index Funds',
    url: 'https://www.moneycontrol.com/rss/mf.xml',
    category: 'Index Funds'
  },
  {
    name: 'Economic Times Markets',
    url: 'https://economictimes.indiatimes.com/rss.cms',
    category: 'Market Analysis'
  },
  {
    name: 'Livemint Markets',
    url: 'https://www.livemint.com/rss/markets',
    category: 'Market Analysis'
  },
  {
    name: 'Business Standard Markets',
    url: 'https://www.business-standard.com/rss/markets-106.rss',
    category: 'Market Analysis'
  },
  {
    name: 'Financial Express Markets',
    url: 'https://www.financialexpress.com/feed/',
    category: 'Investment Strategy'
  },
  {
    name: 'NDTV Profit',
    url: 'https://www.ndtv.com/business/market/rss',
    category: 'Market Analysis'
  }
];

// Fallback data when APIs are not available
const FALLBACK_POSTS: BlogPost[] = [
  // Index Funds Category (5+ articles)
  {
    id: '1',
    title: 'Understanding Index Funds: A Beginner\'s Complete Guide',
    excerpt: 'Learn the fundamentals of index funds, how they work, and why they might be perfect for your investment portfolio.',
    author: 'Sarah Chen',
    publishedAt: '2024-01-15',
    readTime: '8 min read',
    category: 'Index Funds',
    image: '/placeholder.svg',
    featured: true,
    source: 'India Index Funds'
  },
  {
    id: '2',
    title: 'The Complete Guide to Index Fund Investing in India',
    excerpt: 'Everything you need to know about investing in index funds in the Indian market, from basics to advanced strategies.',
    author: 'Rahul Sharma',
    publishedAt: '2024-01-14',
    readTime: '10 min read',
    category: 'Index Funds',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '3',
    title: 'Why Index Funds Are the Smart Choice for Indian Investors',
    excerpt: 'Discover why index funds are becoming increasingly popular among Indian investors and how they can benefit your portfolio.',
    author: 'Priya Patel',
    publishedAt: '2024-01-13',
    readTime: '6 min read',
    category: 'Index Funds',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '4',
    title: 'Index Funds vs Active Funds: The Great Debate',
    excerpt: 'A detailed comparison of index funds versus actively managed funds, helping you make an informed investment decision.',
    author: 'Amit Kumar',
    publishedAt: '2024-01-12',
    readTime: '9 min read',
    category: 'Index Funds',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '5',
    title: 'How to Choose the Right Index Fund for Your Goals',
    excerpt: 'Step-by-step guide to selecting the perfect index fund based on your investment objectives and risk tolerance.',
    author: 'Neha Singh',
    publishedAt: '2024-01-11',
    readTime: '7 min read',
    category: 'Index Funds',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },

  // ETF Category (5+ articles)
  {
    id: '6',
    title: 'ETF vs Index Funds: Which Should You Choose?',
    excerpt: 'A comprehensive comparison between ETFs and index funds to help you make the right investment decision.',
    author: 'Michael Rodriguez',
    publishedAt: '2024-01-10',
    readTime: '6 min read',
    category: 'ETF',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '7',
    title: 'Top 10 ETFs for Indian Investors in 2024',
    excerpt: 'Our expert analysis of the best ETFs available in India, covering various sectors and investment themes.',
    author: 'David Kim',
    publishedAt: '2024-01-09',
    readTime: '12 min read',
    category: 'ETF',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '8',
    title: 'Understanding ETF Liquidity and Trading Strategies',
    excerpt: 'Learn about ETF liquidity, trading strategies, and how to maximize your returns through smart ETF investing.',
    author: 'Suresh Reddy',
    publishedAt: '2024-01-08',
    readTime: '8 min read',
    category: 'ETF',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '9',
    title: 'Sector ETFs: Diversifying Your Portfolio with Thematic Investing',
    excerpt: 'Explore how sector ETFs can help you diversify your portfolio and capitalize on specific market trends.',
    author: 'Anjali Desai',
    publishedAt: '2024-01-07',
    readTime: '7 min read',
    category: 'ETF',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '10',
    title: 'International ETFs: Expanding Your Investment Horizon',
    excerpt: 'Discover the benefits of international ETFs and how they can help you access global markets from India.',
    author: 'Vikram Malhotra',
    publishedAt: '2024-01-06',
    readTime: '9 min read',
    category: 'ETF',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },

  // Investment Strategy Category (5+ articles)
  {
    id: '11',
    title: 'Index Fund Investment Strategy for Long-term Growth',
    excerpt: 'Understanding the best strategies for investing in index funds for long-term wealth creation.',
    author: 'Raj Patel',
    publishedAt: '2024-01-05',
    readTime: '7 min read',
    category: 'Investment Strategy',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '12',
    title: 'Dollar-Cost Averaging with Index Funds: A Proven Strategy',
    excerpt: 'Learn how dollar-cost averaging can help you build wealth steadily through index fund investments.',
    author: 'Meera Iyer',
    publishedAt: '2024-01-04',
    readTime: '6 min read',
    category: 'Investment Strategy',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '13',
    title: 'Asset Allocation Strategies Using Index Funds',
    excerpt: 'Master the art of asset allocation using index funds to create a balanced and diversified portfolio.',
    author: 'Karan Johar',
    publishedAt: '2024-01-03',
    readTime: '10 min read',
    category: 'Investment Strategy',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '14',
    title: 'Rebalancing Your Index Fund Portfolio: When and How',
    excerpt: 'Essential guide to rebalancing your index fund portfolio to maintain optimal asset allocation.',
    author: 'Deepika Sharma',
    publishedAt: '2024-01-02',
    readTime: '8 min read',
    category: 'Investment Strategy',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '15',
    title: 'Tax-Efficient Index Fund Investing Strategies',
    excerpt: 'Learn how to minimize tax liability while maximizing returns from your index fund investments.',
    author: 'Arun Jaitley',
    publishedAt: '2024-01-01',
    readTime: '9 min read',
    category: 'Investment Strategy',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },

  // Market Analysis Category (5+ articles)
  {
    id: '16',
    title: 'Top 10 Index Funds for 2024: Expert Analysis',
    excerpt: 'Our expert team analyzes the best performing index funds and what makes them stand out in today\'s market.',
    author: 'David Kim',
    publishedAt: '2024-01-10',
    readTime: '12 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '17',
    title: 'Market Volatility: How Index Funds Weather the Storm',
    excerpt: 'Analyzing how index funds perform during market downturns and why they remain a solid long-term choice.',
    author: 'Lisa Chang',
    publishedAt: '2024-01-09',
    readTime: '9 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '18',
    title: 'Sector Rotation Strategies Using Index Funds',
    excerpt: 'Explore how to use sector-specific index funds to capitalize on market trends and economic cycles.',
    author: 'Ravi Teja',
    publishedAt: '2024-01-08',
    readTime: '11 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '19',
    title: 'Market Timing vs Buy-and-Hold: Index Fund Edition',
    excerpt: 'Debunking market timing myths and why buy-and-hold strategy works best with index funds.',
    author: 'Sanjay Gupta',
    publishedAt: '2024-01-07',
    readTime: '8 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '20',
    title: 'Economic Indicators and Their Impact on Index Funds',
    excerpt: 'Understanding how economic indicators affect index fund performance and how to use this knowledge.',
    author: 'Nisha Rao',
    publishedAt: '2024-01-06',
    readTime: '10 min read',
    category: 'Market Analysis',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },

  // Portfolio Management Category (5+ articles)
  {
    id: '21',
    title: 'How to Build a Diversified Portfolio with Index Funds',
    excerpt: 'Step-by-step guide to creating a well-balanced investment portfolio using index funds and ETFs.',
    author: 'Emma Thompson',
    publishedAt: '2024-01-08',
    readTime: '10 min read',
    category: 'Portfolio Management',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '22',
    title: 'Risk Management in Index Fund Portfolios',
    excerpt: 'Essential risk management strategies to protect your index fund investments while maximizing returns.',
    author: 'Amitabh Bachchan',
    publishedAt: '2024-01-07',
    readTime: '9 min read',
    category: 'Portfolio Management',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '23',
    title: 'Creating a Core-Satellite Portfolio with Index Funds',
    excerpt: 'Learn how to build a core-satellite portfolio using index funds as the foundation for long-term growth.',
    author: 'Priyanka Chopra',
    publishedAt: '2024-01-06',
    readTime: '11 min read',
    category: 'Portfolio Management',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '24',
    title: 'Monitoring and Reviewing Your Index Fund Portfolio',
    excerpt: 'Best practices for monitoring your index fund portfolio and when to make adjustments.',
    author: 'Shah Rukh Khan',
    publishedAt: '2024-01-05',
    readTime: '7 min read',
    category: 'Portfolio Management',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '25',
    title: 'Retirement Planning with Index Funds: A Complete Guide',
    excerpt: 'Comprehensive guide to using index funds for retirement planning and building long-term wealth.',
    author: 'Aishwarya Rai',
    publishedAt: '2024-01-04',
    readTime: '12 min read',
    category: 'Portfolio Management',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },

  // Fund Comparison Category (5+ articles)
  {
    id: '26',
    title: 'Nifty 50 vs Sensex Index Funds: Which to Choose?',
    excerpt: 'Detailed comparison of Nifty 50 and Sensex index funds to help you make the right choice.',
    author: 'Hrithik Roshan',
    publishedAt: '2024-01-03',
    readTime: '8 min read',
    category: 'Fund Comparison',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '27',
    title: 'Large Cap vs Mid Cap Index Funds: Performance Analysis',
    excerpt: 'Comprehensive analysis of large cap versus mid cap index funds and their historical performance.',
    author: 'Deepika Padukone',
    publishedAt: '2024-01-02',
    readTime: '10 min read',
    category: 'Fund Comparison',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '28',
    title: 'International Index Funds: US vs Emerging Markets',
    excerpt: 'Compare international index funds focusing on US markets versus emerging markets for diversification.',
    author: 'Ranbir Kapoor',
    publishedAt: '2024-01-01',
    readTime: '9 min read',
    category: 'Fund Comparison',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '29',
    title: 'Sector Index Funds: Technology vs Healthcare vs Financials',
    excerpt: 'Detailed comparison of sector-specific index funds and their role in portfolio diversification.',
    author: 'Alia Bhatt',
    publishedAt: '2023-12-31',
    readTime: '11 min read',
    category: 'Fund Comparison',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  },
  {
    id: '30',
    title: 'ESG Index Funds vs Traditional Index Funds',
    excerpt: 'Understanding the differences between ESG-focused index funds and traditional index funds.',
    author: 'Kareena Kapoor',
    publishedAt: '2023-12-30',
    readTime: '7 min read',
    category: 'Fund Comparison',
    image: '/placeholder.svg',
    source: 'India Index Funds'
  }
];

export const useBlogData = () => {
  const [state, setState] = useState<BlogDataState>({
    posts: [],
    loading: true,
    error: null
  });

  const fetchRSSFeed = async (url: string): Promise<BlogPost[]> => {
    try {
      const response = await fetch(`http://localhost:3001/api/rss/${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.rss && data.rss.channel && data.rss.channel[0].item) {
        const items = data.rss.channel[0].item;
        
        return items.map((item: any, index: number) => ({
          id: `rss-${index}`,
          title: item.title?.[0] || 'Untitled',
          excerpt: item.description?.[0] || '',
          author: item.author?.[0] || 'Unknown',
          publishedAt: item.pubDate?.[0] || new Date().toISOString(),
          readTime: '5 min read',
          category: 'Index Funds',
          image: '/placeholder.svg',
          url: item.link?.[0],
          source: 'RSS Feed'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  };

  const fetchNewsAPI = async (): Promise<BlogPost[]> => {
    try {
      // You'll need to get an API key from https://newsapi.org/
      const API_KEY = process.env.REACT_APP_NEWS_API_KEY || 'your-api-key-here';
      const response = await fetch(
        `http://localhost:3001/api/news?q=index+funds+ETF+passive+investing&apiKey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('News API request failed');
      }
      
      const data = await response.json();
      
      return data.articles?.map((article: any, index: number) => ({
        id: `news-${index}`,
        title: article.title,
        excerpt: article.description || '',
        author: article.author || 'Unknown',
        publishedAt: article.publishedAt,
        readTime: '5 min read',
        category: 'Index Funds',
        image: article.urlToImage || '/placeholder.svg',
        url: article.url,
        source: article.source?.name || 'News API'
      })) || [];
    } catch (error) {
      console.error('Error fetching news API:', error);
      return [];
    }
  };

  const fetchBlogData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let allPosts: BlogPost[] = [];

      // Try to fetch from News API first
      try {
        const newsPosts = await fetchNewsAPI();
        allPosts = [...allPosts, ...newsPosts];
      } catch (error) {
        console.log('News API not available, using fallback data');
      }

      // Try to fetch from RSS feeds
      for (const source of BLOG_SOURCES) {
        try {
          const rssPosts = await fetchRSSFeed(source.url);
          allPosts = [...allPosts, ...rssPosts];
        } catch (error) {
          console.log(`RSS feed ${source.name} not available`);
        }
      }

      // If no external data is available, use fallback data
      if (allPosts.length === 0) {
        allPosts = FALLBACK_POSTS;
      }

      // Sort by date and limit to recent posts
      const sortedPosts = allPosts
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 20);

      setState({
        posts: sortedPosts,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        posts: FALLBACK_POSTS,
        loading: false,
        error: 'Failed to fetch blog data, showing cached content'
      });
    }
  };

  useEffect(() => {
    fetchBlogData();
  }, []);

  const refetch = () => {
    fetchBlogData();
  };

  return {
    ...state,
    refetch
  };
}; 