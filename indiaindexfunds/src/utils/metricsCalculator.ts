// Calculate real metrics from NAV time series data

export interface NAVDataPoint {
  date: string;
  nav: number;
}

export interface CalculatedMetrics {
  fund_id: string;
  fund_name: string;
  total_return_1y: number;
  total_return_3y: number | null;
  total_return_5y: number | null;
  annualized_return_1y: number;
  annualized_return_3y: number | null;
  annualized_return_5y: number | null;
  volatility_1y: number;
  max_drawdown_1y: number;
  sharpe_ratio_1y: number | null;
  current_nav: number;
  latest_date: string;
}

function calculateReturn(startNav: number, endNav: number): number {
  return ((endNav - startNav) / startNav) * 100;
}

function calculateCAGR(startNav: number, endNav: number, years: number): number {
  return (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
}

function calculateVolatility(navData: NAVDataPoint[]): number {
  if (navData.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < navData.length; i++) {
    const dailyReturn = (navData[i].nav - navData[i - 1].nav) / navData[i - 1].nav;
    returns.push(dailyReturn);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return stdDev * Math.sqrt(252) * 100;
}

function calculateMaxDrawdown(navData: NAVDataPoint[]): number {
  if (navData.length === 0) return 0;

  let maxDrawdown = 0;
  let peak = navData[0].nav;

  for (const point of navData) {
    if (point.nav > peak) {
      peak = point.nav;
    }
    const drawdown = ((peak - point.nav) / peak) * 100;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

function calculateSharpeRatio(annualizedReturn: number, volatility: number, riskFreeRate: number = 7): number {
  if (volatility === 0) return 0;
  return (annualizedReturn - riskFreeRate) / volatility;
}

function getDataInRange(navData: NAVDataPoint[], years: number): NAVDataPoint[] {
  if (navData.length === 0) return [];

  const latestDate = new Date(navData[navData.length - 1].date);
  const startDate = new Date(latestDate);
  startDate.setFullYear(startDate.getFullYear() - years);

  return navData.filter(point => new Date(point.date) >= startDate);
}

export function calculateMetricsFromNAV(
  fundId: string,
  fundName: string,
  navData: NAVDataPoint[]
): CalculatedMetrics {
  if (navData.length === 0) {
    return {
      fund_id: fundId,
      fund_name: fundName,
      total_return_1y: 0,
      total_return_3y: null,
      total_return_5y: null,
      annualized_return_1y: 0,
      annualized_return_3y: null,
      annualized_return_5y: null,
      volatility_1y: 0,
      max_drawdown_1y: 0,
      sharpe_ratio_1y: null,
      current_nav: 0,
      latest_date: new Date().toISOString(),
    };
  }

  const sortedData = [...navData].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const currentNav = sortedData[sortedData.length - 1].nav;
  const latestDate = sortedData[sortedData.length - 1].date;

  const data1y = getDataInRange(sortedData, 1);
  const data3y = getDataInRange(sortedData, 3);
  const data5y = getDataInRange(sortedData, 5);

  const totalReturn1y = data1y.length >= 2
    ? calculateReturn(data1y[0].nav, currentNav)
    : 0;

  const annualizedReturn1y = data1y.length >= 2
    ? calculateCAGR(data1y[0].nav, currentNav, 1)
    : 0;

  const volatility1y = data1y.length >= 30
    ? calculateVolatility(data1y)
    : 0;

  const maxDrawdown1y = data1y.length >= 2
    ? calculateMaxDrawdown(data1y)
    : 0;

  const sharpeRatio1y = volatility1y > 0
    ? calculateSharpeRatio(annualizedReturn1y, volatility1y)
    : null;

  const enough3y = data3y.length >= 2 && data3y.length >= data1y.length * 2;
  const enough5y = data5y.length >= 2 && data5y.length >= data1y.length * 4;

  const totalReturn3y = enough3y
    ? calculateReturn(data3y[0].nav, currentNav)
    : null;

  const annualizedReturn3y = enough3y
    ? calculateCAGR(data3y[0].nav, currentNav, 3)
    : null;

  const totalReturn5y = enough5y
    ? calculateReturn(data5y[0].nav, currentNav)
    : null;

  const annualizedReturn5y = enough5y
    ? calculateCAGR(data5y[0].nav, currentNav, 5)
    : null;

  return {
    fund_id: fundId,
    fund_name: fundName,
    total_return_1y: totalReturn1y,
    total_return_3y: totalReturn3y,
    total_return_5y: totalReturn5y,
    annualized_return_1y: annualizedReturn1y,
    annualized_return_3y: annualizedReturn3y,
    annualized_return_5y: annualizedReturn5y,
    volatility_1y: volatility1y,
    max_drawdown_1y: maxDrawdown1y,
    sharpe_ratio_1y: sharpeRatio1y,
    current_nav: currentNav,
    latest_date: latestDate,
  };
}

export function isRealNAVData(navData: NAVDataPoint[]): boolean {
  if (navData.length < 50) return false;

  const latestDate = new Date(navData[navData.length - 1].date);
  const daysSinceLatest = (Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceLatest <= 7;
}
