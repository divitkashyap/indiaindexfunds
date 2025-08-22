import React from 'react';
import { TableProperties } from 'lucide-react';
import type { Fund, MetricsDaily } from '../../data/mockData';

interface MetricsTableProps {
  fundA: Fund | null;
  fundB: Fund | null;
  metricsA: MetricsDaily | null;
  metricsB: MetricsDaily | null;
  loading?: boolean;
}

interface MetricRow {
  label: string;
  valueA: string | number;
  valueB: string | number;
  formatAs?: 'percentage' | 'currency' | 'number' | 'ratio';
  higherIsBetter?: boolean;
  description?: string;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ 
  fundA, 
  fundB, 
  metricsA, 
  metricsB, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
                <div className="h-4 bg-gray-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!fundA || !fundB || !metricsA || !metricsB) {
    return (
      <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Fund Metrics</h2>
                <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TableProperties className="w-16 h-16 text-gray-600" />
          </div>
          <div>Select two funds to compare their metrics</div>
        </div>
      </div>
    );
  }

  const formatValue = (value: string | number, format?: string, isHigher?: boolean) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    let formatted = '';
    switch (format) {
      case 'percentage':
        formatted = `${numValue.toFixed(2)}%`;
        break;
      case 'currency':
        formatted = `₹${numValue.toLocaleString('en-IN')}`;
        break;
      case 'ratio':
        formatted = numValue.toFixed(2);
        break;
      default:
        formatted = numValue.toLocaleString('en-IN', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
    }

    const className = isHigher 
      ? 'text-green-400 font-semibold' 
      : 'text-gray-300';
    return <span className={className}>{formatted}</span>;
  };

  const getBetterValue = (valueA: number, valueB: number, higherIsBetter: boolean) => {
    if (Math.abs(valueA - valueB) < 0.01) return 'equal';
    if (higherIsBetter) {
      return valueA > valueB ? 'A' : 'B';
    } else {
      return valueA < valueB ? 'A' : 'B';
    }
  };

  const metrics: MetricRow[] = [
    // Basic Fund Info
    {
      label: 'Expense Ratio',
      valueA: fundA.expense_ratio,
      valueB: fundB.expense_ratio,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'Annual fee charged by fund house'
    },
    {
      label: 'AUM (Crores)',
      valueA: fundA.aum,
      valueB: fundB.aum,
      formatAs: 'currency',
      higherIsBetter: true,
      description: 'Assets Under Management'
    },
    {
      label: 'Min Investment',
      valueA: fundA.min_investment,
      valueB: fundB.min_investment,
      formatAs: 'currency',
      higherIsBetter: false,
      description: 'Minimum investment amount'
    },
    
    // Returns
    {
      label: '1 Day Return',
      valueA: metricsA.returns_1d,
      valueB: metricsB.returns_1d,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 1 day'
    },
    {
      label: '1 Week Return',
      valueA: metricsA.returns_1w,
      valueB: metricsB.returns_1w,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 1 week'
    },
    {
      label: '1 Month Return',
      valueA: metricsA.returns_1m,
      valueB: metricsB.returns_1m,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 1 month'
    },
    {
      label: '3 Month Return',
      valueA: metricsA.returns_3m,
      valueB: metricsB.returns_3m,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 3 months'
    },
    {
      label: '1 Year Return',
      valueA: metricsA.returns_1y,
      valueB: metricsB.returns_1y,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 1 year'
    },
    {
      label: '3 Year Return (Annualized)',
      valueA: metricsA.returns_3y,
      valueB: metricsB.returns_3y,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Annualized return over 3 years'
    },
    
    // Risk Metrics
    {
      label: 'Volatility (1Y)',
      valueA: metricsA.volatility_1y,
      valueB: metricsB.volatility_1y,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'Standard deviation of returns'
    },
    {
      label: 'Sharpe Ratio',
      valueA: metricsA.sharpe_ratio,
      valueB: metricsB.sharpe_ratio,
      formatAs: 'ratio',
      higherIsBetter: true,
      description: 'Risk-adjusted return measure'
    },
    {
      label: 'Alpha',
      valueA: metricsA.alpha,
      valueB: metricsB.alpha,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Excess return vs benchmark'
    },
    {
      label: 'Beta',
      valueA: metricsA.beta,
      valueB: metricsB.beta,
      formatAs: 'ratio',
      higherIsBetter: false,
      description: 'Sensitivity to market movements'
    },
    {
      label: 'Max Drawdown',
      valueA: metricsA.max_drawdown,
      valueB: metricsB.max_drawdown,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Largest peak-to-trough decline'
    }
  ];

  // Add tracking error for index funds
  if (metricsA.tracking_error && metricsB.tracking_error) {
    metrics.push({
      label: 'Tracking Error',
      valueA: metricsA.tracking_error,
      valueB: metricsB.tracking_error,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'How closely fund tracks its benchmark'
    });
  }

  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Fund Metrics</h2>
      
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-2 border-b border-gray-600">
        <div className="text-gray-400 font-medium">Metric</div>
        <div className="text-accent font-medium text-center truncate" title={fundA.scheme_name}>
          {fundA.scheme_name.length > 20 
            ? `${fundA.scheme_name.substring(0, 20)}...` 
            : fundA.scheme_name}
        </div>
        <div className="text-yellow-500 font-medium text-center truncate" title={fundB.scheme_name}>
          {fundB.scheme_name.length > 20 
            ? `${fundB.scheme_name.substring(0, 20)}...` 
            : fundB.scheme_name}
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {metrics.map((metric, index) => {
          const valueA = typeof metric.valueA === 'string' ? parseFloat(metric.valueA) : metric.valueA;
          const valueB = typeof metric.valueB === 'string' ? parseFloat(metric.valueB) : metric.valueB;
          const betterValue = getBetterValue(valueA, valueB, metric.higherIsBetter ?? true);

          return (
            <div 
              key={index} 
              className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-800/30 rounded-lg px-2 group"
              title={metric.description}
            >
              <div className="text-gray-300 font-medium text-sm cursor-help">
                {metric.label}
                {metric.description && (
                  <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-xs text-gray-300 p-2 rounded shadow-lg mt-1 max-w-xs">
                    {metric.description}
                  </div>
                )}
              </div>
              <div className="text-center text-sm">
                {formatValue(
                  metric.valueA,
                  metric.formatAs,
                  betterValue === 'A'
                )}
              </div>
              <div className="text-center text-sm">
                {formatValue(
                  metric.valueB,
                  metric.formatAs,
                  betterValue === 'B'
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Notes */}
      <div className="mt-4 pt-4 border-t border-gray-600 space-y-1">
        <div className="text-xs text-gray-400 text-center">
          <span className="text-green-400">Green values</span> indicate better performance
        </div>
        <div className="text-xs text-gray-500 text-center">
          Hover over metrics for descriptions
        </div>
      </div>
    </div>
  );
};

export default MetricsTable;
