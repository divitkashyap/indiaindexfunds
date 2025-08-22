// Mock data types matching your database structure
export interface Fund {
  id: string;
  isin: string;
  slug: string;
  scheme_name: string;
  fund_house: string;
  category_id: string;
  category_name: string;
  sub_category: string;
  benchmark_index: string;
  expense_ratio: number;
  aum: number;
  inception_date: string;
  min_investment: number;
  exit_load: string;
  fund_manager: string;
  risk_rating: 'Low' | 'Moderate' | 'High' | 'Very High';
  investment_objective: string;
}

export interface DailyNav {
  id: string;
  fund_id: string;
  date: string;
  nav: number;
  change_percent: number;
  volume?: number;
}

export interface MetricsDaily {
  id: string;
  fund_id: string;
  date: string;
  returns_1d: number;
  returns_1w: number;
  returns_1m: number;
  returns_3m: number;
  returns_6m: number;
  returns_1y: number;
  returns_3y: number;
  returns_5y: number;
  volatility_1y: number;
  sharpe_ratio: number;
  alpha: number;
  beta: number;
  max_drawdown: number;
  tracking_error?: number;
}

export interface BenchmarkIndex {
  id: string;
  index_name: string;
  index_code: string;
  date: string;
  value: number;
  change_percent: number;
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string;
  level: number;
  description: string;
}

export interface UserComparisonHistory {
  id: string;
  user_id?: string;
  fund_a_id: string;
  fund_b_id: string;
  timeframe: string;
  created_at: string;
  session_id?: string;
}

export interface FundComparison {
  id: string;
  fund_a_id: string;
  fund_b_id: string;
  comparison_count: number;
  last_compared: string;
  popularity_score: number;
}

export interface UserWatchlist {
  id: string;
  user_id: string;
  fund_a_id: string;
  fund_b_id: string;
  name: string;
  created_at: string;
  notifications_enabled: boolean;
}

