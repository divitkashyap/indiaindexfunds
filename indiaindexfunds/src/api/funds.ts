// Frontend API client for fetching index funds and NAV data from our backend
import type { Fund } from '../data/mockData';

export interface BackendIndexFund {
  schemeCode: string;
  schemeName: string;
  isin: string | null;
  nav: number;
  date: string; // DD-MMM-YYYY
  amc: string | null;
}

export interface CaptnemoNavResponse {
  ISIN: string;
  name: string;
  nav: number;
  date: string;
  historical_nav: [string, number][];
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function fetchIndexFunds(): Promise<BackendIndexFund[]> {
  const res = await fetch(`${API_BASE}/api/index-funds`);
  if (!res.ok) throw new Error(`Failed to fetch index funds: ${res.status}`);
  const data = await res.json();
  return data.funds as BackendIndexFund[];
}

export async function fetchNavByISIN(isin: string): Promise<CaptnemoNavResponse> {
  const res = await fetch(`${API_BASE}/api/nav/${encodeURIComponent(isin)}`);
  if (!res.ok) throw new Error(`Failed to fetch NAV for ${isin}: ${res.status}`);
  return res.json();
}

// Heuristic mappers to shape AMFI to our Fund type (with placeholders)
function guessFundHouse(name: string): string {
  const u = name.toUpperCase();
  if (u.includes('ICICI')) return 'ICICI Prudential Mutual Fund';
  if (u.includes('SBI')) return 'SBI Mutual Fund';
  if (u.includes('AXIS')) return 'Axis Mutual Fund';
  if (u.includes('HDFC')) return 'HDFC Mutual Fund';
  if (u.includes('UTI')) return 'UTI Mutual Fund';
  if (u.includes('D S P') || u.includes('DSP')) return 'DSP Mutual Fund';
  if (u.includes('NIPPON')) return 'Nippon India Mutual Fund';
  if (u.includes('BANDHAN')) return 'Bandhan Mutual Fund';
  if (u.includes('MOTILAL')) return 'Motilal Oswal Mutual Fund';
  if (u.includes('KOTAK')) return 'Kotak Mahindra Mutual Fund';
  if (u.includes('TATA')) return 'Tata Mutual Fund';
  return 'Unknown';
}

function categorizeScheme(name: string): { category_id: string; category_name: string; sub_category: string; benchmark_index: string } {
  const n = name.toUpperCase();
  if (n.includes('NEXT 50')) return { category_id: 'large-cap', category_name: 'Large Cap', sub_category: 'Index Fund', benchmark_index: 'NIFTY NEXT 50' };
  if (n.includes('NIFTY 50') || n.includes('NIFTY INDEX')) return { category_id: 'large-cap', category_name: 'Large Cap', sub_category: 'Index Fund', benchmark_index: 'NIFTY 50' };
  if (n.includes('SENSEX')) return { category_id: 'large-cap', category_name: 'Large Cap', sub_category: 'Index Fund', benchmark_index: 'S&P BSE Sensex' };
  if (n.includes('MIDCAP 150')) return { category_id: 'mid-cap', category_name: 'Mid Cap', sub_category: 'Index Fund', benchmark_index: 'NIFTY MIDCAP 150' };
  if (n.includes('SMALLCAP 250')) return { category_id: 'small-cap', category_name: 'Small Cap', sub_category: 'Index Fund', benchmark_index: 'NIFTY SMALLCAP 250' };
  if (n.includes('BANK')) return { category_id: 'banking', category_name: 'Banking & Financial', sub_category: 'Index Fund', benchmark_index: 'NIFTY BANK' };
  if (n.includes('IT')) return { category_id: 'technology', category_name: 'Technology', sub_category: 'Index Fund', benchmark_index: 'NIFTY IT' };
  if (n.includes('PHARMA')) return { category_id: 'pharma', category_name: 'Pharmaceutical', sub_category: 'Index Fund', benchmark_index: 'NIFTY PHARMA' };
  return { category_id: 'equity', category_name: 'Equity', sub_category: 'Index/ETF', benchmark_index: 'NIFTY 50' };
}

export function amfiToFundRow(row: BackendIndexFund): Fund {
  const id = (row.isin || `${row.schemeCode}-${row.schemeName}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const cat = categorizeScheme(row.schemeName);
  return {
    id,
    isin: row.isin || '',
    slug: id,
    scheme_name: row.schemeName,
    fund_house: guessFundHouse(row.schemeName),
    category_id: cat.category_id,
    category_name: cat.category_name,
    sub_category: cat.sub_category,
    benchmark_index: cat.benchmark_index,
    expense_ratio: 0.2, // placeholder
    aum: 0, // unknown
    inception_date: '2010-01-01',
    min_investment: 5000,
    exit_load: 'Nil',
    fund_manager: '—',
    risk_rating: 'Moderate',
    investment_objective: `Seeks to track ${cat.benchmark_index} subject to tracking error.`
  };
}
