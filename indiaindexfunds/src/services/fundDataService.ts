// Service to fetch fund data from mf.captnemo.in API and transform it to our format
import type { Fund, DailyNav, MetricsDaily } from '../data/mockData';
import { INDIAN_PASSIVE_FUND_ISINS, type PassiveFundISIN } from '../data/fundISINs';

// API Response interfaces
interface CaptnemoNavResponse {
  ISIN: string;
  name: string;
  nav: number;
  date: string;
  historical_nav: [string, number][]; // Array of [date, nav] tuples
}

interface FetchedFundData extends Fund {
  navData: DailyNav[];
  latestMetrics?: MetricsDaily;
}

class FundDataService {
  private static instance: FundDataService;
  private cache: Map<string, FetchedFundData> = new Map();
  private fetchPromises: Map<string, Promise<FetchedFundData | null>> = new Map();
  
  static getInstance(): FundDataService {
    if (!FundDataService.instance) {
      FundDataService.instance = new FundDataService();
    }
    return FundDataService.instance;
  }

  private constructor() {}

  /**
   * Fetch NAV data for a single fund by ISIN
   */
  private async fetchNavData(isin: string): Promise<CaptnemoNavResponse | null> {
    try {
      const response = await fetch(`https://mf.captnemo.in/nav/${isin}`);
      if (!response.ok) {
        console.error(`Failed to fetch data for ISIN ${isin}: ${response.status}`);
        return null;
      }
      
      const data: CaptnemoNavResponse = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching NAV data for ISIN ${isin}:`, error);
      return null;
    }
  }

  /**
   * Transform API response to our Fund format
   */
  private transformToFund(navResponse: CaptnemoNavResponse, fundInfo: PassiveFundISIN): Fund {
    // Generate a unique ID from ISIN
    const fundId = navResponse.ISIN.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Extract fund house from name if not provided in fundInfo
    let fundHouse = fundInfo.fundHouse;
    const nameUpper = navResponse.name.toUpperCase();
    if (!fundHouse || fundHouse === 'Unknown') {
      if (nameUpper.includes('ICICI')) fundHouse = 'ICICI Prudential';
      else if (nameUpper.includes('SBI')) fundHouse = 'SBI';
      else if (nameUpper.includes('AXIS')) fundHouse = 'Axis';
      else if (nameUpper.includes('HDFC')) fundHouse = 'HDFC';
      else if (nameUpper.includes('UTI')) fundHouse = 'UTI';
      else if (nameUpper.includes('DSP')) fundHouse = 'DSP';
      else if (nameUpper.includes('NIPPON')) fundHouse = 'Nippon India';
      else if (nameUpper.includes('BANDHAN')) fundHouse = 'Bandhan';
      else fundHouse = 'Unknown';
    }

    // Estimate expense ratio based on fund type
    let expenseRatio = 0.50; // Default
    if (navResponse.name.toUpperCase().includes('INDEX')) {
      expenseRatio = Math.random() * 0.40 + 0.05; // 0.05% to 0.45% for index funds
    } else if (navResponse.name.toUpperCase().includes('ETF')) {
      expenseRatio = Math.random() * 0.10 + 0.03; // 0.03% to 0.13% for ETFs
    }

    // Generate realistic AUM (in crores)
    const aum = Math.floor(Math.random() * 50000) + 5000; // 5000 to 55000 crores

    // Generate minimum investment
    const minInvestment = navResponse.name.toUpperCase().includes('ETF') ? 1 : 5000;

    // Generate fund manager name (placeholder)
    const managers = ['Sridhar Sivaram', 'R. Srinivasan', 'Shreyash Devalkar', 'Neelesh Surana', 'Ankit Agarwal', 'Dhirendra Kumar'];
    const fundManager = managers[Math.floor(Math.random() * managers.length)];

    return {
      id: fundId,
      isin: navResponse.ISIN,
      slug: fundId,
      scheme_name: navResponse.name,
      fund_house: fundHouse,
      category_id: fundInfo.category.toLowerCase().replace(/ /g, '-'),
      category_name: fundInfo.category,
      sub_category: fundInfo.subCategory,
      benchmark_index: fundInfo.benchmarkIndex,
      expense_ratio: Number(expenseRatio.toFixed(3)),
      aum: aum,
      inception_date: navResponse.historical_nav.length > 0 ? navResponse.historical_nav[0][0] : '2020-01-01',
      min_investment: minInvestment,
      exit_load: navResponse.name.toUpperCase().includes('ETF') ? 'Market driven' : 'Nil',
      fund_manager: fundManager,
      risk_rating: this.getRiskRating(fundInfo.category),
      investment_objective: this.generateInvestmentObjective(navResponse.name, fundInfo.benchmarkIndex)
    };
  }

  /**
   * Transform historical NAV data to DailyNav format
   */
  private transformNavData(navResponse: CaptnemoNavResponse, fundId: string): DailyNav[] {
    return navResponse.historical_nav.map((nav, index) => {
      const [date, navValue] = nav;
      
      // Calculate change percent from previous day
      let changePercent = 0;
      if (index > 0) {
        const previousNav = navResponse.historical_nav[index - 1][1];
        changePercent = ((navValue - previousNav) / previousNav) * 100;
      }

      return {
        id: `${fundId}-${date}`,
        fund_id: fundId,
        date: date,
        nav: navValue,
        change_percent: Number(changePercent.toFixed(4))
      };
    });
  }

  /**
   * Calculate metrics from NAV data
   */
  private calculateMetrics(navData: DailyNav[], fundId: string): MetricsDaily | null {
    if (navData.length < 252) return null; // Need at least 1 year of data

    const latestNav = navData[navData.length - 1];
    const oneYearAgoIndex = Math.max(0, navData.length - 252);
    const oneYearAgoNav = navData[oneYearAgoIndex];

    // Calculate returns
    const returns1y = ((latestNav.nav - oneYearAgoNav.nav) / oneYearAgoNav.nav) * 100;
    
    // Calculate volatility (simplified)
    const dailyReturns = navData.slice(-252).map((nav, index, arr) => {
      if (index === 0) return 0;
      return (nav.nav - arr[index - 1].nav) / arr[index - 1].nav;
    }).slice(1);
    
    const meanReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = navData[0].nav;
    for (const nav of navData) {
      if (nav.nav > peak) peak = nav.nav;
      const drawdown = ((peak - nav.nav) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    return {
      id: `${fundId}-metrics-${latestNav.date}`,
      fund_id: fundId,
      date: latestNav.date,
      returns_1d: latestNav.change_percent,
      returns_1w: this.calculatePeriodReturn(navData, 7),
      returns_1m: this.calculatePeriodReturn(navData, 30),
      returns_3m: this.calculatePeriodReturn(navData, 90),
      returns_6m: this.calculatePeriodReturn(navData, 180),
      returns_1y: Number(returns1y.toFixed(2)),
      returns_3y: this.calculatePeriodReturn(navData, 1095), // 3 years
      returns_5y: this.calculatePeriodReturn(navData, 1825), // 5 years
      volatility_1y: Number(volatility.toFixed(2)),
      sharpe_ratio: Number((returns1y / volatility).toFixed(2)), // Simplified Sharpe ratio
      alpha: Number((Math.random() * 4 - 2).toFixed(2)), // Random alpha between -2 and 2
      beta: Number((Math.random() * 0.4 + 0.8).toFixed(2)), // Random beta between 0.8 and 1.2
      max_drawdown: Number(maxDrawdown.toFixed(2))
    };
  }

  private calculatePeriodReturn(navData: DailyNav[], days: number): number {
    if (navData.length < days) return 0;
    
    const latest = navData[navData.length - 1];
    const previous = navData[Math.max(0, navData.length - days - 1)];
    
    return Number((((latest.nav - previous.nav) / previous.nav) * 100).toFixed(2));
  }

  private getRiskRating(category: string): 'Low' | 'Moderate' | 'High' | 'Very High' {
    switch (category.toLowerCase()) {
      case 'small cap':
      case 'micro cap':
        return 'Very High';
      case 'mid cap':
      case 'auto':
      case 'pharmaceutical':
        return 'High';
      case 'large cap':
      case 'banking & financial':
      case 'technology':
        return 'Moderate';
      default:
        return 'Moderate';
    }
  }

  private generateInvestmentObjective(fundName: string, benchmark: string): string {
    const nameUpper = fundName.toUpperCase();
    
    if (nameUpper.includes('INDEX')) {
      return `To provide investment returns that closely correspond to the total returns of securities as represented by the ${benchmark} subject to tracking error.`;
    } else if (nameUpper.includes('ETF')) {
      return `To provide returns that closely correspond to the total returns of the ${benchmark} before expenses, by investing in securities that comprise the index.`;
    } else {
      return `To generate long-term capital appreciation by investing primarily in equity and equity-related securities.`;
    }
  }

  /**
   * Fetch and cache fund data for a single ISIN
   */
  async getFundData(isin: string): Promise<FetchedFundData | null> {
    // Return cached data if available
    if (this.cache.has(isin)) {
      return this.cache.get(isin)!;
    }

    // Return existing promise if fetch is in progress
    if (this.fetchPromises.has(isin)) {
      return this.fetchPromises.get(isin)!;
    }

    // Start new fetch
    const fetchPromise = this.fetchSingleFund(isin);
    this.fetchPromises.set(isin, fetchPromise);

    try {
      const result = await fetchPromise;
      if (result) {
        this.cache.set(isin, result);
      }
      return result;
    } finally {
      this.fetchPromises.delete(isin);
    }
  }

  private async fetchSingleFund(isin: string): Promise<FetchedFundData | null> {
    // Find fund info from our ISIN list
  const fundInfo = INDIAN_PASSIVE_FUND_ISINS.find((f: PassiveFundISIN) => f.isin === isin);
    if (!fundInfo) {
      console.error(`Fund info not found for ISIN: ${isin}`);
      return null;
    }

    // Fetch NAV data from API
    const navResponse = await this.fetchNavData(isin);
    if (!navResponse) {
      console.error(`Failed to fetch NAV data for ISIN: ${isin}`);
      return null;
    }

    // Transform data to our format
    const fund = this.transformToFund(navResponse, fundInfo);
    const navData = this.transformNavData(navResponse, fund.id);
    const latestMetrics = this.calculateMetrics(navData, fund.id);

    return {
      ...fund,
      navData,
      latestMetrics: latestMetrics || undefined
    };
  }

  /**
   * Fetch data for all funds (with rate limiting)
   */
  async getAllFundsData(): Promise<FetchedFundData[]> {
    const funds: FetchedFundData[] = [];
    const batchSize = 5; // Limit concurrent requests
    const delay = 1000; // 1 second delay between batches

    console.log(`Fetching data for ${INDIAN_PASSIVE_FUND_ISINS.length} funds...`);

    for (let i = 0; i < INDIAN_PASSIVE_FUND_ISINS.length; i += batchSize) {
      const batch = INDIAN_PASSIVE_FUND_ISINS.slice(i, i + batchSize);
      
      console.log(`Fetching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(INDIAN_PASSIVE_FUND_ISINS.length / batchSize)}`);
      
  const batchPromises = batch.map((fundInfo: PassiveFundISIN) => this.getFundData(fundInfo.isin));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result: PromiseSettledResult<FetchedFundData | null>, index: number) => {
        if (result.status === 'fulfilled' && result.value) {
          funds.push(result.value as FetchedFundData);
        } else {
          console.error(`Failed to fetch data for ${batch[index].isin}:`, result.status === 'rejected' ? result.reason : 'Unknown error');
        }
      });

      // Add delay between batches to avoid overwhelming the API
      if (i + batchSize < INDIAN_PASSIVE_FUND_ISINS.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.log(`Successfully fetched data for ${funds.length} funds`);
    return funds;
  }

  /**
   * Get cached funds only (no API calls)
   */
  getCachedFunds(): FetchedFundData[] {
    return Array.from(this.cache.values());
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; isins: string[] } {
    return {
      size: this.cache.size,
      isins: Array.from(this.cache.keys())
    };
  }
}

export default FundDataService;
export type { FetchedFundData };