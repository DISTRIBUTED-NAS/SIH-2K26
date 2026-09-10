import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { businessService } from '../../services/businessService';
import { Building2, Search, Eye, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';

export const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBusinesses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await businessService.getAllBusinesses();
      setBusinesses(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch registered businesses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter((b) => {
    const query = searchQuery.toLowerCase();
    return (
      b.businessName.toLowerCase().includes(query) ||
      b.businessType.toLowerCase().includes(query) ||
      b.contactEmail.toLowerCase().includes(query) ||
      b.city.toLowerCase().includes(query) ||
      b.state.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
              <Link to="/dashboard/admin" className="hover:text-gov-700">Admin Console</Link>
              <span>&rarr;</span>
              <span className="text-purple-700 font-semibold">Business Directory</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Registered Business Profiles</h1>
            <p className="mt-1 text-sm text-slate-600">
              Centralized register of all commercial enterprises verified under Legal Metrology standards.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchBusinesses}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/dashboard/admin"
              className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Admin Home
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by business name, category, email, city, or state..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            {error}
          </div>
        )}

        {/* Table / List View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-slate-500">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading registered businesses...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700">No Business Profiles Found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery ? 'No businesses match your search filter.' : 'No businesses have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Business Entity</th>
                    <th scope="col" className="px-6 py-3.5">Category</th>
                    <th scope="col" className="px-6 py-3.5">Contact Email</th>
                    <th scope="col" className="px-6 py-3.5">Contact Phone</th>
                    <th scope="col" className="px-6 py-3.5">Location</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredBusinesses.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                            {b.businessName.charAt(0)}
                          </div>
                          <div>
                            <div>{b.businessName}</div>
                            <div className="text-xs font-normal text-slate-400">ID #{b.id} • Owner #{b.ownerId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{b.businessType}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs whitespace-nowrap">{b.contactEmail}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{b.contactPhone}</td>
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {b.city}, {b.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                        <Link
                          to={`/admin/businesses/${b.id}`}
                          id={`view-business-${b.id}`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
