import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const InstrumentStatusBadge = ({ status }) => {
  const isActive = status === 'ACTIVE';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          : 'bg-amber-100 text-amber-800 border border-amber-200'
      }`}
    >
      {isActive ? (
        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
      )}
      {status || 'UNKNOWN'}
    </span>
  );
};
