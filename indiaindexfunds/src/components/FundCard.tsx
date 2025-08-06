import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FundData {
  id: string;
  name: string;
  returnPercentage: number;
  aum?: string;
  expenseRatio?: number;
  category?: string;
}

interface FundCardProps {
  fund: FundData;
  index: number;
}

const FundCard = ({ fund, index }: FundCardProps) => {
  const navigate = useNavigate();
  const isPositive = fund.returnPercentage > 0;
  const isNegative = fund.returnPercentage < 0;

  const getReturnColor = () => {
    if (isPositive) return 'text-positive';
    if (isNegative) return 'text-negative';
    return 'text-neutral';
  };

  const getReturnIcon = () => {
    if (isPositive) return <TrendingUp className="h-4 w-4" />;
    if (isNegative) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-hover group">
        <CardContent className="p-6 h-full flex flex-col justify-between">
          {/* Fund Name */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {fund.name}
            </h3>
            {fund.category && (
              <p className="text-sm text-muted-foreground mt-1">{fund.category}</p>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3 mb-6">
            {/* Return */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Return</span>
              <div className={`flex items-center gap-1 font-semibold ${getReturnColor()}`}>
                {getReturnIcon()}
                <span>{fund.returnPercentage.toFixed(2)}%</span>
              </div>
            </div>

            {/* AUM */}
            {fund.aum && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AUM</span>
                <span className="text-sm font-medium text-foreground">{fund.aum}</span>
              </div>
            )}

            {/* Expense Ratio */}
            {fund.expenseRatio && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expense Ratio</span>
                <span className="text-sm font-medium text-foreground">{fund.expenseRatio.toFixed(2)}%</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200"
            >
              Invest Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-border hover:border-primary hover:text-primary transition-all duration-200"
              onClick={() => navigate(`/fund/${fund.id}`)}
            >
              Know More
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FundCard;