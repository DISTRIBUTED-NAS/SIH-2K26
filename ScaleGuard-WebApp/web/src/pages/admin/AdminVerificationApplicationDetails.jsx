import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import {
  verificationApplicationService,
  getApplicationTypeLabel
} from '../../services/verificationApplicationService';
import {
  FileText,
  Building2,
  Scale,
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  Shield,
  Info,
  MapPin,
  User,
  Mail,
  UserCheck
} from 'lucide-react';
import { OfficerAssignmentModal } from '../../components/OfficerAssignmentModal';

export const AdminVerificationApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await verificationApplicationService.getApplicationByIdForAdmin(id);
      setApplication(data);
    } catch (err) {
      console.error('Failed to load admin application details', err);
      setError(err.response?.data?.message || 'Verification application not found.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading administrative dossier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Application</h2>
            <p className="text-sm text-slate-600 mb-6">{error || 'Application record not found'}</p>
            <Link
              to="/admin/verification-applications"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gov-600 hover:bg-gov-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Statewide Applications
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/verification-applications"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-gov-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Statewide Applications
          </Link>

          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-mono">
            {application.applicationNumber}
          </span>
        </div>

        {/* Header Inspection Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <ApplicationStatusBadge status={application.status} />
                  <ApplicationTypeBadge type={application.applicationType} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 font-mono">
                  {application.applicationNumber}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Lodged on {application.createdAt ? new Date(application.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Shield className="w-4 h-4 text-gov-600" />
              <span>Inspection View (Read-Only)</span>
            </div>
          </div>
        </div>

        {/* Officer Assignment Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Assigned Legal Metrology Officer
                </h2>
                {application.assignedOfficer ? (
                  <div className="mt-1 text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{application.assignedOfficer.name}</span>
                    <span className="font-mono text-xs text-slate-500 ml-2">({application.assignedOfficer.officerCode})</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span>{application.assignedOfficer.designation}</span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-indigo-600 font-medium">{application.assignedOfficer.district} District</span>
                    {application.assignedAt && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Assigned on {new Date(application.assignedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mt-1">
                    No officer has been assigned to this application yet.
                  </p>
                )}
              </div>
            </div>

            <div>
              {(application.status === 'SUBMITTED' || application.status === 'OFFICER_ASSIGNED') && (
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                    application.status === 'OFFICER_ASSIGNED'
                      ? 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                      : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  {application.status === 'OFFICER_ASSIGNED' ? 'Reassign Officer' : 'Assign Officer'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3 COLUMN SPECIFICATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: BUSINESS ENTITY DETAILS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-gov-600" />
                Applicant Business
              </h2>
              {application.businessId && (
                <Link
                  to={`/admin/businesses/${application.businessId}`}
                  className="text-xs text-gov-600 hover:text-gov-700 font-semibold"
                >
                  View Business →
                </Link>
              )}
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Business Name</span>
                <span className="font-bold text-slate-900">{application.businessName}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Location</span>
                <span className="text-slate-800 flex items-center mt-0.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  {application.businessCity}, {application.businessState}
                </span>
              </div>

              {application.businessGst && (
                <div>
                  <span className="text-xs text-slate-500 block">GSTIN</span>
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {application.businessGst}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div>
                  <span className="text-xs text-slate-500 block">Authorized Owner</span>
                  <span className="text-slate-800 text-xs flex items-center mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {application.ownerName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Contact Email</span>
                  <span className="text-slate-800 text-xs flex items-center mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {application.ownerEmail || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: INSTRUMENT SPECIFICATIONS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <Scale className="w-4 h-4 mr-2 text-gov-600" />
                Target Instrument
              </h2>
              {application.instrument?.id && (
                <Link
                  to={`/admin/instruments/${application.instrument.id}`}
                  className="text-xs text-gov-600 hover:text-gov-700 font-semibold"
                >
                  View Device →
                </Link>
              )}
            </div>

            {application.instrument ? (
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Device Name</span>
                  <span className="font-bold text-slate-900">
                    {application.instrument.instrumentName}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Serial Number</span>
                  <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                    {application.instrument.serialNumber}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Type</span>
                  <span className="text-slate-800 text-xs">
                    {application.instrument.instrumentType}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Manufacturer / Model</span>
                  <span className="text-slate-800 text-xs">
                    {application.instrument.manufacturer} • {application.instrument.modelNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-xs text-slate-500 block">Capacity</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {application.instrument.capacity} {application.instrument.capacityUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Accuracy</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {application.instrument.accuracy} {application.instrument.accuracyUnit}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No instrument metadata found.</p>
            )}
          </div>

          {/* COLUMN 3: REQUEST PURPOSE & AUDIT */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center">
              <Info className="w-4 h-4 mr-2 text-gov-600" />
              Request Dossier
            </h2>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Stated Purpose
              </span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed font-normal">
                {application.purpose}
              </p>
            </div>

            {application.remarks && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                  Applicant Remarks
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {application.remarks}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Date:</span>
                <span className="font-semibold text-slate-900">{application.requestedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Date:</span>
                <span className="font-semibold text-indigo-900">{application.preferredInspectionDate || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application ID:</span>
                <span className="font-mono text-slate-700">#{application.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Assignment Modal */}
        <OfficerAssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          application={application}
          onSuccess={fetchApplicationDetails}
        />
      </main>
    </div>
  );
};
