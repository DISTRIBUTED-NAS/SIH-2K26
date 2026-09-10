import React from 'react';
import { getApplicationTypeLabel } from '../services/verificationApplicationService';

export const ApplicationTypeBadge = ({ type, className = '' }) => {
  let colorStyles = 'bg-slate-100 text-slate-800 border-slate-200';

  if (type === 'INITIAL_VERIFICATION') {
    colorStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (type === 'PERIODIC_VERIFICATION') {
    colorStyles = 'bg-indigo-50 text-indigo-800 border-indigo-200';
  } else if (type === 'RE_VERIFICATION') {
    colorStyles = 'bg-cyan-50 text-cyan-800 border-cyan-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles} ${className}`}
    >
      {getApplicationTypeLabel(type)}
    </span>
  );
};
