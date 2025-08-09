import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Fund, Category } from '../../data/mockData';

interface FundSelectorProps {
  funds: Fund[];
  categories: Category[];
  onFundSelect: (fundA: Fund | null, fundB: Fund | null) => void;
  selectedFunds: { fundA: Fund | null; fundB: Fund | null };
}

const FundSelector: React.FC<FundSelectorProps> = ({ funds, categories, onFundSelect, selectedFunds }) => {
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [showDropdownA, setShowDropdownA] = useState(false);
  const [showDropdownB, setShowDropdownB] = useState(false);
  const [selectedCategoryA, setSelectedCategoryA] = useState<string>('');
  const [selectedCategoryB, setSelectedCategoryB] = useState<string>('');
  
  // Additional filter states
  const [fundTypeFilterA, setFundTypeFilterA] = useState<string>('All');
  const [fundTypeFilterB, setFundTypeFilterB] = useState<string>('All');
  const [assetTypeFilterA, setAssetTypeFilterA] = useState<string>('All');
  const [assetTypeFilterB, setAssetTypeFilterB] = useState<string>('All');
  
  const dropdownRefA = useRef<HTMLDivElement>(null);
  const dropdownRefB = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRefA.current && !dropdownRefA.current.contains(event.target as Node)) {
        setShowDropdownA(false);
      }
      if (dropdownRefB.current && !dropdownRefB.current.contains(event.target as Node)) {
        setShowDropdownB(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced filter function with additional filters
  const filterFunds = (
    search: string, 
    categoryFilter: string, 
    fundTypeFilter: string, 
    assetTypeFilter: string, 
    excludeFundId?: string
  ) => {
    return funds.filter(fund => {
      const matchesSearch = fund.scheme_name.toLowerCase().includes(search.toLowerCase()) ||
                           fund.fund_house.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || fund.category_id === categoryFilter;
      
      // Fund type filter - check if fund name contains ETF or Index Fund keywords
      const isETF = fund.scheme_name.toLowerCase().includes('etf');
      const matchesFundType = fundTypeFilter === 'All' || 
                             (fundTypeFilter === 'ETF' && isETF) ||
                             (fundTypeFilter === 'Index Fund' && !isETF);
      
      // Asset type filter - basic heuristic based on fund category
      const isEquity = fund.category_id.includes('equity') || fund.category_id.includes('large-cap') || 
                      fund.category_id.includes('mid-cap') || fund.category_id.includes('small-cap');
      const matchesAssetType = assetTypeFilter === 'All' ||
                              (assetTypeFilter === 'Equity' && isEquity) ||
                              (assetTypeFilter === 'Debt' && !isEquity);
      
      const notExcluded = !excludeFundId || fund.id !== excludeFundId;
      return matchesSearch && matchesCategory && matchesFundType && matchesAssetType && notExcluded;
    });
  };

  const filteredFundsA = filterFunds(searchA, selectedCategoryA, fundTypeFilterA, assetTypeFilterA, selectedFunds.fundB?.id);
  const filteredFundsB = filterFunds(searchB, selectedCategoryB, fundTypeFilterB, assetTypeFilterB, selectedFunds.fundA?.id);

  // Get primary categories (level 1)
  const primaryCategories = categories.filter(cat => cat.level === 1);
  // Get sub-categories (level 2)
  const subCategories = categories.filter(cat => cat.level === 2);

  const handleFundSelectA = (fund: Fund) => {
    onFundSelect(fund, selectedFunds.fundB);
    setSearchA(fund.scheme_name);
    setShowDropdownA(false);
  };

  const handleFundSelectB = (fund: Fund) => {
    onFundSelect(selectedFunds.fundA, fund);
    setSearchB(fund.scheme_name);
    setShowDropdownB(false);
  };

  const clearFundA = () => {
    onFundSelect(null, selectedFunds.fundB);
    setSearchA('');
    setSelectedCategoryA('');
    setFundTypeFilterA('All');
    setAssetTypeFilterA('All');
  };

  const clearFundB = () => {
    onFundSelect(selectedFunds.fundA, null);
    setSearchB('');
    setSelectedCategoryB('');
    setFundTypeFilterB('All');
    setAssetTypeFilterB('All');
  };

  const CategoryBadge: React.FC<{ categoryId: string }> = ({ categoryId }) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return null;
    
    const colorMap: Record<string, string> = {
      'large-cap': 'bg-blue-500/20 text-blue-300',
      'mid-cap': 'bg-yellow-500/20 text-yellow-300',
      'small-cap': 'bg-green-500/20 text-green-300',
      'micro-cap': 'bg-purple-500/20 text-purple-300',
      'defense': 'bg-red-500/20 text-red-300',
      'banking': 'bg-indigo-500/20 text-indigo-300',
      'technology': 'bg-cyan-500/20 text-cyan-300',
      'pharma': 'bg-pink-500/20 text-pink-300',
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${colorMap[categoryId] || 'bg-gray-500/20 text-gray-300'}`}>
        {category.name}
      </span>
    );
  };

  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6 mb-6 relative z-10">
      <h2 className="text-xl font-semibold mb-4 text-white">Select Funds to Compare</h2>
      
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Fund A Selector */}
        <div className="flex-1 space-y-4 relative" style={{ zIndex: 1002 }} ref={dropdownRefA}>
          <div className="flex items-center justify-between mt-0">
            <label className="block text-sm font-medium text-gray-300">
              Fund A
            </label>
            {selectedFunds.fundA && (
              <button
                onClick={clearFundA}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategoryA}
              onChange={(e) => setSelectedCategoryA(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All Categories</option>
              {primaryCategories.map(category => (
                <optgroup key={category.id} label={category.name}>
                  {subCategories
                    .filter(sub => sub.parent_id === category.id)
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Additional Filters */}
          <div className="space-y-3">
            {/* Fund Type Filter */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Fund Type</div>
              <div className="flex gap-2">
                {['All', 'ETF', 'Index Fund'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFundTypeFilterA(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                      fundTypeFilterA === type
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Type Filter */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Asset Type</div>
              <div className="flex gap-2">
                {['All', 'Equity', 'Debt'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAssetTypeFilterA(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                      assetTypeFilterA === type
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for first fund..."
              value={searchA}
              onChange={(e) => {
                setSearchA(e.target.value);
                setShowDropdownA(true);
              }}
              onFocus={() => setShowDropdownA(true)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            
            {showDropdownA && (
              <div 
                className="absolute w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-80 overflow-auto"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  zIndex: 10000,
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0
                }}>
                {filteredFundsA.length > 0 ? (
                  filteredFundsA.map((fund) => (
                    <button
                      key={fund.id}
                      onClick={() => handleFundSelectA(fund)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">{fund.scheme_name}</div>
                          <div className="text-gray-400 text-xs">{fund.fund_house}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge categoryId={fund.category_id} />
                            <span className="text-xs text-gray-500">ER: {fund.expense_ratio}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-center text-sm">
                    No funds found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fund B Selector */}
        <div className="flex-1 space-y-4 relative" style={{ zIndex: 1001 }} ref={dropdownRefB}>
          <div className="flex items-center justify-between mt-0">
            <label className="block text-sm font-medium text-gray-300">
              Fund B
            </label>
            {selectedFunds.fundB && (
              <button
                onClick={clearFundB}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          
          {/* Category Filter */}
          <select
            value={selectedCategoryB}
            onChange={(e) => setSelectedCategoryB(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Categories</option>
            {primaryCategories.map(category => (
              <optgroup key={category.id} label={category.name}>
                {subCategories
                  .filter(sub => sub.parent_id === category.id)
                  .map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>

          {/* Additional Filters */}
          <div className="space-y-3">
            {/* Fund Type Filter */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Fund Type</div>
              <div className="flex gap-2">
                {['All', 'ETF', 'Index Fund'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFundTypeFilterB(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                      fundTypeFilterB === type
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Type Filter */}
            <div>
              <div className="text-xs text-gray-400 mb-2">Asset Type</div>
              <div className="flex gap-2">
                {['All', 'Equity', 'Debt'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setAssetTypeFilterB(type)}
                    className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                      assetTypeFilterB === type
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-gray-800/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for second fund..."
              value={searchB}
              onChange={(e) => {
                setSearchB(e.target.value);
                setShowDropdownB(true);
              }}
              onFocus={() => setShowDropdownB(true)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            
            {showDropdownB && (
              <div 
                className="absolute w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-80 overflow-auto"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  zIndex: 10000,
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0
                }}>
                {filteredFundsB.length > 0 ? (
                  filteredFundsB.map((fund) => (
                    <button
                      key={fund.id}
                      onClick={() => handleFundSelectB(fund)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm truncate">{fund.scheme_name}</div>
                          <div className="text-gray-400 text-xs">{fund.fund_house}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge categoryId={fund.category_id} />
                            <span className="text-xs text-gray-500">ER: {fund.expense_ratio}%</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-center text-sm">
                    No funds found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Funds Display */}
      {(selectedFunds.fundA || selectedFunds.fundB) && (
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              {selectedFunds.fundA ? (
                <div>
                  <div className="text-yellow-400 font-medium text-sm">{selectedFunds.fundA.scheme_name}</div>
                  <div className="text-gray-400 text-xs mt-1">{selectedFunds.fundA.fund_house}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <CategoryBadge categoryId={selectedFunds.fundA.category_id} />
                    <span className="text-xs text-gray-500">AUM: ₹{selectedFunds.fundA.aum.toLocaleString('en-IN')} Cr</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Select Fund A</div>
              )}
            </div>
            
            <div className="text-gray-400 text-center px-4">
              <div className="text-lg font-bold">VS</div>
            </div>
            
            <div className="flex-1">
              {selectedFunds.fundB ? (
                <div>
                  <div className="text-yellow-400 font-medium text-sm">{selectedFunds.fundB.scheme_name}</div>
                  <div className="text-gray-400 text-xs mt-1">{selectedFunds.fundB.fund_house}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <CategoryBadge categoryId={selectedFunds.fundB.category_id} />
                    <span className="text-xs text-gray-500">AUM: ₹{selectedFunds.fundB.aum.toLocaleString('en-IN')} Cr</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">Select Fund B</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundSelector;
