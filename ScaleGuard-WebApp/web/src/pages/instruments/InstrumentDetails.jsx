import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InstrumentStatusBadge } from '../../components/InstrumentStatusBadge';
import {
  instrumentService,
  getInstrumentTypeLabel,
} from '../../services/instrumentService';
import {
  Scale,
  ArrowLeft,
  Edit2,
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  Calendar,
  Clock,
  MapPin,
  Building,
} from 'lucide-react';

export const InstrumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instrumentService.getMyInstrumentById(id);
      setInstrument(data);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'Instrument not found or does not belong to your business.'
          : err.response?.data?.message || err.message || 'Failed to load instrument details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!instrument) return;
    setStatusUpdating(true);
    try {
      const nextStatus = instrument.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const updated = await instrumentService.updateMyInstrumentStatus(instrument.id, nextStatus);
      setInstrument(updated);
      setConfirmModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status.');
      setConfirmModal(false);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              to="/instruments"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Instruments
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Scale className="w-6 h-6 mr-2 text-gov-600" />
              {instrument ? instrument.instrumentName : 'Instrument Details'}
            </h1>
            {instrument && (
              <p className="mt-1 text-xs text-slate-500 font-mono">
                Serial Number: {instrument.serialNumber}
              </p>
            )}
          </div>

          {instrument && (
            <div className="flex items-center space-x-2">
              <Link
                to={`/instruments/${instrument.id}/edit`}
                className="inline-flex items-center px-3.5 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                Edit Instrument
              </Link>

              <button
                type="button"
                onClick={() => setConfirmModal(true)}
                className={`inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
                  instrument.status === 'ACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Power className="w-3.5 h-3.5 mr-1.5" />
                {instrument.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Error Loading Instrument</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-gov-600 mb-2" />
            <p className="text-sm">Fetching instrument specifications...</p>
          </div>
        ) : instrument ? (
          <div className="space-y-6">
            {/* Status Summary Banner */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Instrument Compliance Status
                </span>
                <div className="flex items-center space-x-3">
                  <InstrumentStatusBadge status={instrument.status} />
                  <span className="text-xs text-slate-500">
                    Registered Asset ID #{instrument.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs text-slate-500">
                <div>
                  <span className="block font-semibold text-slate-700">Registered</span>
                  <span>{new Date(instrument.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block font-semibold text-slate-700">Last Updated</span>
                  <span>{new Date(instrument.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Grid 1: Basic Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-gov-600" />
                  Instrument Information
                </h2>

                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Instrument Name
                    </span>
                    <span className="font-medium text-slate-900">{instrument.instrumentName}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Instrument Type
                    </span>
                    <span className="font-medium text-slate-800">
                      {getInstrumentTypeLabel(instrument.instrumentType)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Manufacturer
                    </span>
                    <span className="font-medium text-slate-800">{instrument.manufacturer}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Model Number
                    </span>
                    <span className="font-mono text-slate-800">{instrument.modelNumber}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Serial Number
                    </span>
                    <span className="font-mono text-slate-900 font-semibold bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block mt-0.5">
                      {instrument.serialNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Measurement Specs Card */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-gov-600" />
                  Measurement Specifications
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-gov-50/50 rounded-lg border border-gov-100">
                    <span className="block text-xs font-semibold text-gov-800 uppercase tracking-wider">
                      Maximum Rated Capacity
                    </span>
                    <span className="text-xl font-bold text-gov-900">
                      {instrument.capacity}{' '}
                      <span className="text-sm font-semibold text-gov-700">
                        {instrument.capacityUnit}
                      </span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Verification Accuracy (e / d)
                    </span>
                    <span className="text-lg font-bold text-slate-800">
                      {instrument.accuracy}{' '}
                      <span className="text-sm font-semibold text-slate-600">
                        {instrument.accuracyUnit}
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Manufacturing Year
                    </span>
                    <span className="font-medium text-slate-800">{instrument.manufacturingYear}</span>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Purchase Date
                    </span>
                    <span className="font-medium text-slate-800">
                      {instrument.purchaseDate ? instrument.purchaseDate : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Ownership Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gov-600" />
                Physical Installation Location
              </h2>

              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {instrument.location}
              </p>
            </div>
          </div>
        ) : null}
      </main>

      {/* Confirmation Modal */}
      {confirmModal && instrument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {instrument.status === 'ACTIVE' ? 'Deactivate Instrument?' : 'Activate Instrument?'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to mark{' '}
              <span className="font-semibold text-slate-800">{instrument.instrumentName}</span> as{' '}
              <span className="font-bold">
                {instrument.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(false)}
                disabled={statusUpdating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusUpdating}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors ${
                  instrument.status === 'ACTIVE'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {statusUpdating
                  ? 'Updating...'
                  : instrument.status === 'ACTIVE'
                  ? 'Confirm Deactivation'
                  : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
