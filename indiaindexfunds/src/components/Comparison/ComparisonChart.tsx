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
import { BarChart3 } from 'lucide-react';
import type { Fund, BenchmarkIndex } from '../../data/mockData';

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
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  fundA,
  fundB,
  benchmarkData = [],
  loading = false
}) => {
  const [viewMode, setViewMode] = useState<'absolute' | 'normalized'>('normalized');
  const [showBenchmarks, setShowBenchmarks] = useState(true);

  // Custom tooltip formatter
  const formatTooltip = (value: number, name: string) => {
    return [`₹${value.toFixed(2)}`, name];
  };

  // Format axis labels
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Normalized tooltip formatter
  const formatNormalizedTooltip = (value: number, name: string) => {
    return `₹${value}`;
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
  
  const fundAReturn = viewMode === 'normalized' 
    ? calculateReturn(firstDataPoint.normalizedNavA || firstDataPoint.navA, lastDataPoint.normalizedNavA || lastDataPoint.navA)
    : calculateReturn(firstDataPoint.navA, lastDataPoint.navA);
    
  const fundBReturn = viewMode === 'normalized' 
    ? calculateReturn(firstDataPoint.normalizedNavB || firstDataPoint.navB, lastDataPoint.normalizedNavB || lastDataPoint.navB)
    : calculateReturn(firstDataPoint.navB, lastDataPoint.navB);

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
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('normalized')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'normalized'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Normalized
            </button>
            <button
              onClick={() => setViewMode('absolute')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'absolute'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Absolute
            </button>
          </div>
          
          <button
            onClick={() => setShowBenchmarks(!showBenchmarks)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              showBenchmarks
                ? 'bg-gray-700 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Benchmark
          </button>
        </div>
      </div>

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
              tickFormatter={viewMode === 'normalized' ? undefined : formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              formatter={viewMode === 'normalized' ? formatNormalizedTooltip : formatTooltip}
              labelFormatter={(label) => `Date: ${new Date(label).toLocaleDateString('en-IN')}`}
            />
            <Legend />
            
            {/* Fund Lines */}
            <Line
              type="monotone"
              dataKey={viewMode === 'normalized' ? 'normalizedNavA' : 'navA'}
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name={fundA.scheme_name}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey={viewMode === 'normalized' ? 'normalizedNavB' : 'navB'}
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
                  dataKey={viewMode === 'normalized' ? 'normalizedBenchmarkA' : 'benchmarkA'}
                  stroke="#10B981"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Benchmark A"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey={viewMode === 'normalized' ? 'normalizedBenchmarkB' : 'benchmarkB'}
                  stroke="#F59E0B"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Benchmark B"
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
            {data.length > 0 ? `${Math.round(data.length / 30)} months` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;