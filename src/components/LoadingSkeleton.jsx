import React from 'react';

// Base skeleton component
const Skeleton = ({ className = '', height = 'h-4', width = 'w-full' }) => (
  <div className={`${height} ${width} bg-gray-200 rounded animate-pulse ${className}`}></div>
);

// Card skeleton
export const CardSkeleton = ({ count = 1 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton height="h-4" width="w-3/4" />
            <Skeleton height="h-3" width="w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton height="h-3" />
          <Skeleton height="h-3" />
          <Skeleton height="h-3" width="w-3/4" />
        </div>
        <div className="flex justify-between mt-4">
          <Skeleton height="h-8" width="w-20" />
          <Skeleton height="h-8" width="w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 px-6 py-4">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height="h-4" width="w-1/4" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="h-4" width="w-1/4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dashboard skeleton
export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Skeleton height="h-8" width="w-1/3" className="mb-2" />
        <Skeleton height="h-4" width="w-1/2" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton height="h-4" width="w-3/4" className="mb-2" />
                <Skeleton height="h-8" width="w-1/2" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton height="h-6" width="w-1/3" className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton height="h-4" width="w-3/4" />
                  <Skeleton height="h-3" width="w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <Skeleton height="h-6" width="w-1/3" className="mb-4" />
          <Skeleton height="h-48" className="mb-4" />
          <div className="flex justify-between">
            <Skeleton height="h-8" width="w-20" />
            <Skeleton height="h-8" width="w-20" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
    <Skeleton height="h-6" width="w-1/3" className="mb-6" />
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index}>
          <Skeleton height="h-4" width="w-1/4" className="mb-2" />
          <Skeleton height="h-10" />
        </div>
      ))}
    </div>
    <div className="flex justify-end space-x-3 mt-6">
      <Skeleton height="h-10" width="w-20" />
      <Skeleton height="h-10" width="w-24" />
    </div>
  </div>
);

// Event card skeleton
export const EventCardSkeleton = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <Skeleton height="h-48" />
        <div className="p-6">
          <Skeleton height="h-6" width="w-3/4" className="mb-2" />
          <Skeleton height="h-4" width="w-1/2" className="mb-4" />
          <div className="space-y-2 mb-4">
            <Skeleton height="h-3" />
            <Skeleton height="h-3" />
            <Skeleton height="h-3" width="w-2/3" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton height="h-4" width="w-1/3" />
            <Skeleton height="h-8" width="w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Loading spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin ${className}`}>
      <svg className="w-full h-full text-[#052659]" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Page loading
export const PageLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" className="mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading...</h2>
      <p className="text-gray-500">Please wait while we load your content</p>
    </div>
  </div>
);

export default Skeleton;