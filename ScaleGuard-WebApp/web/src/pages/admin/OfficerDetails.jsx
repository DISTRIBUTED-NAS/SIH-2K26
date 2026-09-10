import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { OfficerStatusBadge } from '../../components/OfficerStatusBadge';
import { officerService } from '../../services/officerService';
import {
  User,
  Shield,
  ArrowLeft,
  Edit2,
  Power,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle,
  Hash
} from 'lucide-react';

export const OfficerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOfficer();
  }, [id]);

  const fetchOfficer = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await officerService.getOfficerById(id);
      setOfficer(data);
    } catch (err) {
      console.error('Failed to load officer details', err);
      setError(err.response?.data?.message || 'Officer not found or server error.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!officer) return;
    const newStatus = officer.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = newStatus === 'ACTIVE' ? 'activate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${actionLabel} officer ${officer.name}?`)) {
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const updated = await officerService.updateOfficerStatus(officer.id, newStatus);
      setOfficer(updated);
      setActionSuccess(`Officer status updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update officer status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to="/admin/officers"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Officers Directory
          </Link>
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

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Loading officer details...</span>
          </div>
        ) : !officer ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Officer Record Not Found</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              The requested officer record does not exist or has been removed.
            </p>
            <Link
              to="/admin/officers"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Return to Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
                    {officer.name ? officer.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{officer.name}</h1>
                      <OfficerStatusBadge status={officer.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">{officer.designation}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>{officer.officerCode}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{officer.department}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    to={`/admin/officers/${officer.id}/edit`}
                    className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                      officer.status === 'ACTIVE'
                        ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-4 h-4 mr-1.5" />
                    {officer.status === 'ACTIVE' ? 'Deactivate Officer' : 'Activate Officer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Account & Authentication</span>
                </h2>

                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">User ID</dt>
                    <dd className="font-mono text-slate-900">{officer.userId}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Official Email</dt>
                    <dd className="font-medium text-slate-900 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{officer.email}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Phone Number</dt>
                    <dd className="font-medium text-slate-900 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{officer.phoneNumber}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500">Enrolled On</dt>
                    <dd className="text-slate-900 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{officer.createdAt ? new Date(officer.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Departmental Profile */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Enforcement Jurisdiction</span>
                </h2>

                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Officer Code</dt>
                    <dd className="font-mono font-medium text-slate-900">{officer.officerCode}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Assigned District</dt>
                    <dd className="font-medium text-slate-900 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>{officer.district}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Designation</dt>
                    <dd className="text-slate-900">{officer.designation}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="text-slate-900">{officer.department}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
