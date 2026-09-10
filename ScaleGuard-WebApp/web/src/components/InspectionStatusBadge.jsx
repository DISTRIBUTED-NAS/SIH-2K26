import React from 'react';
import { getInspectionStatusLabel } from '../services/inspectionService';

export const InspectionStatusBadge = ({ status, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyle = 'bg-slate-400';
  let pulse = false;

  switch (status) {
    case 'SCHEDULED':
      badgeStyle = 'bg-blue-50 text-blue-800 border-blue-200';
      dotStyle = 'bg-blue-500';
      break;
    case 'IN_PROGRESS':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
      dotStyle = 'bg-amber-500';
      pulse = true;
      break;
    case 'COMPLETED':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotStyle = 'bg-emerald-500';
      break;
    case 'CANCELLED':
      badgeStyle = 'bg-rose-50 text-rose-800 border-rose-200';
      dotStyle = 'bg-rose-500';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyle} ${pulse ? 'animate-ping inline-flex' : ''}`}
      ></span>
      {getInspectionStatusLabel(status)}
    </span>
  );
};
