import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import {
  verificationApplicationService,
  APPLICATION_TYPES
} from '../../services/verificationApplicationService';
import { instrumentService } from '../../services/instrumentService';
import {
  FileText,
  Scale,
  Calendar,
  Clock,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Building2
} from 'lucide-react';

export const CreateVerificationApplication = () => {
  const navigate = useNavigate();

  const [instruments, setInstruments] = useState([]);
  const [loadingInstruments, setLoadingInstruments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    instrumentId: '',
    applicationType: 'INITIAL_VERIFICATION',
    purpose: '',
    requestedDate: todayStr,
    preferredInspectionDate: '',
    remarks: '',
  });

  useEffect(() => {
    fetchActiveInstruments();
  }, []);

  const fetchActiveInstruments = async () => {
    try {
      setLoadingInstruments(true);
      const data = await instrumentService.getMyInstruments({ status: 'ACTIVE' });
      setInstruments(data);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, instrumentId: data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load instruments', err);
      setGeneralError(
        err.response?.data?.message || 'Failed to load active instruments. Ensure you have registered instruments.'
      );
    } finally {
      setLoadingInstruments(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.instrumentId) {
      errors.instrumentId = 'Please select a registered instrument.';
    }
    if (!formData.applicationType) {
      errors.applicationType = 'Application type is required.';
    }
    if (!formData.purpose || !formData.purpose.trim()) {
      errors.purpose = 'Purpose of verification is required.';
    } else if (formData.purpose.trim().length < 5) {
      errors.purpose = 'Purpose must be at least 5 characters.';
    }

    if (formData.preferredInspectionDate) {
      if (formData.preferredInspectionDate < todayStr) {
        errors.preferredInspectionDate = 'Preferred inspection date cannot be in the past.';
      } else if (formData.requestedDate && formData.preferredInspectionDate < formData.requestedDate) {
        errors.preferredInspectionDate = 'Preferred inspection date cannot be before requested date.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        instrumentId: Number(formData.instrumentId),
        applicationType: formData.applicationType,
        purpose: formData.purpose.trim(),
        requestedDate: formData.requestedDate || todayStr,
        preferredInspectionDate: formData.preferredInspectionDate || null,
        remarks: formData.remarks ? formData.remarks.trim() : null,
      };

      const created = await verificationApplicationService.createApplication(payload);
      navigate(`/verification-applications/${created.id}`, {
        state: { message: 'Application created successfully as DRAFT.' }
      });
    } catch (err) {
      console.error('Create application error:', err);
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
      } else {
        setGeneralError(
          err.response?.data?.message || 'Failed to create verification application. Please review your inputs.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/verification-applications"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-gov-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Verification Applications
          </Link>

          <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
            Form VA-101 • Legal Metrology Act
          </span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gov-50 text-gov-600 rounded-xl border border-gov-100">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                New Verification Application
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Apply for statutory initial, periodic, or re-verification of weighing & measuring instruments.
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Alert */}
        {generalError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">{generalError}</div>
          </div>
        )}

        {/* No active instruments warning */}
        {!loadingInstruments && instruments.length === 0 && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                No Active Instruments Available
              </h3>
              <p className="text-sm text-amber-800/90 mt-1">
                You must have at least one registered active instrument before applying for verification.
              </p>
              <Link
                to="/instruments/create"
                className="mt-3 inline-flex items-center text-xs font-semibold text-amber-900 bg-amber-200/80 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Register an Instrument First
              </Link>
            </div>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: INSTRUMENT SELECTION */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-100">
              <Scale className="w-5 h-5 text-gov-600" />
              <h2 className="text-base font-bold text-slate-900">
                1. Instrument Selection
              </h2>
            </div>

            <div>
              <label htmlFor="instrumentId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Instrument *
              </label>
              {loadingInstruments ? (
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
              ) : (
                <select
                  id="instrumentId"
                  name="instrumentId"
                  value={formData.instrumentId}
                  onChange={handleChange}
                  disabled={instruments.length === 0}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    fieldErrors.instrumentId ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-gov-500`}
                >
                  <option value="">-- Choose an active instrument --</option>
                  {instruments.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.instrumentName} • SN: {inst.serialNumber} • {inst.manufacturer} ({inst.capacity} {inst.capacityUnit})
                    </option>
                  ))}
                </select>
              )}
              {fieldErrors.instrumentId && (
                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.instrumentId}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-500">
                Only active instruments registered to your legal business profile are listed.
              </p>
            </div>
          </div>

          {/* SECTION 2: APPLICATION INFORMATION */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-gov-600" />
              <h2 className="text-base font-bold text-slate-900">
                2. Application Information
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="applicationType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Application Type *
                </label>
                <select
                  id="applicationType"
                  name="applicationType"
                  value={formData.applicationType}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    fieldErrors.applicationType ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-gov-500`}
                >
                  {APPLICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label} — {type.description}
                    </option>
                  ))}
                </select>
                {fieldErrors.applicationType && (
                  <p className="mt-1.5 text-xs text-red-600">{fieldErrors.applicationType}</p>
                )}
              </div>

              <div>
                <label htmlFor="purpose" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Purpose of Verification *
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g. Mandatory annual verification for commercial trade use in retail grain market."
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    fieldErrors.purpose ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-gov-500`}
                />
                {fieldErrors.purpose && (
                  <p className="mt-1.5 text-xs text-red-600">{fieldErrors.purpose}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Provide brief justification for this verification request.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: INSPECTION PREFERENCE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-gov-600" />
              <h2 className="text-base font-bold text-slate-900">
                3. Inspection Preference
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="requestedDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Requested Date
                </label>
                <input
                  type="date"
                  id="requestedDate"
                  name="requestedDate"
                  value={formData.requestedDate}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Defaults to the date this application is drafted.
                </p>
              </div>

              <div>
                <label htmlFor="preferredInspectionDate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Inspection Date (Optional)
                </label>
                <input
                  type="date"
                  id="preferredInspectionDate"
                  name="preferredInspectionDate"
                  min={todayStr}
                  value={formData.preferredInspectionDate}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    fieldErrors.preferredInspectionDate ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                  } rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-gov-500`}
                />
                {fieldErrors.preferredInspectionDate && (
                  <p className="mt-1.5 text-xs text-red-600">{fieldErrors.preferredInspectionDate}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Target date for inspector physical site verification.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 4: ADDITIONAL REMARKS */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-5 pb-3 border-b border-slate-100">
              <Clock className="w-5 h-5 text-gov-600" />
              <h2 className="text-base font-bold text-slate-900">
                4. Additional Remarks & Schedule Instructions
              </h2>
            </div>

            <div>
              <label htmlFor="remarks" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Remarks (Optional)
              </label>
              <textarea
                id="remarks"
                name="remarks"
                rows={3}
                value={formData.remarks}
                onChange={handleChange}
                placeholder="e.g. Inspection available between 10:00 AM and 4:00 PM on weekdays. Contact site supervisor on arrival."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-500 focus:border-gov-500"
              />
              <p className="mt-1 text-xs text-slate-500">
                Any gate access, safety protocol, or contact instructions for inspection officers.
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
            <Link
              to="/verification-applications"
              className="px-5 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || instruments.length === 0}
              className={`inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-all ${
                submitting || instruments.length === 0
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gov-600 hover:bg-gov-700 hover:shadow'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving Draft...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Create Draft Application
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
