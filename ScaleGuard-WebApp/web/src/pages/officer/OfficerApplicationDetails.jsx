import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { CreateInspectionModal } from '../../components/CreateInspectionModal';
import { officerService } from '../../services/officerService';
import {
  FileText,
  Building,
  Scale,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Shield,
  Info,
  MapPin,
  User,
  Mail,
  Phone,
  Clock,
  Loader2,
  CheckCircle2,
  ClipboardCheck,
  Eye
} from 'lucide-react';

export const OfficerApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await officerService.getAssignedApplicationDetails(id);
      setApplication(data);
    } catch (err) {
      console.error('Failed to load assigned application details', err);
      setError(err.response?.data?.message || 'Application not found or not assigned to your jurisdiction.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-sm font-medium">Loading verification docket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied or Not Found</h2>
            <p className="text-sm text-slate-600 mb-6">
              {error || 'This verification application does not exist or is not assigned to your officer account.'}
            </p>
            <Link
              to="/officer/applications"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Assigned Applications
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/officer/applications"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Assigned Applications
          </Link>

          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-mono font-medium">
            Assigned Application Docket
          </span>
        </div>

        {/* Header Inspection Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
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
                  Assigned to you on {application.assignedAt ? new Date(application.assignedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-indigo-700 bg-indigo-50 px-3.5 py-2 rounded-xl border border-indigo-200 font-medium">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Officer Inspection Jurisdiction</span>
            </div>
          </div>
        </div>

        {/* 3-COLUMN SPECIFICATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* COLUMN 1: APPLICANT BUSINESS ENTITY */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 mb-4 border-b border-slate-100 flex items-center">
              <Building className="w-4 h-4 mr-2 text-indigo-600" />
              Applicant Establishment
            </h2>

            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-500 block">Business Trade Name</span>
                <span className="font-bold text-slate-900">{application.businessName}</span>
                <span className="text-xs text-slate-500 block mt-0.5">{application.businessType}</span>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Facility Address</span>
                <p className="text-slate-800 text-xs mt-0.5 leading-relaxed">
                  {application.addressLine1}
                  {application.addressLine2 && `, ${application.addressLine2}`}
                  <br />
                  {application.city}, {application.state} — {application.pincode}
                </p>
              </div>

              {application.gstNumber && (
                <div>
                  <span className="text-xs text-slate-500 block">GSTIN</span>
                  <span className="font-mono text-xs font-semibold text-slate-800">{application.gstNumber}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  Designated Contact
                </span>
                {application.contactPerson && (
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{application.contactPerson}</span>
                  </div>
                )}
                {application.contactPhone && (
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{application.contactPhone}</span>
                  </div>
                )}
                {application.contactEmail && (
                  <div className="flex items-center space-x-2 text-xs text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{application.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: INSTRUMENT SPECIFICATIONS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 mb-4 border-b border-slate-100 flex items-center">
              <Scale className="w-4 h-4 mr-2 text-indigo-600" />
              Instrument Details
            </h2>

            {application.instrument ? (
              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Instrument Name</span>
                  <span className="font-bold text-slate-900">{application.instrument.instrumentName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-500 block">Serial Number</span>
                    <span className="font-mono text-xs font-semibold text-slate-800">
                      {application.instrument.serialNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Model</span>
                    <span className="font-mono text-xs text-slate-800">
                      {application.instrument.modelNumber || 'N/A'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Manufacturer</span>
                  <span className="text-slate-800 text-xs">{application.instrument.manufacturer || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Type Classification</span>
                  <span className="text-xs font-medium text-slate-700">
                    {application.instrument.instrumentType?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
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

          {/* COLUMN 3: VERIFICATION REQUEST PURPOSE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Info className="w-4 h-4 mr-2 text-indigo-600" />
              Inspection Request
            </h2>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Stated Purpose
              </span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                {application.purpose}
              </p>
            </div>

            {application.remarks && (
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                  Applicant Notes / Remarks
                </span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {application.remarks}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Date:</span>
                <span className="font-semibold text-slate-900">{application.requestedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Preferred Date:</span>
                <span className="font-semibold text-indigo-900">{application.preferredInspectionDate || 'Flexible'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application ID:</span>
                <span className="font-mono text-slate-700">#{application.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {scheduleSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{scheduleSuccess}</span>
          </div>
        )}

        {/* Inspection Lifecycle Action Section */}
        {application.status === 'OFFICER_ASSIGNED' && !application.inspectionId && (
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-2xl p-6 sm:p-8 border border-blue-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready for Field Inspection Scheduling
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                  This verification docket is assigned to you. Schedule an on-site visit to examine the
                  instrument, run standards calibration, and record physical observations.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCreateInspectionOpen(true)}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-all flex-shrink-0"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Inspection
            </button>
          </div>
        )}

        {(application.inspectionId || application.status === 'INSPECTION_IN_PROGRESS' || application.status === 'INSPECTION_COMPLETED') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    {application.inspectionNumber || 'Inspection Active'}
                  </h3>
                  {application.inspectionStatus && (
                    <InspectionStatusBadge status={application.inspectionStatus} />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Field verification docket linked to this statutory application.
                </p>
              </div>
            </div>

            {application.inspectionId && (
              <Link
                to={`/officer/inspections/${application.inspectionId}`}
                className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Go to Inspection Docket
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      <CreateInspectionModal
        isOpen={isCreateInspectionOpen}
        onClose={() => setIsCreateInspectionOpen(false)}
        application={{
          id: application.id,
          applicationNumber: application.applicationNumber,
          business: {
            legalName: application.businessName,
            premisesAddress: application.addressLine1,
            district: application.city,
          },
          instrument: application.instrument,
        }}
        onSuccess={(insp) => {
          setScheduleSuccess(`Inspection scheduled successfully: ${insp.inspectionNumber}`);
          fetchApplicationDetails();
        }}
      />
    </div>
  );
};
