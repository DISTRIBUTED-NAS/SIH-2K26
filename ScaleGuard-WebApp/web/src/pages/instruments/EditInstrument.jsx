import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import {
  instrumentService,
  INSTRUMENT_TYPES,
  CAPACITY_UNITS,
  ACCURACY_UNITS,
} from '../../services/instrumentService';
import {
  Scale,
  ArrowLeft,
  AlertTriangle,
  Info,
  Layers,
  Calendar,
  Save,
  RefreshCw,
} from 'lucide-react';

export const EditInstrument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    instrumentName: '',
    instrumentType: 'DIGITAL_WEIGHING_SCALE',
    manufacturer: '',
    modelNumber: '',
    serialNumber: '',
    capacity: '',
    capacityUnit: 'KG',
    accuracy: '',
    accuracyUnit: 'KG',
    manufacturingYear: currentYear,
    purchaseDate: '',
    location: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadInstrument = async () => {
      setLoading(true);
      try {
        const data = await instrumentService.getMyInstrumentById(id);
        setFormData({
          instrumentName: data.instrumentName || '',
          instrumentType: data.instrumentType || 'DIGITAL_WEIGHING_SCALE',
          manufacturer: data.manufacturer || '',
          modelNumber: data.modelNumber || '',
          serialNumber: data.serialNumber || '',
          capacity: data.capacity !== undefined ? String(data.capacity) : '',
          capacityUnit: data.capacityUnit || 'KG',
          accuracy: data.accuracy !== undefined ? String(data.accuracy) : '',
          accuracyUnit: data.accuracyUnit || 'KG',
          manufacturingYear: data.manufacturingYear || currentYear,
          purchaseDate: data.purchaseDate ? data.purchaseDate.split('T')[0] : '',
          location: data.location || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch instrument details.');
      } finally {
        setLoading(false);
      }
    };

    loadInstrument();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.instrumentName.trim()) errors.instrumentName = 'Instrument name is required';
    if (!formData.instrumentType) errors.instrumentType = 'Instrument type is required';
    if (!formData.manufacturer.trim()) errors.manufacturer = 'Manufacturer is required';
    if (!formData.modelNumber.trim()) errors.modelNumber = 'Model number is required';
    if (!formData.serialNumber.trim()) errors.serialNumber = 'Serial number is required';

    const cap = parseFloat(formData.capacity);
    if (isNaN(cap) || cap <= 0) errors.capacity = 'Capacity must be greater than 0';

    const acc = parseFloat(formData.accuracy);
    if (isNaN(acc) || acc <= 0) errors.accuracy = 'Accuracy must be greater than 0';

    const yr = parseInt(formData.manufacturingYear, 10);
    if (isNaN(yr) || yr < 1900 || yr > currentYear + 1) {
      errors.manufacturingYear = `Year must be between 1900 and ${currentYear + 1}`;
    }

    if (formData.purchaseDate && formData.purchaseDate > todayStr) {
      errors.purchaseDate = 'Purchase date cannot be in the future';
    }

    if (!formData.location.trim()) errors.location = 'Physical location is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        capacity: parseFloat(formData.capacity),
        accuracy: parseFloat(formData.accuracy),
        manufacturingYear: parseInt(formData.manufacturingYear, 10),
        purchaseDate: formData.purchaseDate ? formData.purchaseDate : null,
      };

      await instrumentService.updateMyInstrument(id, payload);
      navigate(`/instruments/${id}`);
    } catch (err) {
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
      }
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update instrument. Please verify entries.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin text-gov-600 mr-2" />
          <span className="text-sm">Loading instrument specifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to={`/instruments/${id}`}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Instrument Details
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-gov-600" />
                Edit Instrument
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Update technical specifications, physical location, or serial details for this instrument.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Update Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Instrument Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Info className="w-4 h-4 mr-2 text-gov-600" />
              1. Instrument Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Instrument Name *
                </label>
                <input
                  type="text"
                  name="instrumentName"
                  value={formData.instrumentName}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.instrumentName
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.instrumentName && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.instrumentName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Instrument Type *
                </label>
                <select
                  name="instrumentType"
                  value={formData.instrumentType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gov-500"
                >
                  {INSTRUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.manufacturer
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.manufacturer && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.manufacturer}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Model Number *
                </label>
                <input
                  type="text"
                  name="modelNumber"
                  value={formData.modelNumber}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.modelNumber
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.modelNumber && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.modelNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Serial Number *
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 ${
                    fieldErrors.serialNumber
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.serialNumber && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.serialNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Measurement Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Layers className="w-4 h-4 mr-2 text-gov-600" />
              2. Measurement Specifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Max Capacity *
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="number"
                    step="0.0001"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-l-lg border text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.capacity
                        ? 'border-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-gov-500'
                    }`}
                  />
                  <select
                    name="capacityUnit"
                    value={formData.capacityUnit}
                    onChange={handleChange}
                    className="w-24 px-2 py-2.5 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    {CAPACITY_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.capacity && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Verification Accuracy (e/d) *
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input
                    type="number"
                    step="0.0001"
                    name="accuracy"
                    value={formData.accuracy}
                    onChange={handleChange}
                    className={`flex-1 min-w-0 px-3.5 py-2.5 rounded-l-lg border text-sm focus:outline-none focus:ring-2 ${
                      fieldErrors.accuracy
                        ? 'border-rose-300 focus:ring-rose-500'
                        : 'border-slate-300 focus:ring-gov-500'
                    }`}
                  />
                  <select
                    name="accuracyUnit"
                    value={formData.accuracyUnit}
                    onChange={handleChange}
                    className="w-24 px-2 py-2.5 rounded-r-lg border border-l-0 border-slate-300 bg-slate-50 text-sm font-medium text-slate-700 focus:outline-none"
                  >
                    {ACCURACY_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
                {fieldErrors.accuracy && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.accuracy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Additional Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gov-600" />
              3. Operational & Location Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Manufacturing Year *
                </label>
                <input
                  type="number"
                  name="manufacturingYear"
                  value={formData.manufacturingYear}
                  onChange={handleChange}
                  min="1900"
                  max={currentYear + 1}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.manufacturingYear
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.manufacturingYear && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.manufacturingYear}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purchase Date (Optional)
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  max={todayStr}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 ${
                    fieldErrors.purchaseDate
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.purchaseDate && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.purchaseDate}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Installation Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.location
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-slate-300 focus:ring-gov-500'
                  }`}
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-xs text-rose-600">{fieldErrors.location}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              to={`/instruments/${id}`}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              id="submit-edit-instrument-btn"
              className="inline-flex items-center px-6 py-2.5 bg-gov-600 hover:bg-gov-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
