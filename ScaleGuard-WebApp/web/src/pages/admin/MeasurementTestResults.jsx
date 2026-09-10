import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { MeasurementTestStatusBadge } from '../../components/MeasurementTestStatusBadge';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { MeasurementRecordsTable } from '../../components/MeasurementRecordsTable';
import { OverallRemarksEditor } from '../../components/OverallRemarksEditor';
import { measurementTestService } from '../../services/measurementTestService';
import { inspectionService } from '../../services/inspectionService';
import {
  Scale,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  Layers,
  Activity,
  Shield,
  FileText
} from 'lucide-react';

export const MeasurementTestResults = () => {
  const { inspectionId } = useParams();

  const [inspection, setInspection] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [inspectionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSessionNotFound(false);

      // Fetch parent inspection details for admin
      const inspData = await inspectionService.getInspectionByIdForAdmin(inspectionId);
      setInspection(inspData);

      // Fetch measurement test session for admin
      try {
        const sessData = await measurementTestService.getMeasurementTestForAdmin(inspectionId);
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
      console.error('Failed to load admin measurement test results', err);
      setError(err.response?.data?.message || err.message || 'Failed to load measurement test data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Loading measurement test results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              to={`/admin/inspections/${inspectionId}`}
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Inspection
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-slate-700">Measurement Test Audit</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Shield className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Admin View (Read-Only)
            </span>
            {session && <MeasurementTestStatusBadge status={session.status} />}
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold">Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Inspection Header */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold tracking-wider text-gov-600 uppercase mb-1">
                <Scale className="w-4 h-4" />
                <span>Component 7 • Inspection Measurement Audit</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                MEASUREMENT TEST RESULTS
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Physical verification readings and error tolerance logs for regulatory oversight
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
                Assigned Officer
              </span>
              <span className="font-medium text-slate-900 block truncate">
                {inspection?.officerName || inspection?.officer?.user?.fullName || '—'}
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
                Instrument Type
              </span>
              <span className="font-medium text-slate-900 block">
                {inspection?.instrumentType || inspection?.application?.instrument?.type || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* State 1: No Session Started Yet */}
        {sessionNotFound && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Scale className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">No Measurement Session Yet</h2>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              The assigned Legal Metrology Officer has not yet started the measurement test session for this inspection.
            </p>
            <Link
              to={`/admin/inspections/${inspectionId}`}
              className="inline-flex items-center text-sm font-medium text-gov-600 hover:text-gov-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Return to inspection details
            </Link>
          </div>
        )}

        {/* State 2: Session Results Display */}
        {session && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Readings</span>
                  <Layers className="w-4 h-4 text-gov-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {session.totalRecords || 0}
                </div>
                <span className="text-xs text-slate-500">Recorded test points</span>
              </div>

              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Max Abs Error</span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  {session.maximumAbsoluteError != null ? `${session.maximumAbsoluteError}` : '—'}
                </div>
                <span className="text-xs text-slate-500">Peak absolute discrepancy</span>
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
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Session Status</span>
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <div className="mt-1">
                  <MeasurementTestStatusBadge status={session.status} />
                </div>
                <span className="text-xs text-slate-500 block mt-1">
                  {session.completedAt ? `Completed: ${new Date(session.completedAt).toLocaleDateString()}` : 'Testing ongoing'}
                </span>
              </div>
            </div>

            {/* Records Table (Always Read-Only for Admin) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recorded Measurement Points</h2>
                  <p className="text-xs text-slate-500">
                    Official measurement logs submitted by the assigned officer
                  </p>
                </div>
              </div>

              <MeasurementRecordsTable
                records={session.records || []}
                isEditable={false}
              />
            </div>

            {/* Overall Remarks (Read-Only) */}
            <OverallRemarksEditor
              initialRemarks={session.overallRemarks}
              isEditable={false}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default MeasurementTestResults;
