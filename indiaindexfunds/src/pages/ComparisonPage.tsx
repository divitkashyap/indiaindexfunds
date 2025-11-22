import React, { useState, useEffect } from 'react';
import FundSelector from '../components/Comparison/FundSelector';
import ComparisonChart from '../components/Comparison/ComparisonChart';
import MetricsTable from '../components/Comparison/MetricsTable';
import InvestButton from '../components/Comparison/InvestButton';
import type { TimeframeOption } from '../components/Comparison/ComparisonChart';
import type { ChartDataPoint } from '../components/Comparison/ComparisonChart';
import { mockData, type Fund as MockFund } from '../data/mockData';
import { fetchIndexFunds, amfiToFundRow, type BackendIndexFund, fetchNavByISIN } from '../api/funds';
import { calculateMetricsFromNAV, isRealNAVData } from '../utils/metricsCalculator';

const ComparisonPage: React.FC = () => {
  const [selectedFunds, setSelectedFunds] = useState<{ fundA: MockFund | null; fundB: MockFund | null }>({
    fundA: null,
    fundB: null,
  });
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeOption>('1Y');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [metricsA, setMetricsA] = useState<any | null>(null);
  const [metricsB, setMetricsB] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveFunds, setLiveFunds] = useState<MockFund[] | null>(null);
  const [useLiveData, setUseLiveData] = useState(true);

  // Fetch live index funds list from backend (AMFI)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list: BackendIndexFund[] = await fetchIndexFunds();
        const mapped = list.map(amfiToFundRow);

        // Prefer index-like schemes for the UI (Nifty/Sensex/Index/ETF)
        const indexLike = mapped.filter(f =>
          /index|nifty|sensex|etf/i.test(f.scheme_name)
        );

        if (mounted) {
          setLiveFunds(indexLike.length ? indexLike : mapped);
        }
      } catch (e) {
        console.error('Falling back to mock funds due to fetch error:', e);
        if (mounted) {
          setUseLiveData(false);
          setLiveFunds(null);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Simulate data fetching
  useEffect(() => {
    if (selectedFunds.fundA && selectedFunds.fundB) {
      setIsLoading(true);
      
      // Simulate API call delay
  const timer = setTimeout(async () => {
        // Get NAV data for both funds (start with mock, then try real)
        let navDataA = mockData.navData.filter(nav => nav.fund_id === selectedFunds.fundA!.id);
        let navDataB = mockData.navData.filter(nav => nav.fund_id === selectedFunds.fundB!.id);

        // If both have ISIN and backend available, try fetching real historical NAVs
        // Note: We keep mock fallback if request fails
        const tryFetchReal = async () => {
          try {
            const [a, b] = await Promise.all([
              selectedFunds.fundA?.isin ? fetchNavByISIN(selectedFunds.fundA.isin) : Promise.resolve(null),
              selectedFunds.fundB?.isin ? fetchNavByISIN(selectedFunds.fundB.isin) : Promise.resolve(null)
            ]);
            if (a && a.historical_nav?.length) {
              const fundIdA = selectedFunds.fundA!.id;
              navDataA = a.historical_nav.map(([date, nav], idx, arr) => {
                const prev = idx > 0 ? arr[idx - 1][1] : nav;
                const change = idx > 0 ? ((nav - prev) / prev) * 100 : 0;
                return { id: `${fundIdA}-${date}`, fund_id: fundIdA, date, nav, change_percent: Number(change.toFixed(4)) };
              });
            }
            if (b && b.historical_nav?.length) {
              const fundIdB = selectedFunds.fundB!.id;
              navDataB = b.historical_nav.map(([date, nav], idx, arr) => {
                const prev = idx > 0 ? arr[idx - 1][1] : nav;
                const change = idx > 0 ? ((nav - prev) / prev) * 100 : 0;
                return { id: `${fundIdB}-${date}`, fund_id: fundIdB, date, nav, change_percent: Number(change.toFixed(4)) };
              });
            }
          } catch (e) {
            console.warn('Using mock NAV due to real NAV fetch error:', e);
          }
        };

  // Fetch real NAVs if possible (non-blocking but awaited here)
  await tryFetchReal();
        
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

        if (chartPoints.length > 0) {
          console.log('Sample chart point (for benchmarks):', chartPoints[0]);
        }

        // Calculate real-time metrics from NAV data if we have enough points
        if (chartPoints.length > 0) {
          const navSeriesA = navDataA.map(d => ({ date: d.date, nav: d.nav }));
          const navSeriesB = navDataB.map(d => ({ date: d.date, nav: d.nav }));

          const metricsAReal = calculateMetricsFromNAV(
            selectedFunds.fundA!.isin || selectedFunds.fundA!.id,
            selectedFunds.fundA!.scheme_name,
            navSeriesA
          );
          const metricsBReal = calculateMetricsFromNAV(
            selectedFunds.fundB!.isin || selectedFunds.fundB!.id,
            selectedFunds.fundB!.scheme_name,
            navSeriesB
          );

          console.log('Fund A NAV data points:', navSeriesA.length);
          console.log('Fund B NAV data points:', navSeriesB.length);
          console.log('Latest NAV date A:', navSeriesA[navSeriesA.length - 1]?.date);
          console.log('Latest NAV date B:', navSeriesB[navSeriesB.length - 1]?.date);
          console.log('Is real data A:', isRealNAVData(navSeriesA));
          console.log('Is real data B:', isRealNAVData(navSeriesB));

          setMetricsA(metricsAReal);
          setMetricsB(metricsBReal);
        } else {
          setMetricsA(null);
          setMetricsB(null);
        }

        setChartData(chartPoints);
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

  const summaryText = React.useMemo(() => {
    if (!selectedFunds.fundA || !selectedFunds.fundB || !metricsA || !metricsB) return '';

    const label =
      selectedTimeframe === '1Y'
        ? 'over the last 1 year'
        : selectedTimeframe === '3Y'
        ? 'over the last 3 years'
        : selectedTimeframe === '5Y'
        ? 'over the last 5 years'
        : 'over the selected period';

    const returnA = (metricsA as any).total_return_1y ?? (metricsA as any).returns_1y ?? 0;
    const returnB = (metricsB as any).total_return_1y ?? (metricsB as any).returns_1y ?? 0;

    if (Math.abs(returnA - returnB) < 0.1) {
      return `Both funds have delivered very similar returns ${label}.`;
    }

    const betterFund = returnA > returnB ? selectedFunds.fundA.scheme_name : selectedFunds.fundB.scheme_name;
    return `${betterFund} has had slightly stronger returns ${label}, based on price performance data. This is informational only and not an investment recommendation.`;
  }, [selectedFunds, metricsA, metricsB, selectedTimeframe]);

  return (
    <div className="w-full p-4 pt-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fund Comparison </h1>
          <p className="text-gray-300 text-lg">
            Compare performance and metrics of Indian index funds
          </p>
          {useLiveData && liveFunds && (
            <div className="text-xs text-green-400 mt-2">Live index fund list loaded from backend ({liveFunds.length} funds)</div>
          )}
          {!useLiveData && (
            <div className="text-xs text-yellow-400 mt-2">Using mock fund list (backend unavailable)</div>
          )}
        </div>

        {/* Fund Selector */}
        <FundSelector
          funds={liveFunds && useLiveData ? liveFunds : mockData.funds}
          categories={mockData.categories}
          onFundSelect={handleFundSelect}
          selectedFunds={selectedFunds}
        />

        {/* Chart + Summary row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6 items-stretch">
          <div className="xl:col-span-2">
            <ComparisonChart
              data={chartData}
              fundA={selectedFunds.fundA}
              fundB={selectedFunds.fundB}
              benchmarkData={mockData.benchmarkData}
              loading={isLoading}
              selectedTimeframe={selectedTimeframe}
              onTimeframeChange={handleTimeframeChange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onCustomDateChange={handleCustomDateChange}
              metricsA={metricsA}
              metricsB={metricsB}
            />
          </div>
          <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6 text-sm text-gray-200 flex flex-col justify-between border border-yellow-500/50 hover:border-yellow-300/70 hover:shadow-[0_0_30px_rgba(250,204,21,0.35)] transition-all duration-200">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Performance Snapshot
              </h3>
              {summaryText ? (
                <p className="text-gray-100 leading-relaxed text-[15px]">
                  {summaryText}
                </p>
              ) : (
                <p className="text-gray-500 text-[15px]">
                  Select two funds and a timeframe to see a quick snapshot of how they have performed relative to each other.
                </p>
              )}
            </div>
            <p className="mt-4 text-[11px] text-gray-500">
              This summary is based purely on historical price data and is not a recommendation or advice.
            </p>
          </div>
        </div>

        {/* Metrics table full-width below */}
        <div className="mb-6">
          <MetricsTable
            fundA={selectedFunds.fundA}
            fundB={selectedFunds.fundB}
            metricsA={metricsA}
            metricsB={metricsB}
            loading={isLoading}
          />
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
                    <span className="text-yellow-500 text-sm font-medium">{fundA.fund_house}</span>
                    <span className="text-gray-400 text-xs">vs</span>
                    <span className="text-yellow-500 text-sm font-medium">{fundB.fund_house}</span>
                  </div>
                  <div className="text-gray-100 text-xs mb-2">
                    {fundA.scheme_name} vs {fundB.scheme_name}
                  </div>
                  <div className="text-gray-400 text-xs">
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
