import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
import { CancelInspectionModal } from '../../components/CancelInspectionModal';
import { InspectionNotesEditor } from '../../components/InspectionNotesEditor';
import { inspectionService } from '../../services/inspectionService';
import {
  ClipboardCheck,
  Building,
  Scale,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Edit3,
  CheckCircle2,
  PlayCircle,
  Ban,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Shield,
  Phone,
  Mail,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export const InspectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isNotesEditorOpen, setIsNotesEditorOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);

  useEffect(() => {
    fetchInspectionDetails();
  }, [id]);

  const fetchInspectionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await inspectionService.getInspectionById(id);
      setInspection(data);
    } catch (err) {
      console.error('Failed to load inspection details', err);
      setError(err.response?.data?.message || 'Failed to load inspection details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async () => {
    try {
      setActionLoading(true);
      setError('');
      const updated = await inspectionService.startInspection(id);
      setInspection(updated);
      setActionSuccess('Inspection successfully started! Status is now IN_PROGRESS.');
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start inspection.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteInspection = async () => {
    try {
      setActionLoading(true);
      setError('');
      const updated = await inspectionService.completeInspection(id);
      setInspection(updated);
      setIsCompleteConfirmOpen(false);
      setActionSuccess('Inspection marked as COMPLETED! Statutory records updated.');
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete inspection.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading inspection docket #{id}...</p>
        </main>
      </div>
    );
  }

  if (error && !inspection) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900">Unable to load inspection</h2>
            <p className="text-sm text-slate-600 mt-2">{error}</p>
            <Link
              to="/officer/inspections"
              className="mt-6 inline-flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to My Inspections
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isScheduled = inspection?.status === 'SCHEDULED';
  const isInProgress = inspection?.status === 'IN_PROGRESS';
  const isCompleted = inspection?.status === 'COMPLETED';
  const isCancelled = inspection?.status === 'CANCELLED';

  const business = {
    legalName: inspection?.businessName || inspection?.business?.legalName || 'N/A',
    tradeName: inspection?.businessType || inspection?.business?.tradeName,
    premisesAddress: inspection?.location || inspection?.addressLine1 || inspection?.business?.premisesAddress,
    district: inspection?.city || inspection?.business?.district || 'N/A',
    state: inspection?.state || inspection?.business?.state || 'N/A',
    pincode: inspection?.pincode || inspection?.business?.pincode || '',
    registrationNumber: inspection?.registrationNumber || inspection?.business?.registrationNumber || 'N/A',
    gstNumber: inspection?.gstNumber || inspection?.business?.gstNumber || 'N/A',
  };

  const instrument = {
    name: inspection?.instrumentName || inspection?.instrument?.name || 'N/A',
    category: inspection?.instrumentType || inspection?.instrument?.category || 'Standard',
    serialNumber: inspection?.serialNumber || inspection?.instrument?.serialNumber || 'N/A',
    brand: inspection?.manufacturer || inspection?.instrument?.brand || 'N/A',
    modelNumber: inspection?.modelNumber || inspection?.instrument?.modelNumber || 'N/A',
    capacity: inspection?.capacity || inspection?.instrument?.capacity || 0,
    capacityUnit: inspection?.capacityUnit || inspection?.instrument?.capacityUnit || '',
    accuracy: inspection?.accuracy || inspection?.instrument?.accuracy || 0,
    accuracyUnit: inspection?.accuracyUnit || inspection?.instrument?.accuracyUnit || '',
  };

  const appData = {
    id: inspection?.applicationId || inspection?.application?.id,
    applicationNumber: inspection?.applicationNumber || inspection?.application?.applicationNumber || 'N/A',
    status: inspection?.applicationStatus || inspection?.application?.status || 'SUBMITTED',
    applicationType: inspection?.applicationType || inspection?.application?.applicationType || 'VERIFICATION',
    purpose: inspection?.purpose || inspection?.application?.purpose || 'N/A',
    requestedDate: inspection?.requestedDate || inspection?.application?.requestedDate,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/officer/inspections"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to My Inspections
          </Link>

          <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 font-mono font-medium">
            Inspection Docket #{inspection.id}
          </span>
        </div>

        {/* Global Notifications */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-800 text-sm shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-rose-800 text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Inspection Header Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <InspectionStatusBadge status={inspection.status} />
                  <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
                    Docket ID: #{inspection.id}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                  {inspection.inspectionNumber}
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Scheduled For:{' '}
                  <span className="font-semibold text-slate-700 ml-1">
                    {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleString() : 'N/A'}
                  </span>
                </p>
              </div>
            </div>

            {/* Officer Action Buttons depending on Lifecycle */}
            <div className="flex flex-wrap items-center gap-3">
              {isScheduled && (
                <>
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-4 h-4 mr-1.5" />
                    Cancel Inspection
                  </button>
                  <button
                    onClick={handleStartInspection}
                    disabled={actionLoading}
                    className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <PlayCircle className="w-4 h-4 mr-2" />
                    )}
                    Start Inspection
                  </button>
                </>
              )}

              {isInProgress && (
                <>
                  <Link
                    to={`/officer/inspections/${inspection.id}/measurement-tests`}
                    className="inline-flex items-center px-4 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-gov-600/20 transition-all"
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Measurement Testing
                  </Link>
                  <button
                    onClick={() => setIsNotesEditorOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Edit3 className="w-4 h-4 mr-1.5 text-slate-500" />
                    Update Notes
                  </button>
                  <button
                    onClick={() => setIsCompleteConfirmOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Inspection
                  </button>
                </>
              )}

              {isCompleted && (
                <div className="flex items-center space-x-3">
                  <Link
                    to={`/officer/inspections/${inspection.id}/measurement-tests`}
                    className="inline-flex items-center px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl border border-slate-300 transition-all"
                  >
                    <Scale className="w-3.5 h-3.5 mr-1.5 text-gov-600" />
                    View Measurement Test Results
                  </Link>
                  <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Verified & Completed on{' '}
                      {inspection.completedAt ? new Date(inspection.completedAt).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="flex items-center space-x-2 text-xs text-rose-800 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 font-medium">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Cancelled on {inspection.cancelledAt ? new Date(inspection.cancelledAt).toLocaleString() : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Banner if cancelled */}
          {isCancelled && inspection.cancellationReason && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
                Official Cancellation Reason:
              </span>
              <p className="text-xs text-rose-800 italic">{inspection.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* 3-COLUMN SPECIFICATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* COLUMN 1: BUSINESS ENTITY DETAILS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Building className="w-4 h-4 mr-2 text-blue-600" />
              Premises & Business
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {business.legalName}
                </h3>
                {business.tradeName && (
                  <p className="text-xs text-slate-500">{business.tradeName}</p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-slate-500 block">Inspection Site Address:</span>
                    <span className="font-semibold text-slate-800 block">
                      {business.premisesAddress}
                    </span>
                    <span className="text-slate-600">
                      {business.district}, {business.state} {business.pincode ? `- ${business.pincode}` : ''}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">Business Type:</span>
                  <span className="font-medium text-slate-800">{business.tradeName || 'Commercial'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration #:</span>
                  <span className="font-mono text-slate-800">{business.registrationNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: INSTRUMENT SPECIFICATIONS */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Scale className="w-4 h-4 mr-2 text-blue-600" />
              Subject Instrument
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{instrument.name}</h3>
                <p className="text-xs text-slate-500">
                  Category: <span className="font-medium text-slate-700">{instrument.category}</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {instrument.serialNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Brand / Make:</span>
                  <span className="font-medium text-slate-800">{instrument.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Number:</span>
                  <span className="font-medium text-slate-800">{instrument.modelNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-semibold text-slate-800">
                    {instrument.capacity} {instrument.capacityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy Class:</span>
                  <span className="font-semibold text-slate-800">
                    {instrument.accuracy} {instrument.accuracyUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: APPLICATION DOCKET & AUDIT TIMELINE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Statutory Docket Details
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Application Number</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {appData.applicationNumber}
                  </span>
                </div>
                <ApplicationStatusBadge status={appData.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Type:</span>
                  <span className="font-semibold text-slate-800">{appData.applicationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Stated Purpose:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[170px]">
                    {appData.purpose}
                  </span>
                </div>
                {appData.id && (
                  <div className="pt-2 border-t border-slate-200">
                    <Link
                      to={`/officer/applications/${appData.id}`}
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Application Docket
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Lifecycle Timestamps */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Scheduled:</span>
                <span className="font-medium text-slate-700">
                  {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Started:</span>
                <span className="font-medium text-slate-700">
                  {inspection.startedAt ? new Date(inspection.startedAt).toLocaleString() : 'Not started'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-medium text-slate-700">
                  {inspection.completedAt ? new Date(inspection.completedAt).toLocaleString() : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT 7: MEASUREMENT TESTING ACTIVITY CARD */}
        {(isInProgress || isCompleted) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gov-50 rounded-xl text-gov-600 border border-gov-100 mt-1">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gov-600 uppercase tracking-wider">
                      Inspection Activity • Component 7
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Measurement Testing & Calibration Check
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                    Record certified weight readings, observed test values, and calculate tolerance errors across multiple measurement test points.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/officer/inspections/${inspection.id}/measurement-tests`}
                  className="inline-flex items-center px-5 py-2.5 bg-gov-600 hover:bg-gov-700 text-white font-medium text-sm rounded-xl shadow-sm transition whitespace-nowrap"
                >
                  <Scale className="w-4 h-4 mr-2" />
                  {isCompleted ? 'View Test Records' : 'Open Measurement Testing'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FIELD NOTES & OBSERVATIONS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Inspection Findings & Physical Observations
              </h2>
            </div>
            {isInProgress && (
              <button
                onClick={() => setIsNotesEditorOpen(true)}
                className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit Notes
              </button>
            )}
          </div>

          {inspection.notes ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {inspection.notes}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-400">
                No observation notes recorded yet.
                {isInProgress && ' Click "Edit Notes" to record field findings.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Modal for Complete Inspection */}
      {isCompleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Complete Inspection?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to mark inspection <strong>{inspection.inspectionNumber}</strong> as{' '}
              <strong>COMPLETED</strong>? The associated application will transition to{' '}
              <strong>INSPECTION_COMPLETED</strong>.
            </p>
            <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCompleteConfirmOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteInspection}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CancelInspectionModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        inspection={inspection}
        onSuccess={(updated) => {
          setInspection(updated);
          setActionSuccess('Inspection has been cancelled.');
        }}
      />

      <InspectionNotesEditor
        isOpen={isNotesEditorOpen}
        onClose={() => setIsNotesEditorOpen(false)}
        inspection={inspection}
        onSuccess={(updated) => {
          setInspection(updated);
          setActionSuccess('Inspection notes saved.');
        }}
      />
    </div>
  );
};
