import React from 'react';

export const OfficerStatusBadge = ({ status, className = '' }) => {
  const isActive = status === 'ACTIVE';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        isActive
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-rose-50 text-rose-800 border-rose-200'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isActive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      ></span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};
