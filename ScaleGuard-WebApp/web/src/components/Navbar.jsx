import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            ADMINISTRATOR
          </span>
        );
      case 'BUSINESS_OWNER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            BUSINESS OWNER
          </span>
        );
      case 'LMO_OFFICER':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            LMO OFFICER
          </span>
        );
      default:
        return null;
    }
  };

  const isActive = (path) => {
    if (path === '/dashboard/admin' || path === '/dashboard/business-owner' || path === '/dashboard/officer') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Title */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gov-900 text-white p-2 rounded-xl shadow-sm">
                <ShieldCheck className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">SCALEGUARD</span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    Legal Metrology Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Digital Verification & Certification System
                </p>
              </div>
            </Link>

            {/* Role Navigation Links */}
            {user && (
              <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold">
                {user.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/dashboard/admin"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/dashboard/admin')
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Console
                    </Link>
                    <Link
                      to="/admin/businesses"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/businesses')
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Businesses
                    </Link>
                    <Link
                      to="/admin/instruments"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/instruments')
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Instruments
                    </Link>
                    <Link
                      to="/admin/verification-applications"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/verification-applications')
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Applications
                    </Link>
                    <Link
                      to="/admin/officers"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/officers')
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Officers
                    </Link>
                    <Link
                      to="/admin/inspections"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/admin/inspections')
                          ? 'bg-purple-50 text-purple-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Inspections
                    </Link>
                  </>
                )}

                {user.role === 'LMO_OFFICER' && (
                  <>
                    <Link
                      to="/dashboard/officer"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/dashboard/officer')
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/officer/applications"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/officer/applications')
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Assigned Dockets
                    </Link>
                    <Link
                      to="/officer/inspections"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/officer/inspections')
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Inspections
                    </Link>
                    <Link
                      to="/officer/profile"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/officer/profile')
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Officer Profile
                    </Link>
                  </>
                )}

                {user.role === 'BUSINESS_OWNER' && (
                  <>
                    <Link
                      to="/dashboard/business-owner"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/dashboard/business-owner')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/business-profile"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/business-profile')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Business Profile
                    </Link>
                    <Link
                      to="/instruments"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/instruments')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Instruments
                    </Link>
                    <Link
                      to="/verification-applications"
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        isActive('/verification-applications')
                          ? 'bg-emerald-50 text-emerald-800 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Applications
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-sm font-semibold text-slate-800">{user.fullName}</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <button
                id="logout-btn"
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-600 transition-colors"
                title="Sign out of your session"
              >
                <LogOut className="h-4 w-4 mr-1.5 text-slate-500" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