// Mock data generation
export const generateMockData = () => {
  // Categories with hierarchical structure
  const categories: Category[] = [
    // Primary categories
    { id: 'equity', name: 'Equity', level: 1, description: 'Equity mutual funds' },
    { id: 'debt', name: 'Debt', level: 1, description: 'Debt mutual funds' },
    { id: 'hybrid', name: 'Hybrid', level: 1, description: 'Hybrid mutual funds' },
    
    // Equity sub-categories
    { id: 'large-cap', name: 'Large Cap', parent_id: 'equity', level: 2, description: 'Large cap equity funds' },
    { id: 'mid-cap', name: 'Mid Cap', parent_id: 'equity', level: 2, description: 'Mid cap equity funds' },
    { id: 'small-cap', name: 'Small Cap', parent_id: 'equity', level: 2, description: 'Small cap equity funds' },
    { id: 'micro-cap', name: 'Micro Cap', parent_id: 'equity', level: 2, description: 'Micro cap equity funds' },
    
    // Sectoral
    { id: 'defense', name: 'Defense', parent_id: 'equity', level: 2, description: 'Defense sector funds' },
    { id: 'banking', name: 'Banking & Financial', parent_id: 'equity', level: 2, description: 'Banking sector funds' },
    { id: 'technology', name: 'Technology', parent_id: 'equity', level: 2, description: 'Technology sector funds' },
    { id: 'pharma', name: 'Pharmaceutical', parent_id: 'equity', level: 2, description: 'Pharma sector funds' },
    
    // Thematic
    { id: 'esg', name: 'ESG', parent_id: 'equity', level: 2, description: 'ESG focused funds' },
    { id: 'infrastructure', name: 'Infrastructure', parent_id: 'equity', level: 2, description: 'Infrastructure theme funds' },
    { id: 'consumption', name: 'Consumption', parent_id: 'equity', level: 2, description: 'Consumption theme funds' },
  ];

  // Sample funds with realistic data
  const funds: Fund[] = [
    {
      id: 'icici-nifty-50',
      isin: 'INF109K01LX5',
      slug: 'icici-prudential-nifty-50-index-fund',
      scheme_name: 'ICICI Prudential Nifty 50 Index Fund - Direct Plan - Growth',
      fund_house: 'ICICI Prudential Mutual Fund',
      category_id: 'large-cap',
      category_name: 'Large Cap',
      sub_category: 'Index Fund',
      benchmark_index: 'NIFTY 50',
      expense_ratio: 0.10,
      aum: 25000,
      inception_date: '2010-01-01',
      min_investment: 5000,
      exit_load: 'Nil',
      fund_manager: 'Sridhar Sivaram',
      risk_rating: 'Moderate',
      investment_objective: 'To provide investment returns that closely correspond to the total returns of securities as represented by the Nifty 50 Index'
    },
    {
      id: 'sbi-nifty-50',
      isin: 'INF204K01424',
      slug: 'sbi-nifty-50-index-fund',
      scheme_name: 'SBI Nifty 50 Index Fund - Direct Plan - Growth',
      fund_house: 'SBI Mutual Fund',
      category_id: 'large-cap',
      category_name: 'Large Cap',
      sub_category: 'Index Fund',
      benchmark_index: 'NIFTY 50',
      expense_ratio: 0.07,
      aum: 18500,
      inception_date: '2019-05-01',
      min_investment: 5000,
      exit_load: 'Nil',
      fund_manager: 'R. Srinivasan',
      risk_rating: 'Moderate',
      investment_objective: 'To track the performance of Nifty 50 Index by investing in the securities in the same weightage as the index'
    },
    {
      id: 'axis-midcap',
      isin: 'INF846K01EW2',
      slug: 'axis-midcap-fund',
      scheme_name: 'Axis Midcap Fund - Direct Plan - Growth',
      fund_house: 'Axis Mutual Fund',
      category_id: 'mid-cap',
      category_name: 'Mid Cap',
      sub_category: 'Equity Fund',
      benchmark_index: 'NIFTY MIDCAP 150',
      expense_ratio: 0.89,
      aum: 15200,
      inception_date: '2011-01-01',
      min_investment: 5000,
      exit_load: '1% if redeemed within 1 year',
      fund_manager: 'Shreyash Devalkar',
      risk_rating: 'High',
      investment_objective: 'To achieve long term capital appreciation by investing in equity & equity related securities of mid-cap companies'
    },
    {
      id: 'mirae-emerging-bluechip',
      isin: 'INF769K01EY9',
      slug: 'mirae-asset-emerging-bluechip-fund',
      scheme_name: 'Mirae Asset Emerging Bluechip Fund - Direct Plan - Growth',
      fund_house: 'Mirae Asset Mutual Fund',
      category_id: 'large-cap',
      category_name: 'Large Cap',
      sub_category: 'Equity Fund',
      benchmark_index: 'NIFTY 500',
      expense_ratio: 0.72,
      aum: 28900,
      inception_date: '2010-07-01',
      min_investment: 5000,
      exit_load: '1% if redeemed within 1 year',
      fund_manager: 'Neelesh Surana',
      risk_rating: 'High',
      investment_objective: 'To achieve long term capital appreciation by investing in equity and equity related securities'
    },
    {
      id: 'parag-parikh-flexi-cap',
      isin: 'INF769K01EZ7',
      slug: 'parag-parikh-flexi-cap-fund',
      scheme_name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
      fund_house: 'Parag Parikh Mutual Fund',
      category_id: 'large-cap',
      category_name: 'Large Cap',
      sub_category: 'Flexi Cap Fund',
      benchmark_index: 'NIFTY 500',
      expense_ratio: 0.73,
      aum: 41500,
      inception_date: '2013-05-01',
      min_investment: 5000,
      exit_load: '2% if redeemed within 1 year, 1% within 2 years',
      fund_manager: 'Rajeev Thakkar',
      risk_rating: 'High',
      investment_objective: 'To achieve long term capital appreciation along with the possibility of some income by investing in equity, debt securities, REITs/InvITs, and overseas securities'
    },
    {
      id: 'hdfc-defense-fund',
      isin: 'INF179K01AU4',
      slug: 'hdfc-defense-fund',
      scheme_name: 'HDFC Defense Fund - Direct Plan - Growth',
      fund_house: 'HDFC Mutual Fund',
      category_id: 'defense',
      category_name: 'Defense',
      sub_category: 'Sectoral Fund',
      benchmark_index: 'BSE India Defense Index',
      expense_ratio: 1.25,
      aum: 4800,
      inception_date: '2019-12-01',
      min_investment: 5000,
      exit_load: '1% if redeemed within 1 year',
      fund_manager: 'Chirag Setalvad',
      risk_rating: 'Very High',
      investment_objective: 'To generate capital appreciation by investing primarily in equity and equity related securities of defense and allied sectors'
    }
  ];

  // Generate daily NAV data for the last 12 months
  const generateNavData = (fundId: string, baseNav: number, volatility: number = 0.02): DailyNav[] => {
    const data: DailyNav[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    let currentNav = baseNav;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Simulate daily returns with some trend and volatility
      const randomReturn = (Math.random() - 0.48) * volatility;
      const trendReturn = 0.0003; // Small positive trend
      const dailyReturn = randomReturn + trendReturn;
      
      const previousNav = currentNav;
      currentNav = previousNav * (1 + dailyReturn);
      const changePercent = ((currentNav - previousNav) / previousNav) * 100;
      
      data.push({
        id: `${fundId}-${date.toISOString().split('T')[0]}`,
        fund_id: fundId,
        date: date.toISOString().split('T')[0],
        nav: Number(currentNav.toFixed(4)),
        change_percent: Number(changePercent.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }
    
    return data;
  };

  // Generate metrics data
  const generateMetrics = (fundId: string, navData: DailyNav[]): MetricsDaily => {
    const latestNav = navData[navData.length - 1];
    const nav1YearAgo = navData[0];
    const nav6MonthsAgo = navData[Math.floor(navData.length * 0.5)];
    const nav3MonthsAgo = navData[Math.floor(navData.length * 0.75)];
    const nav1MonthAgo = navData[navData.length - 30];
    const nav1WeekAgo = navData[navData.length - 7];
    const navYesterday = navData[navData.length - 2];
    
    const calculateReturn = (current: number, past: number) => ((current - past) / past) * 100;
    
    return {
      id: `${fundId}-metrics`,
      fund_id: fundId,
      date: latestNav.date,
      returns_1d: calculateReturn(latestNav.nav, navYesterday.nav),
      returns_1w: calculateReturn(latestNav.nav, nav1WeekAgo.nav),
      returns_1m: calculateReturn(latestNav.nav, nav1MonthAgo.nav),
      returns_3m: calculateReturn(latestNav.nav, nav3MonthsAgo.nav),
      returns_6m: calculateReturn(latestNav.nav, nav6MonthsAgo.nav),
      returns_1y: calculateReturn(latestNav.nav, nav1YearAgo.nav),
      returns_3y: 15.2 + (Math.random() - 0.5) * 5,
      returns_5y: 11.8 + (Math.random() - 0.5) * 3,
      volatility_1y: 15 + Math.random() * 10,
      sharpe_ratio: 0.8 + Math.random() * 0.6,
      alpha: (Math.random() - 0.5) * 4,
      beta: 0.8 + Math.random() * 0.4,
      max_drawdown: -(5 + Math.random() * 15),
      tracking_error: fundId.includes('index') ? 0.1 + Math.random() * 0.3 : undefined
    };
  };

  // Generate benchmark index data
  const generateBenchmarkData = (indexName: string, baseValue: number): BenchmarkIndex[] => {
    const data: BenchmarkIndex[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    let currentValue = baseValue;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const randomReturn = (Math.random() - 0.48) * 0.015;
      const trendReturn = 0.0003;
      const dailyReturn = randomReturn + trendReturn;
      
      const previousValue = currentValue;
      currentValue = previousValue * (1 + dailyReturn);
      const changePercent = ((currentValue - previousValue) / previousValue) * 100;
      
      data.push({
        id: `${indexName.replace(/\s+/g, '-').toLowerCase()}-${date.toISOString().split('T')[0]}`,
        index_name: indexName,
        index_code: indexName.replace(/\s+/g, '_').toUpperCase(),
        date: date.toISOString().split('T')[0],
        value: Number(currentValue.toFixed(2)),
        change_percent: Number(changePercent.toFixed(2))
      });
    }
    
    return data;
  };

  // Generate all NAV data
  const allNavData: DailyNav[] = [
    ...generateNavData('icici-nifty-50', 185.5, 0.015),
    ...generateNavData('sbi-nifty-50', 142.8, 0.015),
    ...generateNavData('axis-midcap', 298.7, 0.025),
    ...generateNavData('mirae-emerging-bluechip', 456.2, 0.020),
    ...generateNavData('parag-parikh-flexi-cap', 523.8, 0.018),
    ...generateNavData('hdfc-defense-fund', 89.3, 0.035)
  ];

  // Generate all metrics
  const allMetrics: MetricsDaily[] = funds.map(fund => {
    const fundNavData = allNavData.filter(nav => nav.fund_id === fund.id);
    return generateMetrics(fund.id, fundNavData);
  });

  // Generate benchmark data
  const benchmarkData: BenchmarkIndex[] = [
    ...generateBenchmarkData('NIFTY 50', 22000),
    ...generateBenchmarkData('NIFTY MIDCAP 150', 18500),
    ...generateBenchmarkData('NIFTY 500', 16800),
    ...generateBenchmarkData('BSE India Defense Index', 4200)
  ];

  // Popular fund comparisons
  const fundComparisons: FundComparison[] = [
    {
      id: 'icici-vs-sbi-nifty50',
      fund_a_id: 'icici-nifty-50',
      fund_b_id: 'sbi-nifty-50',
      comparison_count: 1547,
      last_compared: new Date().toISOString(),
      popularity_score: 0.92
    },
    {
      id: 'mirae-vs-parag-parikh',
      fund_a_id: 'mirae-emerging-bluechip',
      fund_b_id: 'parag-parikh-flexi-cap',
      comparison_count: 892,
      last_compared: new Date().toISOString(),
      popularity_score: 0.78
    }
  ];

  return {
    categories,
    funds,
    navData: allNavData,
    metrics: allMetrics,
    benchmarkData,
    fundComparisons
  };
};

// Export the generated mock data
export const mockData = generateMockData();
