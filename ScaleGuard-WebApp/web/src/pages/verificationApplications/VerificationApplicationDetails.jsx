import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { ApplicationTypeBadge } from '../../components/ApplicationTypeBadge';
import {
  verificationApplicationService,
  getApplicationTypeLabel
} from '../../services/verificationApplicationService';
import {
  FileText,
  Scale,
  Calendar,
  Clock,
  ArrowLeft,
  Edit2,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  Building2,
  Info,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export const VerificationApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Modal actions
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAction, setDeletingAction] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await verificationApplicationService.getMyApplicationById(id);
      setApplication(data);
    } catch (err) {
      console.error('Failed to load application details', err);
      setError(err.response?.data?.message || 'Verification application not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmittingAction(true);
      const updated = await verificationApplicationService.submitApplication(id);
      setApplication(updated);
      setShowSubmitModal(false);
      setSuccessMessage('Verification application submitted successfully.');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setDeletingAction(true);
      await verificationApplicationService.deleteDraftApplication(id);
      setShowDeleteModal(false);
      navigate('/verification-applications', {
        state: { message: `Draft application ${application?.applicationNumber} was deleted successfully.` }
      });
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete application.');
    } finally {
      setDeletingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-500">
            <div className="w-10 h-10 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Loading application details...</p>
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
            <p className="text-sm text-slate-600 mb-6">{error || 'Application not found'}</p>
            <Link
              to="/verification-applications"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gov-600 hover:bg-gov-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Applications List
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isDraft = application.status === 'DRAFT';
  const isSubmitted = application.status === 'SUBMITTED';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation & Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/verification-applications"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-gov-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Applications List
          </Link>

          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200 font-mono">
            {application.applicationNumber}
          </span>
        </div>

        {/* Success Alert */}
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

        {/* Error Alert */}
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

        {/* SUBMITTED BANNER CALLOUT */}
        {isSubmitted && (
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-start space-x-4 shadow-sm">
            <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-950">
                Application Officially Submitted
              </h3>
              <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
                Application submitted successfully and awaiting further processing by the Legal Metrology Officer.
                This application is locked in accordance with statutory audit regulations.
              </p>
            </div>
          </div>
        )}

        {/* MAIN HEADER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-gov-50 text-gov-600 rounded-xl border border-gov-100">
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
                  Created on {application.createdAt ? new Date(application.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {isDraft && (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/verification-applications/${application.id}/edit`}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-1.5 text-slate-500" />
                  Edit Draft
                </Link>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                  title="Delete Draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Submit Application
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: APPLICATION DETAILS & PURPOSE */}
          <div className="lg:col-span-2 space-y-6">
            {/* PURPOSE & REMARKS CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
                <Info className="w-4 h-4 mr-2 text-gov-600" />
                Verification Request Purpose
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                    Purpose Description
                  </span>
                  <p className="text-slate-900 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed font-normal">
                    {application.purpose}
                  </p>
                </div>

                {application.remarks && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                      Applicant Remarks & Site Instructions
                    </span>
                    <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-200 leading-relaxed text-xs">
                      {application.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* DATES & TIMELINE CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gov-600" />
                Key Verification Dates
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 block">
                    Requested Date
                  </span>
                  <span className="text-base font-bold text-slate-900 mt-1 block">
                    {application.requestedDate || 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400">Formal lodgement date</span>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <span className="text-xs font-medium text-indigo-700 block">
                    Preferred Inspection Date
                  </span>
                  <span className="text-base font-bold text-indigo-950 mt-1 block">
                    {application.preferredInspectionDate || 'Not specified'}
                  </span>
                  <span className="text-xs text-indigo-500">Target officer visit date</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COLUMN: ASSOCIATED INSTRUMENT & METADATA */}
          <div className="space-y-6">
            {/* INSTRUMENT SPEC SHEET CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
                  <Scale className="w-4 h-4 mr-2 text-gov-600" />
                  Target Instrument
                </h2>
                {application.instrument?.id && (
                  <Link
                    to={`/instruments/${application.instrument.id}`}
                    className="text-xs text-gov-600 hover:text-gov-700 font-semibold"
                  >
                    View Device →
                  </Link>
                )}
              </div>

              {application.instrument ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Instrument Name</span>
                    <span className="font-semibold text-slate-900">
                      {application.instrument.instrumentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Serial Number</span>
                    <span className="font-mono font-medium text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                      {application.instrument.serialNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block">Instrument Type</span>
                    <span className="text-slate-800">
                      {application.instrument.instrumentType}
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
                <p className="text-xs text-slate-400">No instrument metadata attached.</p>
              )}
            </div>

            {/* AUDIT METADATA CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-xs text-slate-600 space-y-2.5">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Audit Record
              </h2>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Application ID:</span>
                <span className="font-mono font-semibold text-slate-900">#{application.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Business ID:</span>
                <span className="font-mono text-slate-700">#{application.businessId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Created:</span>
                <span className="text-slate-700">
                  {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Updated:</span>
                <span className="text-slate-700">
                  {application.updatedAt ? new Date(application.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              Submit Verification Application?
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Once submitted, this application cannot be edited or deleted. It will be formally scheduled for verification review.
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={submittingAction}
                onClick={() => setShowSubmitModal(false)}
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

      {/* CONFIRM DELETE MODAL */}
      {showDeleteModal && (
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
              <strong className="font-mono text-slate-900">{application.applicationNumber}</strong>?
            </p>

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={deletingAction}
                onClick={() => setShowDeleteModal(false)}
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
