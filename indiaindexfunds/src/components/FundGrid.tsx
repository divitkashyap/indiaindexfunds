import { motion } from 'framer-motion';
import FundCard from './FundCard';
import FundList from './FundList';

interface FundData {
  id: string;
  name: string;
  returnPercentage: number;
  aum?: string;
  expenseRatio?: number;
  category?: string;
  fundType: 'ETF' | 'Index Fund';
  assetType: 'Equity' | 'Debt';
  listedAt: 'NSE' | 'BSE' | 'Both';
}

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
  const fundData: FundData[] = [
    {
      id: '1',
      name: 'Bandhan Nifty 50',
      returnPercentage: 11.55,
      aum: '$12M',
      category: 'Large Cap Equity',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '2',
      name: 'Motilal Oswal Nifty 500',
      returnPercentage: 12.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '3',
      name: 'UTI Nifty 50 Index',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '4',
      name: 'ICICI Prudential Nifty 50',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Equity Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '5',
      name: 'HDFC BSE Sensex',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '6',
      name: 'TATA BSE Sensex',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '7',
      name: 'SBI Nifty 50 ETF',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '8',
      name: 'Axis Nifty 50',
      returnPercentage: -1.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Debt',
      listedAt: 'NSE'
    },
    {
      id: '9',
      name: 'Kotak Nifty 50',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Equity Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '10',
      name: 'Aditya Birla Nifty 50',
      returnPercentage: 12.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '11',
      name: 'DSP Nifty 50 Index',
      returnPercentage: 11.55,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '12',
      name: 'Franklin Nifty 50',
      returnPercentage: 9.85,
      expenseRatio: 0.08,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '13',
      name: 'Reliance Nifty 50',
      returnPercentage: 13.25,
      expenseRatio: 0.12,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '14',
      name: 'L&T Nifty 50',
      returnPercentage: 10.75,
      expenseRatio: 0.09,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '15',
      name: 'Mirae Nifty 50',
      returnPercentage: 14.35,
      expenseRatio: 0.11,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '16',
      name: 'Edelweiss Nifty 50',
      returnPercentage: 8.95,
      expenseRatio: 0.07,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '17',
      name: 'Canara Robeco Nifty 50',
      returnPercentage: 11.85,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '18',
      name: 'PGIM Nifty 50',
      returnPercentage: 12.45,
      expenseRatio: 0.09,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '19',
      name: 'Mahindra Nifty 50',
      returnPercentage: 10.25,
      expenseRatio: 0.08,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Debt',
      listedAt: 'NSE'
    },
    {
      id: '20',
      name: 'Sundaram Nifty 50',
      returnPercentage: 13.75,
      expenseRatio: 0.11,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '21',
      name: 'Quantum Nifty 50',
      returnPercentage: 9.55,
      expenseRatio: 0.06,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'Both'
    },
    {
      id: '22',
      name: 'Taurus Nifty 50',
      returnPercentage: 11.15,
      expenseRatio: 0.10,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'NSE'
    },
    {
      id: '23',
      name: 'Union Nifty 50',
      returnPercentage: 12.85,
      expenseRatio: 0.09,
      category: 'Index Fund',
      fundType: 'Index Fund',
      assetType: 'Equity',
      listedAt: 'BSE'
    },
    {
      id: '24',
      name: 'JM Financial Nifty 50',
      returnPercentage: 10.45,
      expenseRatio: 0.08,
      category: 'Index Fund',
      fundType: 'ETF',
      assetType: 'Equity',
      listedAt: 'Both'
    }
  ];

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