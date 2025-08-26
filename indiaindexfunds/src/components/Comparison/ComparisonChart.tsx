import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, ChevronDown, Calendar } from 'lucide-react';
import type { Fund, BenchmarkIndex } from '../../data/mockData';

export type TimeframeOption = '1Y' | '3Y' | '5Y' | 'custom';

export interface ChartDataPoint {
  date: string;
  navA: number;
  navB: number;
  benchmarkA?: number;
  benchmarkB?: number;
  normalizedNavA?: number;
  normalizedNavB?: number;
  normalizedBenchmarkA?: number;
  normalizedBenchmarkB?: number;
}

interface ComparisonChartProps {
  data: ChartDataPoint[];
  fundA: Fund | null;
  fundB: Fund | null;
  benchmarkData?: BenchmarkIndex[];
  loading?: boolean;
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomDateChange?: (startDate: Date, endDate: Date) => void;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  fundA,
  fundB,
  loading = false,
  selectedTimeframe,
  onTimeframeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const [showBenchmarks, setShowBenchmarks] = useState(true);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const timeframeOptions: { value: TimeframeOption; label: string }[] = [
    { value: '1Y', label: '1 Year' },
    { value: '3Y', label: '3 Years' },
    { value: '5Y', label: '5 Years' },
    { value: 'custom', label: 'Custom' },
  ];

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCustomStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    if (customEndDate && onCustomDateChange) {
      onCustomDateChange(newStartDate, customEndDate);
    }
  };

  const handleCustomEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    if (customStartDate && onCustomDateChange) {
      onCustomDateChange(customStartDate, newEndDate);
    }
  };

  const handleTimeframeSelect = (timeframe: TimeframeOption) => {
    onTimeframeChange(timeframe);
    setShowTimeframeDropdown(false);
    if (timeframe === 'custom') {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  // Custom tooltip formatter
  const formatNormalizedTooltip = (value: number) => {
    return `₹${value}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-80 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!fundA || !fundB || data.length === 0) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-12">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <BarChart3 className="w-16 h-16 text-gray-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select Funds to Compare</h3>
          <p className="text-sm">Choose two funds from the selectors above to see their performance comparison</p>
        </div>
      </div>
    );
  }

  // Calculate performance summary
  const firstDataPoint = data[0];
  const lastDataPoint = data[data.length - 1];
  
  const calculateReturn = (start: number, end: number) => ((end - start) / start * 100);
  
  const fundAReturn = calculateReturn(firstDataPoint.normalizedNavA || firstDataPoint.navA, lastDataPoint.normalizedNavA || lastDataPoint.navA);
    
  const fundBReturn = calculateReturn(firstDataPoint.normalizedNavB || firstDataPoint.navB, lastDataPoint.normalizedNavB || lastDataPoint.navB);

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Performance Comparison</h2>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">{fundA.scheme_name}</span>
              <span className={`font-medium ${fundAReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fundAReturn >= 0 ? '+' : ''}{fundAReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-300">{fundB.scheme_name}</span>
              <span className={`font-medium ${fundBReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fundBReturn >= 0 ? '+' : ''}{fundBReturn.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              {timeframeOptions.find(opt => opt.value === selectedTimeframe)?.label || '1 Year'}
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showTimeframeDropdown && (
              <div className="absolute top-full mt-1 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[120px]">
                {timeframeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeframeSelect(option.value)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      selectedTimeframe === option.value
                        ? 'bg-accent text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showBenchmarks
                ? 'bg-gray-700 text-white border border-green-500'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-600'
            }`}
          >
            {showBenchmarks ? '✓ Benchmark' : 'Benchmark'}
          </button>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {showCustomDatePicker && selectedTimeframe === 'custom' && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate ? formatDateForInput(customStartDate) : ''}
                onChange={handleCustomStartDateChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate ? formatDateForInput(customEndDate) : ''}
                onChange={handleCustomEndDateChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            {customStartDate && customEndDate ? (
              `Custom period: ${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
            ) : (
              'Select custom date range above'
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={formatDate}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={formatNormalizedTooltip}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('en-IN')}`}
            />
            <Legend />
            
            {/* Fund Lines */}
            <Line
              type="monotone"
              dataKey="normalizedNavA"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name={fundA.scheme_name}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="normalizedNavB"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={false}
              name={fundB.scheme_name}
              connectNulls={false}
            />
            
            {/* Benchmark Lines */}
            {showBenchmarks && (
              <>
                <Line
                  type="monotone"
                  dataKey="normalizedBenchmarkA"
                  stroke="#10B981"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={false}
                  name={`${fundA.benchmark_index} (Benchmark A)`}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="normalizedBenchmarkB"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={false}
                  name={`${fundB.benchmark_index} (Benchmark B)`}
                  connectNulls={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">Best Performer</div>
          <div className="text-white font-medium text-sm">
            {fundAReturn > fundBReturn ? fundA.scheme_name : fundB.scheme_name}
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">Outperformance</div>
          <div className={`font-medium text-sm ${Math.abs(fundAReturn - fundBReturn) > 0 ? 'text-blue-400' : 'text-gray-400'}`}>
            {Math.abs(fundAReturn - fundBReturn).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">Data Points</div>
          <div className="text-white font-medium text-sm">{data.length}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-400 text-xs mb-1">Period</div>
          <div className="text-white font-medium text-sm">
            {(() => {
              if (data.length === 0) return 'N/A';
              
              // Calculate actual time span from data
              const firstDate = new Date(data[0].date);
              const lastDate = new Date(data[data.length - 1].date);
              const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // Convert to more readable format
              if (diffDays >= 1460) { // ~4 years
                return `${Math.round(diffDays / 365)} years`;
              } else if (diffDays >= 365) { // ~1 year
                const years = Math.floor(diffDays / 365);
                const months = Math.round((diffDays % 365) / 30.44);
                if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
                return `${years}y ${months}m`;
              } else if (diffDays >= 60) { // ~2 months
                return `${Math.round(diffDays / 30.44)} months`;
              } else {
                return `${diffDays} days`;
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;