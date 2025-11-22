import React from 'react';
import { TableProperties } from 'lucide-react';
import type { Fund, MetricsDaily } from '../../data/mockData';

interface MetricRow {
  label: string;
  valueA: string | number;
  valueB: string | number;
  formatAs: 'percentage' | 'currency' | 'number' | 'ratio';
  higherIsBetter?: boolean;
  description?: string;
  isSection?: boolean; // New property for section headers
}

interface MetricsTableProps {
  fundA: Fund | null;
  fundB: Fund | null;
  metricsA: MetricsDaily | null;
  metricsB: MetricsDaily | null;
  loading?: boolean;
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
        <h2 className="text-2xl font-semibold mb-4 text-white">Fund Metrics</h2>
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <TableProperties className="w-16 h-16 text-gray-600" />
          </div>
          <div>Select two funds to compare their metrics</div>
        </div>
      </div>
    );
  }

  const formatValue = (value: string | number | null | undefined, format?: string, isHigher?: boolean) => {
    if (value === null || value === undefined || (typeof value === 'number' && Number.isNaN(value))) {
      return <span className="text-gray-500">–</span>;
    }

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
      : 'text-gray-100 font-medium';
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
    // Cost & Basic Info Section
    {
      label: '💰 Cost & Basic Info',
      valueA: '',
      valueB: '',
      formatAs: 'number',
      isSection: true,
      description: ''
    },
    {
      label: '💰 Expense Ratio',
      valueA: fundA.expense_ratio,
      valueB: fundB.expense_ratio,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'Annual fee charged by fund house (lower is better)'
    },
    {
      label: '💼 AUM (Crores)',
      valueA: fundA.aum,
      valueB: fundB.aum,
      formatAs: 'currency',
      higherIsBetter: true,
      description: 'Assets Under Management'
    },
    {
      label: '🎯 Min Investment',
      valueA: fundA.min_investment,
      valueB: fundB.min_investment,
      formatAs: 'currency',
      higherIsBetter: false,
      description: 'Minimum investment amount'
    },
    
    // Risk Metrics Section
    {
      label: '⚠️ Risk Metrics',
      valueA: '',
      valueB: '',
      formatAs: 'number',
      isSection: true,
      description: ''
    },
    {
      label: '⚠️ Risk (Volatility 1Y)',
      valueA: metricsA.volatility_1y,
      valueB: metricsB.volatility_1y,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'Standard deviation of returns (lower is less risky)'
    },
    {
      label: '📊 Sharpe Ratio',
      valueA: (metricsA as any).sharpe_ratio ?? (metricsA as any).sharpe_ratio_1y,
      valueB: (metricsB as any).sharpe_ratio ?? (metricsB as any).sharpe_ratio_1y,
      formatAs: 'ratio',
      higherIsBetter: true,
      description: 'Risk-adjusted return measure (higher is better)'
    },
    {
      label: '📉 Max Drawdown',
      valueA: (metricsA as any).max_drawdown ?? (metricsA as any).max_drawdown_1y,
      valueB: (metricsB as any).max_drawdown ?? (metricsB as any).max_drawdown_1y,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Largest peak-to-trough decline (higher is better)'
    },
    // Beta is not available from NAV-only metrics; skip for now
    
    // Returns Section
    {
      label: '📈 Returns Performance',
      valueA: '',
      valueB: '',
      formatAs: 'number',
      isSection: true,
      description: ''
    },
    {
      label: '📈 1 Year Return',
      valueA: (metricsA as any).total_return_1y ?? (metricsA as any).returns_1y,
      valueB: (metricsB as any).total_return_1y ?? (metricsB as any).returns_1y,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Return over last 1 year'
    },
    {
      label: '📈 3 Year Return (Annualized)',
      valueA: (metricsA as any).annualized_return_3y ?? (metricsA as any).returns_3y,
      valueB: (metricsB as any).annualized_return_3y ?? (metricsB as any).returns_3y,
      formatAs: 'percentage',
      higherIsBetter: true,
      description: 'Annualized return over 3 years'
    },
    
    // Advanced Metrics
    {
      label: '🔬 Advanced Metrics',
      valueA: '',
      valueB: '',
      formatAs: 'number',
      isSection: true,
      description: ''
    },
    // Alpha is not available from NAV-only metrics; skip for now
  ];

  // Add tracking error for index funds
  if ((metricsA as any).tracking_error && (metricsB as any).tracking_error) {
    metrics.push({
      label: 'Tracking Error',
      valueA: (metricsA as any).tracking_error,
      valueB: (metricsB as any).tracking_error,
      formatAs: 'percentage',
      higherIsBetter: false,
      description: 'How closely fund tracks its benchmark'
    });
  }

  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
      <h2 className="text-3xl font-semibold mb-5 text-white tracking-tight">Fund Metrics</h2>
      
      {/* Table Header */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-3 border-b border-gray-700">
        <div className="text-white font-semibold text-sm uppercase tracking-wide">Metric</div>
        <div className="text-sky-400 font-semibold text-center text-sm" title={fundA.scheme_name}>
          {fundA.scheme_name}
        </div>
        <div className="text-yellow-400 font-semibold text-center text-sm" title={fundB.scheme_name}>
          {fundB.scheme_name}
        </div>
      </div>

      {/* Table Rows */}
      <div className="space-y-2">
        {metrics.map((metric, index) => {
          // Handle section headers
          if (metric.isSection) {
            return (
              <div 
                key={index} 
                className="grid grid-cols-3 gap-4 py-3 mt-4 first:mt-0"
              >
                <div className="col-span-3 text-center">
                  <div className="text-white font-semibold text-xs tracking-wide border-b border-accent/30 pb-1 uppercase">
                    {metric.label}
                  </div>
                </div>
              </div>
            );
          }

          const valueA = typeof metric.valueA === 'string' ? parseFloat(metric.valueA) : metric.valueA;
          const valueB = typeof metric.valueB === 'string' ? parseFloat(metric.valueB) : metric.valueB;
          const betterValue = getBetterValue(valueA, valueB, metric.higherIsBetter ?? true);

          return (
            <div 
              key={index} 
              className="grid grid-cols-3 gap-4 py-2.5 rounded-lg px-3 group transition-colors duration-150 hover:bg-gray-800/40"
              title={metric.description}
            >
              <div className="text-gray-100 font-medium text-sm cursor-help flex items-center gap-2">
                {metric.label}
                {metric.description && (
                  <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-xs text-gray-200 p-2 rounded shadow-lg mt-1 max-w-xs">
                    {metric.description}
                  </div>
                )}
              </div>
              <div className="text-center text-base">
                {formatValue(
                  metric.valueA,
                  metric.formatAs,
                  betterValue === 'A'
                )}
              </div>
              <div className="text-center text-base">
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
      <div className="mt-4 pt-4 border-t border-gray-700 space-y-1">
        <div className="text-xs text-gray-400 text-center">
          <span className="text-green-400">Green values</span> indicate better performance
        </div>
        <div className="text-xs text-gray-400 text-center">
          Hover over metrics for descriptions
        </div>
      </div>
    </div>
  );
};

export default MetricsTable;
