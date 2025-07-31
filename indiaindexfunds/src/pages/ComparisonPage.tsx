import React, { useState, useEffect } from 'react';
import FundSelector from '../components/Comparison/FundSelector';
import TimeframeToggle from '../components/Comparison/TimeframeToggle';
import ComparisonChart from '../components/Comparison/ComparisonChart';
import MetricsTable from '../components/Comparison/MetricsTable';
import InvestButton from '../components/Comparison/InvestButton';
import type { TimeframeOption } from '../components/Comparison/TimeframeToggle';
import type { ChartDataPoint } from '../components/Comparison/ComparisonChart';
import { mockData, type Fund as MockFund, type MetricsDaily } from '../data/mockData';

const ComparisonPage: React.FC = () => {
  const [selectedFunds, setSelectedFunds] = useState<{ fundA: MockFund | null; fundB: MockFund | null }>({
    fundA: null,
    fundB: null,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1Y');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [metricsA, setMetricsA] = useState<MetricsDaily | null>(null);
  const [metricsB, setMetricsB] = useState<MetricsDaily | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate data fetching
  useEffect(() => {
    if (selectedFunds.fundA && selectedFunds.fundB) {
      setIsLoading(true);
      
      // Simulate API call delay
      const timer = setTimeout(() => {
        // Get NAV data for both funds
        const navDataA = mockData.navData.filter(nav => nav.fund_id === selectedFunds.fundA!.id);
        const navDataB = mockData.navData.filter(nav => nav.fund_id === selectedFunds.fundB!.id);
        
        // Get benchmark data
        const benchmarkDataA = mockData.benchmarkData.filter(
          bench => bench.index_name === selectedFunds.fundA!.benchmark_index
        );
        const benchmarkDataB = mockData.benchmarkData.filter(
          bench => bench.index_name === selectedFunds.fundB!.benchmark_index
        );

        console.log('Fund A benchmark:', selectedFunds.fundA!.benchmark_index);
        console.log('Fund B benchmark:', selectedFunds.fundB!.benchmark_index);
        console.log('Benchmark data A:', benchmarkDataA.length);
        console.log('Benchmark data B:', benchmarkDataB.length);

        // Filter data based on timeframe
        let startDate: Date;
        const now = new Date();
        
        if (selectedTimeframe === 'custom' && customStartDate && customEndDate) {
          startDate = customStartDate;
        } else {
          const monthsBack = selectedTimeframe === '1Y' ? 12 : selectedTimeframe === '3Y' ? 36 : 60;
          startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
        }

        const endDate = selectedTimeframe === 'custom' && customEndDate ? customEndDate : now;

        // Create chart data by combining NAV and benchmark data
        const chartPoints: ChartDataPoint[] = [];
        
        navDataA.forEach(navA => {
          const navB = navDataB.find(nav => nav.date === navA.date);
          const benchA = benchmarkDataA.find(bench => bench.date === navA.date);
          const benchB = benchmarkDataB.find(bench => bench.date === navA.date);
          
          const pointDate = new Date(navA.date);
          if (navB && pointDate >= startDate && pointDate <= endDate) {
            const point: ChartDataPoint = {
              date: navA.date,
              navA: navA.nav,
              navB: navB.nav,
              benchmarkA: benchA?.value,
              benchmarkB: benchB?.value,
            };
            
            // Debug log for first few points
            if (chartPoints.length < 3) {
              console.log('Chart point:', point);
            }
            
            chartPoints.push(point);
          }
        });

        // Sort by date
        chartPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calculate normalized values (starting from 100 for the first data point)
        if (chartPoints.length > 0) {
          const firstPoint = chartPoints[0];
          const baseNavA = firstPoint.navA;
          const baseNavB = firstPoint.navB;
          const baseBenchmarkA = firstPoint.benchmarkA;
          const baseBenchmarkB = firstPoint.benchmarkB;

          chartPoints.forEach(point => {
            point.normalizedNavA = (point.navA / baseNavA) * 100;
            point.normalizedNavB = (point.navB / baseNavB) * 100;
            point.normalizedBenchmarkA = baseBenchmarkA ? (point.benchmarkA! / baseBenchmarkA) * 100 : undefined;
            point.normalizedBenchmarkB = baseBenchmarkB ? (point.benchmarkB! / baseBenchmarkB) * 100 : undefined;
          });
        }

        // Get metrics data
        const fundAMetrics = mockData.metrics.find(metric => metric.fund_id === selectedFunds.fundA!.id);
        const fundBMetrics = mockData.metrics.find(metric => metric.fund_id === selectedFunds.fundB!.id);

        setChartData(chartPoints);
        setMetricsA(fundAMetrics || null);
        setMetricsB(fundBMetrics || null);
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setChartData([]);
      setMetricsA(null);
      setMetricsB(null);
    }
  }, [selectedFunds, selectedTimeframe, customStartDate, customEndDate]);

  const handleFundSelect = (fundA: MockFund | null, fundB: MockFund | null) => {
    setSelectedFunds({ fundA, fundB });
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    setSelectedTimeframe(timeframe);
  };

  const handleCustomDateChange = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  return (
    <div className="min-h-screen w-full p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fund Comparison</h1>
          <p className="text-gray-300 text-lg">
            Compare performance and metrics of Indian index funds
          </p>
        </div>

        {/* Fund Selector */}
        <FundSelector
          funds={mockData.funds}
          categories={mockData.categories}
          onFundSelect={handleFundSelect}
          selectedFunds={selectedFunds}
        />

        {/* Timeframe Toggle */}
        <TimeframeToggle
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={handleTimeframeChange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomDateChange={handleCustomDateChange}
        />

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart - Takes 2 columns on XL screens */}
          <div className="xl:col-span-2">
            <ComparisonChart
              data={chartData}
              fundA={selectedFunds.fundA}
              fundB={selectedFunds.fundB}
              benchmarkData={mockData.benchmarkData}
              loading={isLoading}
            />
          </div>

          {/* Metrics Table - Takes 1 column on XL screens */}
          <div className="xl:col-span-1">
            <MetricsTable
              fundA={selectedFunds.fundA}
              fundB={selectedFunds.fundB}
              metricsA={metricsA}
              metricsB={metricsB}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Investment Buttons */}
        {(selectedFunds.fundA || selectedFunds.fundB) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedFunds.fundA?.scheme_name || 'Fund A'}
              </h3>
              <InvestButton
                slug={selectedFunds.fundA?.slug || ''}
                fundName={selectedFunds.fundA?.scheme_name || 'Fund A'}
                disabled={!selectedFunds.fundA}
              />
            </div>
            
            <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedFunds.fundB?.scheme_name || 'Fund B'}
              </h3>
              <InvestButton
                slug={selectedFunds.fundB?.slug || ''}
                fundName={selectedFunds.fundB?.scheme_name || 'Fund B'}
                disabled={!selectedFunds.fundB}
              />
            </div>
          </div>
        )}

        {/* Popular Comparisons */}
        <div className="mt-8 bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Popular Comparisons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockData.fundComparisons.map((comparison) => {
              const fundA = mockData.funds.find(f => f.id === comparison.fund_a_id);
              const fundB = mockData.funds.find(f => f.id === comparison.fund_b_id);
              
              if (!fundA || !fundB) return null;
              
              return (
                <button
                  key={comparison.id}
                  onClick={() => handleFundSelect(fundA, fundB)}
                  className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/30 transition-colors text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent text-sm font-medium">{fundA.fund_house}</span>
                    <span className="text-gray-400 text-xs">vs</span>
                    <span className="text-yellow-500 text-sm font-medium">{fundB.fund_house}</span>
                  </div>
                  <div className="text-gray-300 text-xs mb-2">
                    {fundA.scheme_name} vs {fundB.scheme_name}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {comparison.comparison_count} comparisons • {(comparison.popularity_score * 100).toFixed(0)}% match
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>
            Data is for demonstration purposes only. Please consult with financial advisors before making investment decisions.
          </p>
          <p className="mt-2">
            Mutual fund investments are subject to market risks. Read all scheme-related documents carefully before investing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;
