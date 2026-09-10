import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import { OfficerStatusBadge } from '../../components/OfficerStatusBadge';
import { officerService } from '../../services/officerService';
import {
  Shield,
  FileText,
  User,
  MapPin,
  Building,
  Calendar,
  ChevronRight,
  Eye,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ClipboardCheck
} from 'lucide-react';

export const OfficerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [profileData, appsData] = await Promise.all([
        officerService.getOfficerProfile(),
        officerService.getAssignedApplications(),
      ]);
      setProfile(profileData);
      setApplications(appsData || []);
    } catch (err) {
      console.error('Failed to load officer dashboard data', err);
      setError(err.response?.data?.message || 'Failed to load officer records.');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = applications.filter((app) => app.status === 'OFFICER_ASSIGNED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">Loading Officer Portal...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Officer Banner */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile?.name}</h1>
                      <OfficerStatusBadge status={profile?.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">{profile?.designation}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                        {profile?.officerCode}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile?.department}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-indigo-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{profile?.district} District</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to="/officer/profile"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <User className="w-4 h-4 mr-1.5" />
                    Officer Profile
                  </Link>
                  <Link
                    to="/officer/applications"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    Assigned Dockets
                  </Link>
                  <Link
                    to="/officer/inspections"
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-sm"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1.5" />
                    Inspections
                  </Link>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assignments</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-slate-900">{applications.length}</span>
                  <span className="text-xs text-slate-500">applications assigned</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Inspection</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-slate-900">{pendingCount}</span>
                  <span className="text-xs text-slate-500">awaiting field review</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jurisdiction</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MapPin className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-bold text-slate-900">{profile?.district || 'Not Assigned'}</span>
                  <p className="text-xs text-slate-500 mt-0.5">Statutory legal territory</p>
                </div>
              </div>
            </div>

            {/* Recent Assigned Applications Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Assigned Applications</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Verification requests assigned to you for inspection</p>
                </div>
                <Link
                  to="/officer/applications"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  View All ({applications.length})
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="py-16 text-center text-slate-500 px-4">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-slate-800">No applications assigned yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When the administrator assigns verification applications to your jurisdiction, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-100 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3 px-6">Application #</th>
                        <th className="py-3 px-4">Business</th>
                        <th className="py-3 px-4">Instrument</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Assigned On</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-mono font-semibold text-indigo-600">
                            <Link to={`/officer/applications/${app.id}`} className="hover:underline">
                              {app.applicationNumber}
                            </Link>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-slate-900">{app.businessName}</div>
                            <div className="text-xs text-slate-500">{app.city}, {app.state}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-slate-800">{app.instrument?.instrumentName || 'Device'}</div>
                            <div className="text-xs font-mono text-slate-500">SN: {app.instrument?.serialNumber}</div>
                          </td>
                          <td className="py-4 px-4">
                            <ApplicationStatusBadge status={app.status} />
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-500">
                            {app.assignedAt ? new Date(app.assignedAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              to={`/officer/applications/${app.id}`}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View Docket
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
