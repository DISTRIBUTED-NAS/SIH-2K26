import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import {
  verificationApplicationService,
  APPLICATION_TYPES,
  APPLICATION_STATUSES
} from '../../services/verificationApplicationService';
import { instrumentService } from '../../services/instrumentService';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Scale
} from 'lucide-react';

export const VerificationApplicationList = () => {
  const location = useLocation();
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [instrumentFilter, setInstrumentFilter] = useState('');

  // Modals state
  const [submitModalApp, setSubmitModalApp] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [deleteModalApp, setDeleteModalApp] = useState(null);
  const [deletingAction, setDeletingAction] = useState(false);

  useEffect(() => {
    fetchInstruments();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, typeFilter, instrumentFilter]);

  const fetchInstruments = async () => {
    try {
      const data = await instrumentService.getMyInstruments();
      setInstruments(data);
    } catch (err) {
      console.error('Failed to load instruments for filter', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.applicationType = typeFilter;
      if (instrumentFilter) params.instrumentId = instrumentFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await verificationApplicationService.getMyApplications(params);
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
      setError(err.response?.data?.message || 'Failed to load verification applications.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setInstrumentFilter('');
  };

  // Submit Application handler
  const handleConfirmSubmit = async () => {
    if (!submitModalApp) return;
    try {
      setSubmittingAction(true);
      await verificationApplicationService.submitApplication(submitModalApp.id);
      setSubmitModalApp(null);
      setSuccessMessage(`Application ${submitModalApp.applicationNumber} has been officially submitted.`);
      fetchApplications();
    } catch (err) {
      console.error('Failed to submit application', err);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete Draft Application handler
  const handleConfirmDelete = async () => {
    if (!deleteModalApp) return;
    try {
      setDeletingAction(true);
      await verificationApplicationService.deleteDraftApplication(deleteModalApp.id);
      setDeleteModalApp(null);
      setSuccessMessage(`Draft application ${deleteModalApp.applicationNumber} has been deleted.`);
      fetchApplications();
    } catch (err) {
      console.error('Failed to delete draft application', err);
      setError(err.response?.data?.message || 'Failed to delete application.');
    } finally {
      setDeletingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage('')}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
            <button
              onClick={() => setError('')}
              className="text-red-700 hover:text-red-900 text-xs font-semibold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gov-50 text-gov-700 border border-gov-200 mb-2">
                STATUTORY VERIFICATION LIFECYCLE
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Verification Applications
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage legal metrology inspection requests for your weighing & measuring devices.
              </p>
            </div>

            <Link
              to="/verification-applications/create"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gov-600 hover:bg-gov-700 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Verification Application
            </Link>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search by app #, instrument, serial, purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white text-slate-700"
              >
                <option value="">All Statuses</option>
                {APPLICATION_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Application Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white text-slate-700"
              >
                <option value="">All Verification Types</option>
                {APPLICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold text-gov-700 bg-gov-50 hover:bg-gov-100 rounded-lg border border-gov-200 transition-colors"
              >
                Filter
              </button>
              {(searchTerm || statusFilter || typeFilter || instrumentFilter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Loading verification applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                No verification applications found
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {searchTerm || statusFilter || typeFilter || instrumentFilter
                  ? 'No applications match your active filter criteria.'
                  : 'You have not submitted or drafted any verification applications yet.'}
              </p>
              {!searchTerm && !statusFilter && !typeFilter && !instrumentFilter && (
                <Link
                  to="/verification-applications/create"
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-gov-600 bg-gov-50 hover:bg-gov-100 border border-gov-200 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Draft Your First Application
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Application #</th>
                    <th className="py-3.5 px-4">Instrument</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {applications.map((app) => {
                    const isDraft = app.status === 'DRAFT';
                    return (
                      <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Application Number */}
                        <td className="py-4 px-4 font-mono font-semibold text-gov-700">
                          <Link
                            to={`/verification-applications/${app.id}`}
                            className="hover:underline"
                          >
                            {app.applicationNumber}
                          </Link>
                          <div className="text-xs font-sans text-slate-400 font-normal">
                            ID: #{app.id}
                          </div>
                        </td>

                        {/* Instrument */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">
                            {app.instrument?.instrumentName || 'Instrument'}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            SN: {app.instrument?.serialNumber || 'N/A'}
                          </div>
                        </td>

                        {/* Application Type */}
                        <td className="py-4 px-4">
                          <ApplicationTypeBadge type={app.applicationType} />
                        </td>

                        {/* Dates */}
                        <td className="py-4 px-4">
                          <div className="text-xs text-slate-600">
                            <span className="text-slate-400">Req: </span>
                            {app.requestedDate || 'Today'}
                          </div>
                          {app.preferredInspectionDate && (
                            <div className="text-xs text-indigo-700 font-medium">
                              <span className="text-slate-400">Pref: </span>
                              {app.preferredInspectionDate}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <ApplicationStatusBadge status={app.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            {/* View Details */}
                            <Link
                              to={`/verification-applications/${app.id}`}
                              title="View Application Details"
                              className="p-1.5 text-slate-500 hover:text-gov-600 hover:bg-gov-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Edit (DRAFT only) */}
                            {isDraft && (
                              <Link
                                to={`/verification-applications/${app.id}/edit`}
                                title="Edit Draft"
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Submit (DRAFT only) */}
                            {isDraft && (
                              <button
                                type="button"
                                onClick={() => setSubmitModalApp(app)}
                                title="Submit Application"
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete (DRAFT only) */}
                            {isDraft && (
                              <button
                                type="button"
                                onClick={() => setDeleteModalApp(app)}
                                title="Delete Draft"
                                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* CONFIRM SUBMISSION MODAL */}
      {submitModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Submit Verification Application?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Application <strong className="font-mono text-slate-900">{submitModalApp.applicationNumber}</strong> for{' '}
              <strong>{submitModalApp.instrument?.instrumentName}</strong> will be formally lodged with the Legal Metrology authority.
            </p>

            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
              <strong>Notice:</strong> Once submitted, this application cannot be edited or deleted.
            </div>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => setSubmitModalApp(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center"
              >
                {submittingAction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Yes, Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DRAFT MODAL */}
      {deleteModalApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Delete Draft Application?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete draft application{' '}
              <strong className="font-mono text-slate-900">{deleteModalApp.applicationNumber}</strong>? This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={deletingAction}
                onClick={() => setDeleteModalApp(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingAction}
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors flex items-center"
              >
                {deletingAction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Draft'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
