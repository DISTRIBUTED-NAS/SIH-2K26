import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { MeasurementTestStatusBadge } from '../../components/MeasurementTestStatusBadge';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { MeasurementRecordsTable } from '../../components/MeasurementRecordsTable';
import { AddMeasurementRecordModal } from '../../components/AddMeasurementRecordModal';
import { EditMeasurementRecordModal } from '../../components/EditMeasurementRecordModal';
import { OverallRemarksEditor } from '../../components/OverallRemarksEditor';
import { measurementTestService } from '../../services/measurementTestService';
import { inspectionService } from '../../services/inspectionService';
import {
  Scale,
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Clock,
  Building,
  Hash,
  Activity,
  Layers,
  Info
} from 'lucide-react';

export const MeasurementTesting = () => {
  const { inspectionId } = useParams();

  const [inspection, setInspection] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [inspectionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSessionNotFound(false);

      // Fetch parent inspection details
      const inspData = await inspectionService.getInspectionById(inspectionId);
      setInspection(inspData);

      // Fetch measurement test session if exists
      try {
        const sessData = await measurementTestService.getMeasurementTestByInspectionId(inspectionId);
        setSession(sessData);
      } catch (sessErr) {
        if (sessErr.response && sessErr.response.status === 404) {
          setSession(null);
          setSessionNotFound(true);
        } else {
          throw sessErr;
        }
      }
    } catch (err) {
      console.error('Failed to load measurement testing data', err);
      setError(err.response?.data?.message || err.message || 'Failed to load measurement test data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTesting = async () => {
    try {
      setStartingSession(true);
      setError(null);
      const newSession = await measurementTestService.startMeasurementTest(inspectionId);
      setSession(newSession);
      setSessionNotFound(false);
      setSuccessMessage('Measurement testing session started successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start measurement testing session');
    } finally {
      setStartingSession(false);
    }
  };

  const handleAddRecord = async (recordData) => {
    if (!session) return;
    const added = await measurementTestService.addTestRecord(session.id, recordData);
    // Refresh session data
    const updated = await measurementTestService.getMeasurementTestByInspectionId(inspectionId);
    setSession(updated);
    setSuccessMessage(`Test reading #${added.testPoint} recorded successfully.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleUpdateRecord = async (recordId, recordData) => {
    const updatedRecord = await measurementTestService.updateTestRecord(recordId, recordData);
    // Refresh session data
    const updated = await measurementTestService.getMeasurementTestByInspectionId(inspectionId);
    setSession(updated);
    setSuccessMessage(`Test reading #${updatedRecord.testPoint} updated successfully.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteRecord = async (recordId) => {
    await measurementTestService.deleteTestRecord(recordId);
    // Refresh session data
    const updated = await measurementTestService.getMeasurementTestByInspectionId(inspectionId);
    setSession(updated);
    setSuccessMessage('Test reading deleted successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleSaveRemarks = async (overallRemarks) => {
    if (!session) return;
    const updated = await measurementTestService.updateOverallRemarks(session.id, overallRemarks);
    setSession(updated);
  };

  const handleCompleteTesting = async () => {
    if (!session) return;
    try {
      setActionLoading(true);
      setError(null);
      const completed = await measurementTestService.completeMeasurementTest(session.id);
      setSession(completed);
      setIsCompleteConfirmOpen(false);
      setSuccessMessage('Measurement testing completed successfully. Test records are now locked for verification.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to complete measurement testing');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading measurement testing module...</p>
        </div>
      </div>
    );
  }

  const isEditable = session && session.status === 'IN_PROGRESS';
  const defaultUnit = inspection?.instrumentUnit || inspection?.application?.instrument?.capacityUnit || 'kg';

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to={`/officer/inspections/${inspectionId}`}
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Inspection
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-700">Measurement Testing</span>
          </div>

          {session && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Session Status:</span>
              <MeasurementTestStatusBadge status={session.status} />
            </div>
          )}
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-start space-x-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Success</h4>
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {/* Inspection Context Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-gov-600 uppercase mb-1">
                <Scale className="w-4 h-4" />
                <span>Component 7 • Active Inspection Testing</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                MEASUREMENT TESTING
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Physical error calculation and tolerance verification on certified weights
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Inspection Number</span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {inspection?.inspectionNumber || `INSP-#${inspectionId}`}
                </span>
              </div>
              {inspection?.status && <InspectionStatusBadge status={inspection.status} />}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Business
              </span>
              <span className="font-medium text-slate-900 block truncate">
                {inspection?.businessName || inspection?.application?.business?.businessName || '—'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Instrument
              </span>
              <span className="font-medium text-slate-900 block truncate">
                {inspection?.instrumentName || inspection?.application?.instrument?.name || '—'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Type
              </span>
              <span className="font-medium text-slate-900 block">
                {inspection?.instrumentType || inspection?.application?.instrument?.type || '—'}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Capacity
              </span>
              <span className="font-mono font-medium text-slate-900 block">
                {inspection?.application?.instrument?.capacity
                  ? `${inspection.application.instrument.capacity} ${inspection.application.instrument.capacityUnit || ''}`
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* State 1: No Test Session Yet */}
        {sessionNotFound && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 bg-gov-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gov-600 border border-gov-100">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Measurement Testing Not Started
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              This inspection is currently in progress. As the assigned LMO Officer, you can initiate a measurement testing session to record calibration test readings, evaluate tolerance limits, and calculate error margins.
            </p>

            {inspection?.status === 'IN_PROGRESS' ? (
              <button
                onClick={handleStartTesting}
                disabled={startingSession}
                className="inline-flex items-center px-6 py-3 bg-gov-600 hover:bg-gov-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition transform active:scale-95 disabled:opacity-50"
              >
                {startingSession ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Starting Test Session...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    <span>START MEASUREMENT TESTING</span>
                  </>
                )}
              </button>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs inline-flex items-center space-x-2">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Inspection must be <strong>IN_PROGRESS</strong> to start measurement testing. (Current status: {inspection?.status})
                </span>
              </div>
            )}
          </div>
        )}

        {/* State 2: Session Active or Completed */}
        {session && (
          <div className="space-y-8">
            {/* KPI / Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Points</span>
                  <Layers className="w-4 h-4 text-gov-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {session.totalRecords || 0}
                </div>
                <span className="text-xs text-slate-500">Measurement readings taken</span>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Abs Error</span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {session.maximumAbsoluteError != null ? `${session.maximumAbsoluteError}` : '—'}
                </div>
                <span className="text-xs text-slate-500">Peak absolute deviation</span>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg % Error</span>
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {session.averagePercentageError != null ? `${session.averagePercentageError}%` : '—'}
                </div>
                <span className="text-xs text-slate-500">Mean percentage deviation</span>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Session Mode</span>
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <div className="mt-1">
                  <MeasurementTestStatusBadge status={session.status} />
                </div>
                <span className="text-xs text-slate-500 block mt-1">
                  {session.status === 'COMPLETED' ? 'Immutable read-only' : 'Active editing enabled'}
                </span>
              </div>
            </div>

            {/* Read-Only Notice if completed */}
            {session.status === 'COMPLETED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Measurement Testing Completed</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Testing records are locked for audit integrity. The parent inspection remains{' '}
                    <strong>IN_PROGRESS</strong> for upcoming photo documentation and AI analysis.
                  </p>
                </div>
              </div>
            )}

            {/* Test Records Section */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Calibration & Verification Readings</h2>
                  <p className="text-xs text-slate-500">
                    Readings are verified against standard weights. Errors are computed by the server using high-precision arithmetic.
                  </p>
                </div>

                {isEditable && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="inline-flex items-center px-4 py-2 bg-gov-600 hover:bg-gov-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>ADD TEST READING</span>
                    </button>

                    <button
                      onClick={() => setIsCompleteConfirmOpen(true)}
                      disabled={!session.records || session.records.length === 0}
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      <span>COMPLETE TESTING</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <MeasurementRecordsTable
                records={session.records || []}
                isEditable={isEditable}
                onEdit={(r) => setRecordToEdit(r)}
                onDelete={handleDeleteRecord}
              />
            </div>

            {/* Overall Remarks Section */}
            <OverallRemarksEditor
              initialRemarks={session.overallRemarks}
              isEditable={isEditable}
              onSave={handleSaveRemarks}
            />
          </div>
        )}
      </main>

      {/* Add Record Modal */}
      <AddMeasurementRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddRecord}
        defaultUnit={defaultUnit}
      />

      {/* Edit Record Modal */}
      <EditMeasurementRecordModal
        isOpen={Boolean(recordToEdit)}
        record={recordToEdit}
        onClose={() => setRecordToEdit(null)}
        onUpdate={handleUpdateRecord}
      />

      {/* Complete Testing Confirmation Modal */}
      {isCompleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Complete Measurement Testing?</h3>
                <p className="text-xs text-slate-500">Lock readings and finalize calculations</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to complete measurement testing? Once completed, test readings and remarks become <strong>read-only</strong> and cannot be edited or deleted.
            </p>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 mb-6 flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> The parent inspection will remain <em>IN_PROGRESS</em> to allow subsequent photographic verification and AI analysis before final sign-off.
              </span>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCompleteConfirmOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteTesting}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing...</span>
                  </>
                ) : (
                  <span>Yes, Complete Testing</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementTesting;
