import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import FundGrid from '@/components/FundGrid';
import Footer from '@/components/Footer';

const Screener = () => {
  const [filters, setFilters] = useState({
    fundType: 'All',
    assetType: 'All',
    listedAt: 'All'
  });

  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleFilterCollapse = () => {
    setIsFilterCollapsed(!isFilterCollapsed);
  };

  const handleViewModeChange = (mode: 'cards' | 'list') => {
    setViewMode(mode);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
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
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className={`${isFilterCollapsed ? 'lg:w-0' : 'lg:w-80'} flex-shrink-0 transition-all duration-300`}>
            <FilterSidebar 
              filters={filters}
              onFilterChange={handleFilterChange}
              isCollapsed={isFilterCollapsed}
              onToggleCollapse={toggleFilterCollapse}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 min-w-0 lg:pt-0 pt-4">
            <FundGrid filters={filters} viewMode={viewMode} searchQuery={searchQuery} />
          </div>
        </div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Screener; 