import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Tag, RefreshCw, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useBlogData, BlogPost } from '@/hooks/useBlogData';

const categories = ['All', 'Index Funds', 'ETF', 'Investment Strategy', 'Market Analysis', 'Portfolio Management', 'Fund Comparison'];

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { posts, loading, error, refetch } = useBlogData();

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Filter posts based on search query and category
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Investment <span className="text-primary">Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed with the latest trends, strategies, and insights in index fund investing
          </p>
        </motion.div>

        {/* Header with Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-0">
            {categories.map((category) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={selectedCategory === category ? "default" : "secondary"}
                  className="px-4 py-2 cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8"
          >
            <p className="text-yellow-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-12"
          >
            <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50">
              <div className="md:flex">
                <div className="md:flex-1 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Featured
                    </Badge>
                    <Badge variant="secondary">{featuredPost.category}</Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.publishedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                    {featuredPost.url ? (
                      <a href={featuredPost.url} target="_blank" rel="noopener noreferrer">
                        <Button className="group">
                          Read Full Article
                          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </a>
                    ) : (
                      <Button className="group">
                        Read Full Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                  </motion.div>
                </div>
                <div className="md:w-96 h-64 md:h-auto">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-primary/60 text-6xl">📊</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Blog Posts Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {regularPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full overflow-hidden bg-card/50 backdrop-blur border-border/50 group cursor-pointer">
                <CardHeader className="p-0">
                  <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative overflow-hidden">
                    <div className="text-primary/60 text-4xl">📈</div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {post.category}
                    </Badge>
                    {post.source && (
                      <Badge variant="outline" className="text-xs">
                        {post.source}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </div>
                    {post.url && (
                      <a 
                        href={post.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Read
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg" className="group">
            Load More Articles
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Blog;