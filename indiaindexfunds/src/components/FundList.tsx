import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
  symbol?: string;
  currentPrice?: number;
  marketChange?: number;
}

interface FundListProps {
  funds: FundData[];
}

const FundList = ({ funds }: FundListProps) => {
  const navigate = useNavigate();
  
  const getReturnColor = (returnPercentage: number) => {
    if (returnPercentage > 0) return 'text-green-600';
    if (returnPercentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getReturnIcon = (returnPercentage: number) => {
    if (returnPercentage > 0) return <TrendingUp className="h-4 w-4" />;
    if (returnPercentage < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {funds.map((fund, index) => (
        <motion.div
          key={fund.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            {/* Fund Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{fund.name}</h3>
                  <p className="text-sm text-muted-foreground">{fund.category}</p>
                </div>
                
                {/* Fund Type Badge */}
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">
                    {fund.fundType}
                  </span>
                  <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md">
                    {fund.assetType}
                  </span>
                  <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                    {fund.listedAt}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="flex items-center gap-6">
              {/* Return */}
              <div className="text-right">
                <div className={`flex items-center gap-1 font-semibold ${getReturnColor(fund.returnPercentage)}`}>
                  {getReturnIcon(fund.returnPercentage)}
                  <span>{fund.returnPercentage.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Return</p>
              </div>

              {/* Current Price */}
              {fund.currentPrice && (
                <div className="text-right">
                  <div className="font-medium text-foreground">₹{fund.currentPrice.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Price</p>
                </div>
              )}

              {/* Market Change */}
              {fund.marketChange && (
                <div className="text-right">
                  <div className={`font-medium ${fund.marketChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {fund.marketChange >= 0 ? '+' : ''}₹{fund.marketChange.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">Change</p>
                </div>
              )}

              {/* AUM */}
              {fund.aum && (
                <div className="text-right">
                  <div className="font-medium text-foreground">{fund.aum}</div>
                  <p className="text-xs text-muted-foreground">AUM</p>
                </div>
              )}

              {/* Expense Ratio */}
              {fund.expenseRatio && (
                <div className="text-right">
                  <div className="font-medium text-foreground">{fund.expenseRatio.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">Expense</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 transition-all duration-200"
                >
                  Invest
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:border-primary hover:text-primary transition-all duration-200"
                  onClick={() => navigate(`/fund/${fund.id}`)}
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FundList; 