import React from 'react';

export type TimeframeOption = '1Y' | '3Y' | '5Y' | 'custom';

interface TimeframeToggleProps {
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (timeframe: TimeframeOption) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomDateChange?: (startDate: Date, endDate: Date) => void;
}

const TimeframeToggle: React.FC<TimeframeToggleProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
}) => {
  const timeframeOptions: { value: TimeframeOption; label: string }[] = [
    { value: '1Y', label: '1 Year' },
    { value: '3Y', label: '3 Years' },
    { value: '5Y', label: '5 Years' },
    { value: 'custom', label: 'Custom' },
  ];

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleCustomStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    if (customEndDate && onCustomDateChange) {
      onCustomDateChange(newStartDate, customEndDate);
    }
  };

  const handleCustomEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    if (customStartDate && onCustomDateChange) {
      onCustomDateChange(customStartDate, newEndDate);
    }
  };

  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Time Period</h2>
      
      {/* Timeframe Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {timeframeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onTimeframeChange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-gray-900 ${
              selectedTimeframe === option.value
                ? 'bg-accent text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range Inputs */}
      {selectedTimeframe === 'custom' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-4 bg-gray-800/30 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={customStartDate ? formatDateForInput(customStartDate) : ''}
              onChange={handleCustomStartDateChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={customEndDate ? formatDateForInput(customEndDate) : ''}
              onChange={handleCustomEndDateChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Selected Period Display */}
      <div className="mt-4 text-sm text-gray-400">
        {selectedTimeframe === 'custom' && customStartDate && customEndDate ? (
          `Custom period: ${customStartDate.toLocaleDateString()} - ${customEndDate.toLocaleDateString()}`
        ) : selectedTimeframe !== 'custom' ? (
          `Showing data for the last ${selectedTimeframe.toLowerCase()}`
        ) : (
          'Select custom date range above'
        )}
      </div>
    </div>
  );
};

export default TimeframeToggle;
