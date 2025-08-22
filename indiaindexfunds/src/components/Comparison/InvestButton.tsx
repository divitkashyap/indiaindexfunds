import React from 'react';

interface InvestButtonProps {
  slug: string;
  fundName: string;
  disabled?: boolean;
}

const InvestButton: React.FC<InvestButtonProps> = ({ slug, fundName, disabled = false }) => {
  const handleInvestClick = () => {
    if (disabled) return;
    
    // Open external investment URL in new tab
    const investmentUrl = `https://invest.example.com/fund/${slug}`;
    window.open(investmentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleInvestClick}
      disabled={disabled}
      className={`
        w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
        ${disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-accent hover:bg-accent-hover text-white focus:ring-accent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }
      `}
      title={disabled ? 'Select a fund to invest' : `Invest in ${fundName}`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>Invest in {fundName || 'Fund'}</span>
        {!disabled && (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

export default InvestButton;
