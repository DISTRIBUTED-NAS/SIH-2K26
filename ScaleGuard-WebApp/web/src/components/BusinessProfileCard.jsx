import React from 'react';
import { Building2, MapPin, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BusinessProfileCard = ({ business, showAction = true }) => {
  if (!business) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-gov-50 rounded-lg text-gov-700 mt-1">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{business.businessName}</h3>
              <p className="text-sm text-slate-500">{business.businessType}</p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {business.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-slate-600">
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="truncate">{business.contactEmail}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{business.contactPhone}</span>
          </div>
          <div className="flex items-start space-x-2 md:col-span-2">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              {business.addressLine1}
              {business.addressLine2 ? `, ${business.addressLine2}` : ''}, {business.city}, {business.state} - {business.pincode}, {business.country}
            </span>
          </div>
        </div>

        {business.gstNumber && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center space-x-4">
            <span>GSTIN: <strong className="font-mono text-slate-700">{business.gstNumber}</strong></span>
            {business.registrationNumber && (
              <span>Reg No: <strong className="font-mono text-slate-700">{business.registrationNumber}</strong></span>
            )}
          </div>
        )}
      </div>

      {showAction && (
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
          <Link
            to="/business-profile"
            id="view-business-profile-link"
            className="inline-flex items-center text-xs font-semibold text-gov-700 hover:text-gov-800 transition-colors"
          >
            View Complete Business Profile
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
