import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { inspectionService, INSPECTION_STATUSES } from '../../services/inspectionService';
import {
  ClipboardCheck,
  Search,
  Filter,
  Eye,
  Building,
  Scale,
  Calendar,
  AlertCircle,
  Shield,
  ArrowLeft,
  User,
  MapPin,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInspections();
  }, [page, size, statusFilter, districtFilter, startDate, endDate]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size,
      };
      if (statusFilter) params.status = statusFilter;
      if (districtFilter.trim()) params.district = districtFilter.trim();
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await inspectionService.getAllInspectionsForAdmin(params);
      if (response && response.content) {
        setInspections(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else if (Array.isArray(response)) {
        setInspections(response);
        setTotalPages(1);
        setTotalElements(response.length);
      } else {
        setInspections([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Failed to load statewide inspections', err);
      setError(err.response?.data?.message || 'Failed to fetch inspections monitor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchInspections();
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setDistrictFilter('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  // Client-side quick counts or display
  const scheduledCount = inspections.filter((i) => i.status === 'SCHEDULED').length;
  const inProgressCount = inspections.filter((i) => i.status === 'IN_PROGRESS').length;
  const completedCount = inspections.filter((i) => i.status === 'COMPLETED').length;
  const cancelledCount = inspections.filter((i) => i.status === 'CANCELLED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/dashboard/admin"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Administrator Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              <ClipboardCheck className="w-8 h-8 mr-3 text-indigo-600" />
              Statewide Inspection Monitoring
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Supervise all Legal Metrology on-site inspection proceedings, officer allocations, and calibration schedules.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 font-mono font-medium">
              Total Records: {totalElements}
            </span>
          </div>
        </div>

        {/* KPI Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Tracked</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalElements}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">Scheduled</span>
            <span className="text-2xl font-bold text-blue-800 mt-1 block">{scheduledCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-bold text-amber-800 mt-1 block">{inProgressCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-bold text-emerald-800 mt-1 block">{completedCount}</span>
          </div>
        </div>

        {/* Filters and Search Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Inspection #, App #, Business, Officer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                {INSPECTION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <input
                type="text"
                placeholder="Filter by District..."
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 border border-slate-300 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Date range sub-row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="font-medium flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Scheduled Date:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            />
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setPage(0);
                }}
                className="text-xs text-indigo-600 hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-600">Loading inspection proceedings...</p>
            </div>
          ) : inspections.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No inspections found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No inspection records match the current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Inspection / Docket #</th>
                    <th className="py-3.5 px-4">Business & Location</th>
                    <th className="py-3.5 px-4">Subject Instrument</th>
                    <th className="py-3.5 px-4">Assigned LMO Officer</th>
                    <th className="py-3.5 px-4">Scheduled Slot</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspections.map((insp) => (
                    <tr key={insp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 font-mono">
                          {insp.inspectionNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          App: {insp.applicationNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{insp.businessName}</div>
                        <div className="text-slate-500 text-[11px] flex items-center mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                          <span className="truncate max-w-[180px]">{insp.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{insp.instrumentName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <Shield className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-800">{insp.officerName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          Badge: {insp.officerBadgeNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center text-slate-700 space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{insp.scheduledAt ? new Date(insp.scheduledAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <InspectionStatusBadge status={insp.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/admin/inspections/${insp.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing page <span className="font-semibold text-slate-800">{page + 1}</span> of{' '}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                  disabled={page === 0}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
