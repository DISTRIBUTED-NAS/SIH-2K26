import React from 'react';
import { getMeasurementTestStatusLabel } from '../services/measurementTestService';

export const MeasurementTestStatusBadge = ({ status, className = '' }) => {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotStyle = 'bg-slate-400';
  let pulse = false;

  switch (status) {
    case 'IN_PROGRESS':
      badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';
      dotStyle = 'bg-amber-500';
      pulse = true;
      break;
    case 'COMPLETED':
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotStyle = 'bg-emerald-500';
      break;
    default:
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyle} ${pulse ? 'animate-pulse' : ''}`}
      ></span>
      {getMeasurementTestStatusLabel(status)}
    </span>
  );
};

export default MeasurementTestStatusBadge;
