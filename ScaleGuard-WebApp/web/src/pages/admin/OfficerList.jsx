import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { OfficerStatusBadge } from '../../components/OfficerStatusBadge';
import { officerService } from '../../services/officerService';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Power,
  Shield,
  Phone,
  Building,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const OfficerList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOfficers();
  }, [statusFilter, page]);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: 15,
      };
      if (statusFilter) params.status = statusFilter;
      if (districtFilter.trim()) params.district = districtFilter.trim();
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await officerService.getOfficers(params);
      if (data.content) {
        setOfficers(data.content);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setOfficers(data);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to load officers', err);
      setError(err.response?.data?.message || 'Failed to fetch officers directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOfficers();
  };

  const handleToggleStatus = async (officer) => {
    const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} officer ${officer.name} (${officer.officerCode})?`)) {
      return;
    }

    try {
      await officerService.updateOfficerStatus(officer.id, newStatus);
      setActionSuccess(`Officer ${officer.name} status updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchOfficers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update officer status.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Legal Metrology Officers
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage enforcement officers, jurisdictions, and assignments statewide.
            </p>
          </div>

          <div>
            <Link
              to="/admin/officers/create"
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all focus:ring-4 focus:ring-blue-100"
            >
              <Plus className="w-4 h-4 mr-2" />
              Provision New Officer
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search name, code, dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Filter by district..."
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                Filter
              </button>
              {(searchTerm || districtFilter || statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setDistrictFilter('');
                    setStatusFilter('');
                    setPage(0);
                    setTimeout(fetchOfficers, 0);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading officers...</span>
            </div>
          ) : officers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 px-4">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No officers found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                No legal metrology officers match the current filters. Provision a new officer or clear filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Officer</th>
                    <th className="py-3.5 px-4">Officer Code</th>
                    <th className="py-3.5 px-4">Designation & Dept</th>
                    <th className="py-3.5 px-4">Jurisdiction</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {officers.map((officer) => (
                    <tr key={officer.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">{officer.name}</div>
                        <div className="text-xs text-slate-500">{officer.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                          {officer.officerCode}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-slate-900 font-medium">{officer.designation}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{officer.department}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{officer.district}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-1 text-slate-600 text-xs">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{officer.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <OfficerStatusBadge status={officer.status} />
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/officers/${officer.id}`}
                            title="View Officer Details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/officers/${officer.id}/edit`}
                            title="Edit Officer"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(officer)}
                            title={officer.status === 'ACTIVE' ? 'Deactivate Officer' : 'Activate Officer'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              officer.status === 'ACTIVE'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
              <div>Page {page + 1} of {totalPages}</div>
              <div className="flex space-x-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
