import React from 'react';
import { getApplicationStatusLabel } from '../services/verificationApplicationService';

export const ApplicationStatusBadge = ({ status, className = '' }) => {
  const isDraft = status === 'DRAFT';
  const isSubmitted = status === 'SUBMITTED';
  const isAssigned = status === 'OFFICER_ASSIGNED';

  const isInspectionInProgress = status === 'INSPECTION_IN_PROGRESS';
  const isInspectionCompleted = status === 'INSPECTION_COMPLETED';

  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyle = 'bg-slate-400';

  if (isDraft) {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
    dotStyle = 'bg-amber-500';
  } else if (isSubmitted) {
    badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
    dotStyle = 'bg-blue-500';
  } else if (isAssigned) {
    badgeStyle = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    dotStyle = 'bg-indigo-500';
  } else if (isInspectionInProgress) {
    badgeStyle = 'bg-purple-50 text-purple-800 border-purple-200';
    dotStyle = 'bg-purple-500';
  } else if (isInspectionCompleted) {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    dotStyle = 'bg-emerald-500';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyle}`}></span>
      {getApplicationStatusLabel(status)}
    </span>
  );
};
