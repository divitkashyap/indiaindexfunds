import { useState, useEffect } from 'react';
import { YahooFinanceService, FundData } from '@/services/yahooFinance';

interface UseFundsReturn {
  funds: FundData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFunds = (): UseFundsReturn => {
  const [funds, setFunds] = useState<FundData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const fundData = await YahooFinanceService.fetchAllFunds();
      setFunds(fundData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch funds data');
      console.error('Error fetching funds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const refetch = async () => {
    await fetchFunds();
  };

  return {
    funds,
    loading,
    error,
    refetch
  };
}; 