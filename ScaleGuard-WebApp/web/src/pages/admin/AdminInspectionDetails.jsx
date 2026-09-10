import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InspectionStatusBadge } from '../../components/InspectionStatusBadge';
import { ApplicationStatusBadge } from '../../components/ApplicationStatusBadge';
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
  ArrowLeft,
  AlertCircle,
  Loader2,
  Shield,
  Phone,
  Mail,
  User,
  ExternalLink,
  Ban,
  CheckCircle2
} from 'lucide-react';

export const AdminInspectionDetails = () => {
  const { id } = useParams();

  const [inspection, setInspection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInspectionDetails();
  }, [id]);

  const fetchInspectionDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await inspectionService.getInspectionByIdForAdmin(id);
      setInspection(data);
    } catch (err) {
      console.error('Failed to load inspection details for admin', err);
      setError(err.response?.data?.message || 'Failed to load inspection details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-600">Loading inspection audit record #{id}...</p>
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
              to="/admin/inspections"
              className="mt-6 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Inspection Monitoring
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isCompleted = inspection?.status === 'COMPLETED';
  const isCancelled = inspection?.status === 'CANCELLED';

  const officer = {
    fullName: inspection?.officerName || inspection?.officer?.fullName || 'N/A',
    badgeNumber: inspection?.officerCode || inspection?.officer?.badgeNumber || 'N/A',
    email: inspection?.officerEmail || inspection?.officer?.email || 'N/A',
    phoneNumber: inspection?.officerPhone || inspection?.officer?.phoneNumber || 'N/A',
    jurisdictionDistrict: inspection?.officerDistrict || inspection?.officer?.jurisdictionDistrict || 'N/A',
  };

  const business = {
    legalName: inspection?.businessName || inspection?.business?.legalName || 'N/A',
    tradeName: inspection?.businessType || inspection?.business?.tradeName || 'Commercial',
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
            to="/admin/inspections"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Inspection Monitoring
          </Link>

          <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-200 font-mono font-medium">
            Administrative Audit View
          </span>
        </div>

        {/* Header Inspection Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <ClipboardCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <InspectionStatusBadge status={inspection.status} />
                  <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md font-mono">
                    ID: #{inspection.id}
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

            <div className="flex items-center space-x-3">
              <Link
                to={`/admin/inspections/${inspection.id}/measurement-tests`}
                className="inline-flex items-center px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-300 shadow-sm transition"
              >
                <Scale className="w-4 h-4 mr-1.5 text-indigo-600" />
                Measurement Test Results
              </Link>

              {isCompleted && (
                <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Completed on{' '}
                    {inspection.completedAt ? new Date(inspection.completedAt).toLocaleString() : ''}
                  </span>
                </div>
              )}

              {isCancelled && (
                <div className="flex items-center space-x-2 text-xs text-rose-800 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 font-medium">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>
                    Cancelled on{' '}
                    {inspection.cancelledAt ? new Date(inspection.cancelledAt).toLocaleString() : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Notice */}
          {isCancelled && inspection.cancellationReason && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block mb-1">
                Cancellation Reason:
              </span>
              <p className="text-xs text-rose-800 italic">{inspection.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* 4-COLUMN JURISDICTION & DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* COLUMN 1: ASSIGNED OFFICER */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-indigo-600" />
              Assigned LMO Officer
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{officer.fullName}</h3>
                <span className="text-xs text-slate-500 font-mono">
                  Badge: {officer.badgeNumber}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{officer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>{officer.phoneNumber}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <span className="font-semibold text-slate-800">{officer.jurisdictionDistrict}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: BUSINESS ENTITY */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Building className="w-4 h-4 mr-2 text-indigo-600" />
              Business Entity
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm truncate">
                  {business.legalName}
                </h3>
                <p className="text-xs text-slate-500 truncate">{business.tradeName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 leading-snug">
                    {business.premisesAddress}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between">
                  <span className="text-slate-500">District:</span>
                  <span className="font-medium text-slate-800">{business.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN:</span>
                  <span className="font-mono text-slate-800">{business.gstNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: INSTRUMENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Scale className="w-4 h-4 mr-2 text-indigo-600" />
              Instrument
            </h2>

            <div className="space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{instrument.name}</h3>
                <p className="text-xs text-slate-500">{instrument.category}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial #:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {instrument.serialNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Capacity:</span>
                  <span className="font-medium text-slate-800">
                    {instrument.capacity} {instrument.capacityUnit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy:</span>
                  <span className="font-medium text-slate-800">
                    {instrument.accuracy} {instrument.accuracyUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 4: STATUTORY APPLICATION */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              Application Docket
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 text-xs truncate">
                  {appData.applicationNumber}
                </span>
                <ApplicationStatusBadge status={appData.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type:</span>
                  <span className="font-medium text-slate-800">{appData.applicationType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested:</span>
                  <span className="text-slate-700">{appData.requestedDate || 'N/A'}</span>
                </div>
                {appData.id && (
                  <div className="pt-2 border-t border-slate-200">
                    <Link
                      to={`/admin/verification-applications/${appData.id}`}
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Application Audit
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COMPONENT 7: MEASUREMENT TEST RESULTS AUDIT CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 mt-1">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Regulatory Audit • Component 7
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Measurement Testing & Error Calculations
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Review test points, standard vs observed weights, calculated errors, percentage deviations, and officer testing remarks.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/admin/inspections/${inspection.id}/measurement-tests`}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition whitespace-nowrap"
              >
                <Scale className="w-4 h-4 mr-2" />
                View Measurement Test Results
              </Link>
            </div>
          </div>
        </div>

        {/* AUDIT TIMELINE & FIELD NOTES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notes */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100 mb-4">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                <Edit3 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Inspection Findings & Physical Observations
              </h2>
            </div>

            {inspection.notes ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                {inspection.notes}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">No observation notes recorded for this inspection docket.</p>
              </div>
            )}
          </div>

          {/* Audit Timestamps */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-indigo-600" />
              Lifecycle Audit Trail
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">1. Scheduled Slot</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {inspection.scheduledAt ? new Date(inspection.scheduledAt).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">2. Started At</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {inspection.startedAt ? new Date(inspection.startedAt).toLocaleString() : 'Not started'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-medium">3. Completed At</span>
                <span className="font-semibold text-slate-800 block mt-0.5">
                  {inspection.completedAt ? new Date(inspection.completedAt).toLocaleString() : 'Pending'}
                </span>
              </div>

              {inspection.cancelledAt && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-rose-500 block font-medium">Cancelled At</span>
                  <span className="font-semibold text-rose-800 block mt-0.5">
                    {new Date(inspection.cancelledAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
