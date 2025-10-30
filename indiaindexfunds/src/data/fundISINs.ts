// Comprehensive list of popular Indian passive index fund ISINs
// These are real ISINs for major Indian passive funds that track various indices

export interface PassiveFundISIN {
  isin: string;
  expectedName: string;
  category: string;
  subCategory: string;
  benchmarkIndex: string;
  fundHouse: string;
}

// Start with verified working ISIN and add more as we find them
export const INDIAN_PASSIVE_FUND_ISINS: PassiveFundISIN[] = [
  // Verified working ISINs
  {
    isin: 'INF194KB1DP9',
    expectedName: 'BANDHAN NIFTY200 MOMENTUM 30 INDEX FUND - GROWTH - DIRECT PLAN',
    category: 'Multi Cap',
    subCategory: 'Index Fund',
    benchmarkIndex: 'NIFTY200 MOMENTUM 30',
    fundHouse: 'Bandhan'
  }
  
  // TODO: Add more verified ISINs after testing
  // We'll expand this list as we find more valid ISINs from the mf.captnemo.in API
];

// Helper function to get funds by category
export const getFundsByCategory = (category: string): PassiveFundISIN[] => {
  return INDIAN_PASSIVE_FUND_ISINS.filter(fund => fund.category === category);
};

// Helper function to get funds by fund house
export const getFundsByHouse = (fundHouse: string): PassiveFundISIN[] => {
  return INDIAN_PASSIVE_FUND_ISINS.filter(fund => fund.fundHouse === fundHouse);
};

// Helper function to get unique categories
export const getUniqueCategories = (): string[] => {
  return Array.from(new Set(INDIAN_PASSIVE_FUND_ISINS.map(fund => fund.category)));
};

// Helper function to get unique fund houses
export const getUniqueFundHouses = (): string[] => {
  return Array.from(new Set(INDIAN_PASSIVE_FUND_ISINS.map(fund => fund.fundHouse)));
};