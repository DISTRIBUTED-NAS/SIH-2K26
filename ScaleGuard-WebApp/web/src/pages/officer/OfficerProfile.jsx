import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { OfficerStatusBadge } from '../../components/OfficerStatusBadge';
import { officerService } from '../../services/officerService';
import {
  User,
  Shield,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  MapPin,
  Hash,
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';

export const OfficerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await officerService.getOfficerProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load officer profile', err);
      setError(err.response?.data?.message || 'Failed to load officer profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/dashboard/officer"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-sm font-medium">Loading officer credentials...</span>
          </div>
        ) : !profile ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-800">Officer Profile Not Found</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Your officer credentials could not be resolved. Please contact the system administrator.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-500/20">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : 'O'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profile.name}</h1>
                      <OfficerStatusBadge status={profile.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mt-0.5">{profile.designation}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-mono">
                      <span className="flex items-center space-x-1">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile.officerCode}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{profile.department}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Enforcement Officer ID</span>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Identity & Communication</span>
                </h2>

                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Full Name</dt>
                    <dd className="font-medium text-slate-900">{profile.name}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Official Email</dt>
                    <dd className="font-medium text-slate-900 flex items-center space-x-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.email}</span>
                    </dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500">Contact Number</dt>
                    <dd className="font-medium text-slate-900 flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.phoneNumber}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Jurisdiction Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Statutory Jurisdiction</span>
                </h2>

                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Officer Code</dt>
                    <dd className="font-mono font-semibold text-indigo-700">{profile.officerCode}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Designation</dt>
                    <dd className="text-slate-900">{profile.designation}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="text-slate-900">{profile.department}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500">Jurisdiction District</dt>
                    <dd className="font-semibold text-slate-900 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{profile.district}</span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Governance note */}
            <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-slate-800">Governance Notice: </span>
                Official jurisdiction records and contact details are managed by the State Legal Metrology Controller. If any details need updates, please submit an official request to platform administration.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
