import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import { officerService } from '../../services/officerService';
import {
  FileText,
  Search,
  Building,
  Scale,
  Calendar,
  Eye,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Clock,
  MapPin
} from 'lucide-react';

export const AssignedApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignedApplications();
  }, []);

  const fetchAssignedApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await officerService.getAssignedApplications();
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load assigned applications', err);
      setError(err.response?.data?.message || 'Failed to load assigned verification dockets.');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.applicationNumber?.toLowerCase().includes(term) ||
      app.businessName?.toLowerCase().includes(term) ||
      app.instrument?.serialNumber?.toLowerCase().includes(term) ||
      app.city?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to="/dashboard/officer"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Officer Dashboard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Assigned Verification Applications
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Statutory verification requests assigned to you for field inspection and calibration review.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-800 rounded-xl border border-indigo-200">
            <Clock className="w-4 h-4 text-indigo-600 mr-1.5" />
            <span>{filteredApplications.length} Verification Dockets</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by application number, business name, serial number, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-sm font-medium">Loading assigned dockets...</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 px-4">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-800">No applications found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? 'No assigned dockets match your search criteria.'
                  : 'You have no verification applications currently assigned.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Application #</th>
                    <th className="py-3.5 px-4">Applicant Business</th>
                    <th className="py-3.5 px-4">Instrument Specification</th>
                    <th className="py-3.5 px-4">Type & Status</th>
                    <th className="py-3.5 px-4">Key Dates</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Application # */}
                      <td className="py-4 px-6 font-mono font-semibold text-indigo-700">
                        <Link to={`/officer/applications/${app.id}`} className="hover:underline">
                          {app.applicationNumber}
                        </Link>
                      </td>

                      {/* Business */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900">{app.businessName}</div>
                        <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.city}, {app.state}</span>
                        </div>
                        {app.gstNumber && (
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            GSTIN: {app.gstNumber}
                          </div>
                        )}
                      </td>

                      {/* Instrument */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">
                          {app.instrument?.instrumentName || 'Instrument'}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          SN: {app.instrument?.serialNumber || 'N/A'} • {app.instrument?.modelNumber || ''}
                        </div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          Cap: {app.instrument?.capacity} {app.instrument?.capacityUnit}
                        </div>
                      </td>

                      {/* Type & Status */}
                      <td className="py-4 px-4 space-y-1">
                        <div><ApplicationStatusBadge status={app.status} /></div>
                        <div><ApplicationTypeBadge type={app.applicationType} /></div>
                      </td>

                      {/* Dates */}
                      <td className="py-4 px-4 text-xs space-y-1">
                        <div className="text-slate-700">
                          <span className="text-slate-400">Target:</span> {app.requestedDate || 'N/A'}
                        </div>
                        {app.assignedAt && (
                          <div className="text-indigo-600 font-medium">
                            <span className="text-slate-400">Assigned:</span> {new Date(app.assignedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/officer/applications/${app.id}`}
                          className="inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Inspect Docket
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
