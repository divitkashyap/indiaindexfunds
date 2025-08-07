import { motion } from 'framer-motion';
import FundCard from './FundCard';
import FundList from './FundList';
import { getAllFunds, FundData } from '@/lib/fundData';



interface FilterState {
  fundType: string;
  assetType: string;
  listedAt: string;
}

interface FundGridProps {
  filters: FilterState;
  viewMode: 'cards' | 'list';
  searchQuery: string;
}

const FundGrid = ({ filters, viewMode, searchQuery }: FundGridProps) => {
  const fundData = getAllFunds();

  // Filter the funds based on selected filters and search query
  const filteredFunds = fundData.filter((fund) => {
    const fundTypeMatch = filters.fundType === 'All' || fund.fundType === filters.fundType;
    const assetTypeMatch = filters.assetType === 'All' || fund.assetType === filters.assetType;
    const listedAtMatch = filters.listedAt === 'All' || fund.listedAt === filters.listedAt;
    
    // Search functionality
    const searchMatch = searchQuery === '' || 
      fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fund.category && fund.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      fund.fundType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fund.listedAt.toLowerCase().includes(searchQuery.toLowerCase());
    
    return fundTypeMatch && assetTypeMatch && listedAtMatch && searchMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex-1"
    >
      {/* View Mode Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-foreground">
            {viewMode === 'cards' ? 'Grid View' : 'List View'}
          </h2>
          <span className="text-sm text-muted-foreground">
            ({filteredFunds.length} funds)
          </span>
          {searchQuery && (
            <span className="text-sm text-primary">
              • Search: "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {filteredFunds.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No funds match your current filters.</p>
          <p className="text-sm text-muted-foreground mt-2">Try adjusting your filter criteria.</p>
        </div>
      ) : viewMode === 'list' ? (
        <FundList funds={filteredFunds} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {filteredFunds.map((fund, index) => (
            <FundCard
              key={fund.id}
              fund={fund}
              index={index}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FundGrid;