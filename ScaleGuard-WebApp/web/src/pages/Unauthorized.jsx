import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getTargetDashboard = () => {
    if (!user) return '/login';
    if (user.role === 'BUSINESS_OWNER') return '/dashboard/business-owner';
    if (user.role === 'ADMIN') return '/dashboard/admin';
    return '/login';
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">403 - Access Denied</h1>
        
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          You do not have the necessary security privileges or role clearance to access this portal or resource.
        </p>

        {user && (
          <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            Current Authenticated Role: <span className="font-semibold text-slate-800">{user.role}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Go Back
          </button>

          <Link
            to={getTargetDashboard()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gov-700 hover:bg-gov-800 focus:outline-none transition-colors"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
