import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import {
  verificationApplicationService,
  APPLICATION_TYPES,
  APPLICATION_STATUSES
} from '../../services/verificationApplicationService';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Building2,
  Scale,
  Calendar,
  AlertCircle,
  Shield,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { OfficerAssignmentModal } from '../../components/OfficerAssignmentModal';

export const AdminVerificationApplicationList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppForAssignment, setSelectedAppForAssignment] = useState(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [businessIdFilter, setBusinessIdFilter] = useState('');
  const [instrumentIdFilter, setInstrumentIdFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, typeFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.applicationType = typeFilter;
      if (businessIdFilter.trim()) params.businessId = businessIdFilter.trim();
      if (instrumentIdFilter.trim()) params.instrumentId = instrumentIdFilter.trim();
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const data = await verificationApplicationService.getAllApplicationsForAdmin(params);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load admin applications', err);
      setError(err.response?.data?.message || 'Failed to fetch statewide verification applications.');
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
    setBusinessIdFilter('');
    setInstrumentIdFilter('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard/admin"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-gov-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Admin Console
          </Link>

          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            Statewide Registry • Read Only
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 mb-2">
                STATE LEGAL METROLOGY HEADQUARTERS
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Statewide Verification Applications Registry
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Central regulatory oversight and inspection docket for all weighing & measuring equipment.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Shield className="w-4 h-4 text-gov-600" />
              <span>Admin Read-Only Mode</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <input
                type="text"
                placeholder="Search app #, instrument, serial, purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white text-slate-800"
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

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white text-slate-700"
              >
                <option value="">All Types</option>
                {APPLICATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Business ID Filter */}
            <div>
              <input
                type="number"
                placeholder="Business ID"
                value={businessIdFilter}
                onChange={(e) => setBusinessIdFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-500 focus:bg-white text-slate-700"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-sm font-semibold text-gov-700 bg-gov-50 hover:bg-gov-100 rounded-lg border border-gov-200 transition-colors"
              >
                Filter
              </button>
              {(searchTerm || statusFilter || typeFilter || businessIdFilter || instrumentIdFilter) && (
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
              <p className="text-sm">Loading statewide verification applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                No verification applications in registry
              </h3>
              <p className="text-sm mt-1 max-w-md mx-auto">
                No applications matching current search or filter criteria were found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Application #</th>
                    <th className="py-3.5 px-4">Business</th>
                    <th className="py-3.5 px-4">Instrument</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Assigned Officer</th>
                    <th className="py-3.5 px-4">Requested Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Application # */}
                      <td className="py-4 px-4 font-mono font-semibold text-gov-700">
                        <Link
                          to={`/admin/verification-applications/${app.id}`}
                          className="hover:underline"
                        >
                          {app.applicationNumber}
                        </Link>
                      </td>

                      {/* Business */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">
                          {app.businessName || 'Business #' + app.businessId}
                        </div>
                        <div className="text-xs text-slate-500">
                          {app.businessCity}, {app.businessState}
                        </div>
                        {app.businessGst && (
                          <div className="text-xs text-slate-400 font-mono">
                            GST: {app.businessGst}
                          </div>
                        )}
                      </td>

                      {/* Instrument */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {app.instrument?.instrumentName || 'Device'}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          SN: {app.instrument?.serialNumber || 'N/A'}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4">
                        <ApplicationTypeBadge type={app.applicationType} />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <ApplicationStatusBadge status={app.status} />
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-4 px-4">
                        {app.assignedOfficer ? (
                          <div>
                            <div className="font-medium text-slate-900 text-xs">{app.assignedOfficer.name}</div>
                            <div className="text-xs font-mono text-slate-500">{app.assignedOfficer.officerCode}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Requested Date */}
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {app.requestedDate || 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {(app.status === 'SUBMITTED' || app.status === 'OFFICER_ASSIGNED') && (
                            <button
                              onClick={() => {
                                setSelectedAppForAssignment(app);
                                setIsAssignmentModalOpen(true);
                              }}
                              title={app.status === 'OFFICER_ASSIGNED' ? 'Reassign Officer' : 'Assign Officer'}
                              className={`inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                app.status === 'OFFICER_ASSIGNED'
                                  ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
                                  : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
                              }`}
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1" />
                              {app.status === 'OFFICER_ASSIGNED' ? 'Reassign' : 'Assign'}
                            </button>
                          )}
                          <Link
                            to={`/admin/verification-applications/${app.id}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-gov-700 bg-gov-50 hover:bg-gov-100 border border-gov-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Inspect
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Officer Assignment Modal */}
        <OfficerAssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedAppForAssignment(null);
          }}
          application={selectedAppForAssignment}
          onSuccess={fetchApplications}
        />
      </main>
    </div>
  );
};
