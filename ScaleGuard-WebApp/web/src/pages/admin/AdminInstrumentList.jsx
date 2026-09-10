import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InstrumentStatusBadge } from '../../components/InstrumentStatusBadge';
import {
  instrumentService,
  INSTRUMENT_TYPES,
  getInstrumentTypeLabel,
} from '../../services/instrumentService';
import {
  Scale,
  Search,
  Filter,
  Eye,
  RefreshCw,
  AlertTriangle,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export const AdminInstrumentList = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [businessIdFilter, setBusinessIdFilter] = useState('');

  const fetchInstruments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.instrumentType = typeFilter;
      if (businessIdFilter.trim()) params.businessId = businessIdFilter.trim();

      const data = await instrumentService.getAllInstrumentsForAdmin(params);
      setInstruments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load registry instruments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [statusFilter, typeFilter]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchInstruments();
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setBusinessIdFilter('');
    instrumentService.getAllInstrumentsForAdmin({}).then(setInstruments).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-2">
            LEGAL METROLOGY ASSET GOVERNANCE
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-purple-700" />
                Statewide Instrument Registry
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Centralized registry of weighing and measuring instruments registered by verified commercial entities.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Read-Only Compliance Inspector</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Error Loading Instruments</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Search & Multi-Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, manufacturer, model, serial..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Instrument Types</option>
                {INSTRUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <input
                type="number"
                value={businessIdFilter}
                onChange={(e) => setBusinessIdFilter(e.target.value)}
                placeholder="Biz ID"
                title="Filter by Business ID"
                className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filter
              </button>
              {(search || statusFilter || typeFilter || businessIdFilter) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 rounded-lg"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Admin Instruments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-purple-600 mb-2" />
              <p className="text-sm">Loading statewide asset registry...</p>
            </div>
          ) : instruments.length === 0 ? (
            <div className="p-12 text-center">
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Instruments Registered</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No instruments match the specified criteria across registered business entities.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3.5">Instrument / Serial</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Registered Business</th>
                    <th className="px-6 py-3.5">Jurisdiction</th>
                    <th className="px-6 py-3.5">Capacity</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">
                          {inst.instrumentName}
                        </span>
                        <span className="font-mono text-xs text-slate-600 font-medium block">
                          SN: {inst.serialNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {getInstrumentTypeLabel(inst.instrumentType)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 text-xs flex items-center">
                          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {inst.businessName || `Business #${inst.businessId}`}
                        </div>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          ID: #{inst.businessId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {inst.businessCity}, {inst.businessState}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {inst.capacity} {inst.capacityUnit}
                      </td>
                      <td className="px-6 py-4">
                        <InstrumentStatusBadge status={inst.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/admin/instruments/${inst.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-lg transition-colors border border-purple-200"
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
        </div>
      </main>
    </div>
  );
};
