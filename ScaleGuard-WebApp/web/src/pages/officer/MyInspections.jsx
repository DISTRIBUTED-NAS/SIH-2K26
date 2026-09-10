import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { inspectionService } from '../../services/inspectionService';
import {
  ClipboardCheck,
  Search,
  Calendar,
  MapPin,
  Clock,
  Building,
  Scale,
  Eye,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  PlayCircle
} from 'lucide-react';

export const MyInspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInspections();
  }, [activeTab, startDate, endDate]);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }
      const data = await inspectionService.getMyInspections(params);
      setInspections(data || []);
    } catch (err) {
      console.error('Failed to load officer inspections', err);
      setError(err.response?.data?.message || 'Failed to load your assigned inspections.');
    } finally {
      setLoading(false);
    }
  };

  const filteredInspections = inspections.filter((insp) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      insp.inspectionNumber?.toLowerCase().includes(term) ||
      insp.applicationNumber?.toLowerCase().includes(term) ||
      insp.businessName?.toLowerCase().includes(term) ||
      insp.location?.toLowerCase().includes(term) ||
      insp.instrumentName?.toLowerCase().includes(term)
    );
  });

  const counts = {
    all: inspections.length,
    scheduled: inspections.filter((i) => i.status === 'SCHEDULED').length,
    inProgress: inspections.filter((i) => i.status === 'IN_PROGRESS').length,
    completed: inspections.filter((i) => i.status === 'COMPLETED').length,
    cancelled: inspections.filter((i) => i.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/dashboard/officer"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Officer Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center">
              <ClipboardCheck className="w-7 h-7 mr-2.5 text-blue-600" />
              My Inspection Schedule
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage on-site physical verifications, track field inspections, and record observations.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/officer/applications"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            >
              View Assigned Dockets
            </Link>
          </div>
        </div>

        {/* KPI Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.all}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block">Scheduled</span>
            <span className="text-2xl font-bold text-blue-800 mt-1 block">{counts.scheduled}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">In Progress</span>
            <span className="text-2xl font-bold text-amber-800 mt-1 block">{counts.inProgress}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Completed</span>
            <span className="text-2xl font-bold text-emerald-800 mt-1 block">{counts.completed}</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
              {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Date Filters & Search */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="End Date"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-xs text-blue-600 hover:underline ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search inspections..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-600">Loading inspection schedules...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-rose-800">{error}</p>
            <button
              onClick={fetchInspections}
              className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No inspections found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || activeTab !== 'ALL' || startDate || endDate
                ? 'No inspections matched your filter criteria.'
                : 'You have not scheduled any inspections yet. Head over to your assigned applications to schedule one.'}
            </p>
            <Link
              to="/officer/applications"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-colors"
            >
              Browse Assigned Applications
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((insp) => (
              <div
                key={insp.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {insp.inspectionNumber}
                      </span>
                      <InspectionStatusBadge status={insp.status} />
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        App: {insp.applicationNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-6 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{insp.businessName}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Scale className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{insp.instrumentName}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{insp.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="flex items-center text-xs font-medium text-slate-800 space-x-1">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {insp.scheduledAt ? new Date(insp.scheduledAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {insp.status === 'COMPLETED' && insp.completedAt
                          ? `Done: ${new Date(insp.completedAt).toLocaleDateString()}`
                          : 'Scheduled Slot'}
                      </span>
                    </div>

                    <Link
                      to={`/officer/inspections/${insp.id}`}
                      className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-medium rounded-xl transition-colors shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
