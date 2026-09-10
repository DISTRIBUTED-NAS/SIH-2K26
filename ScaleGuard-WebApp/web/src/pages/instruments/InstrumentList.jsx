import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InstrumentStatusBadge } from '../../components/InstrumentStatusBadge';
import {
  instrumentService,
  INSTRUMENT_TYPES,
  getInstrumentTypeLabel,
} from '../../services/instrumentService';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

export const InstrumentList = () => {
  const location = useLocation();
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(location.state?.message || null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Status toggle modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchInstruments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.instrumentType = typeFilter;

      const data = await instrumentService.getMyInstruments(params);
      setInstruments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load instruments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, [statusFilter, typeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInstruments();
  };

  const openStatusModal = (instrument) => {
    setSelectedInstrument(instrument);
    setModalOpen(true);
  };

  const closeStatusModal = () => {
    setSelectedInstrument(null);
    setModalOpen(false);
  };

  const handleConfirmStatusToggle = async () => {
    if (!selectedInstrument) return;
    setUpdatingStatus(true);
    try {
      const nextStatus = selectedInstrument.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await instrumentService.updateMyInstrumentStatus(selectedInstrument.id, nextStatus);
      setFlashMessage(`Instrument ${selectedInstrument.serialNumber} marked as ${nextStatus}.`);
      closeStatusModal();
      fetchInstruments();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update instrument status.');
      closeStatusModal();
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gov-100 text-gov-800 border border-gov-200 mb-2">
              EQUIPMENT & ASSET REGISTRY
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Scale className="w-6 h-6 mr-2 text-gov-600" />
              Instrument Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage weighing and measuring instruments registered under your legal metrology business profile.
            </p>
          </div>

          <Link
            to="/instruments/create"
            id="add-instrument-btn"
            className="inline-flex items-center justify-center px-4 py-2.5 bg-gov-600 hover:bg-gov-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Instrument
          </Link>
        </div>

        {/* Flash Message */}
        {flashMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-emerald-600 flex-shrink-0" />
              <span>{flashMessage}</span>
            </div>
            <button
              onClick={() => setFlashMessage(null)}
              className="text-emerald-600 hover:text-emerald-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, manufacturer, model, serial..."
                className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-gov-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gov-500"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gov-500"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <Filter className="w-3.5 h-3.5 mr-1" />
                Filter
              </button>
              {(search || statusFilter || typeFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('');
                    setTypeFilter('');
                  }}
                  className="px-2.5 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 rounded-lg"
                  title="Clear filters"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Instruments Table / List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gov-600 mb-2" />
              <p className="text-sm">Loading registered instruments...</p>
            </div>
          ) : instruments.length === 0 ? (
            <div className="p-12 text-center">
              <Scale className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Instruments Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {search || statusFilter || typeFilter
                  ? 'No instruments match your filter criteria. Try adjusting search terms or resetting filters.'
                  : 'You have not registered any weighing or measuring instruments yet. Register your first instrument to begin verification workflows.'}
              </p>
              {!search && !statusFilter && !typeFilter && (
                <Link
                  to="/instruments/create"
                  className="inline-flex items-center px-4 py-2 mt-4 bg-gov-600 hover:bg-gov-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add First Instrument
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-3.5">Instrument</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Serial Number</th>
                    <th className="px-6 py-3.5">Capacity / Accuracy</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instruments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">
                          {inst.instrumentName}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          {inst.manufacturer} &bull; Model: {inst.modelNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {getInstrumentTypeLabel(inst.instrumentType)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-800">
                        {inst.serialNumber}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-700">
                        <div>
                          <span className="font-semibold">{inst.capacity}</span> {inst.capacityUnit}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Acc: {inst.accuracy} {inst.accuracyUnit}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600 max-w-[180px] truncate" title={inst.location}>
                        {inst.location}
                      </td>
                      <td className="px-6 py-4">
                        <InstrumentStatusBadge status={inst.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Link
                            to={`/instruments/${inst.id}`}
                            title="View Instrument"
                            className="p-1.5 text-slate-500 hover:text-gov-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/instruments/${inst.id}/edit`}
                            title="Edit Instrument"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openStatusModal(inst)}
                            title={inst.status === 'ACTIVE' ? 'Deactivate Instrument' : 'Activate Instrument'}
                            className={`p-1.5 rounded-md transition-colors ${
                              inst.status === 'ACTIVE'
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
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
        </div>
      </main>

      {/* Status Toggle Modal */}
      {modalOpen && selectedInstrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {selectedInstrument.status === 'ACTIVE' ? 'Deactivate Instrument?' : 'Activate Instrument?'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to change the status of{' '}
              <span className="font-semibold text-slate-800">{selectedInstrument.instrumentName}</span> (SN:{' '}
              <span className="font-mono">{selectedInstrument.serialNumber}</span>) to{' '}
              <span className="font-bold">
                {selectedInstrument.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}
              </span>
              ? Instruments are never deleted and can be reactivated at any time.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={closeStatusModal}
                disabled={updatingStatus}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusToggle}
                disabled={updatingStatus}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                  selectedInstrument.status === 'ACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {updatingStatus
                  ? 'Updating...'
                  : selectedInstrument.status === 'ACTIVE'
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
