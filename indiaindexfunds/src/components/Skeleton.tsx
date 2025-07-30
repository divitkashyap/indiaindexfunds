import React from 'react';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rows = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded mb-2 last:mb-0"></div>
      ))}
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6 mb-6">
      <Skeleton className="w-1/3 mb-4" />
      <div className="h-80 bg-gray-700/50 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="bg-glass backdrop-blur-xs rounded-2xl shadow-lg p-6">
      <Skeleton className="w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="grid grid-cols-3 gap-4">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-16" />
            <Skeleton className="w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
