import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { InstrumentStatusBadge } from '../../components/InstrumentStatusBadge';
import {
  instrumentService,
  getInstrumentTypeLabel,
} from '../../services/instrumentService';
import {
  Scale,
  ArrowLeft,
  Building2,
  RefreshCw,
  AlertTriangle,
  Info,
  Layers,
  MapPin,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const AdminInstrumentDetails = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await instrumentService.getInstrumentByIdForAdmin(id);
        setInstrument(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Instrument not found in statewide registry.'
            : err.response?.data?.message || err.message || 'Failed to fetch instrument details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/admin/instruments"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Statewide Registry
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-1">
                INSPECTION CONSOLE (READ-ONLY)
              </div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-purple-700" />
                {instrument ? instrument.instrumentName : 'Instrument Specification'}
              </h1>
              {instrument && (
                <p className="mt-1 text-xs text-slate-500 font-mono">
                  Asset #{instrument.id} &bull; Serial: {instrument.serialNumber}
                </p>
              )}
            </div>

            {instrument && <InstrumentStatusBadge status={instrument.status} />}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Inspection Error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin text-purple-600 mb-2" />
            <p className="text-sm">Fetching registry instrument data...</p>
          </div>
        ) : instrument ? (
          <div className="space-y-6">
            {/* Business Ownership Governance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-purple-700" />
                Registered Business Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business Entity Name
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block">
                    {instrument.businessName || 'N/A'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Business ID
                  </span>
                  <span className="font-mono text-slate-800 mt-1 block font-semibold">
                    #{instrument.businessId}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Jurisdiction Location
                  </span>
                  <span className="font-medium text-slate-800 mt-1 block">
                    {instrument.businessCity}, {instrument.businessState}
                  </span>
                </div>
              </div>
            </div>

            {/* Instrument Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-purple-700" />
                  Instrument Metadata
                </h2>

                <div className="space-y-3 text-sm">
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

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-purple-700" />
                  Verification & Technical Parameters
                </h2>

                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100">
                    <span className="block text-xs font-semibold text-purple-800 uppercase tracking-wider">
                      Rated Capacity
                    </span>
                    <span className="text-xl font-bold text-purple-950">
                      {instrument.capacity}{' '}
                      <span className="text-sm font-semibold text-purple-800">
                        {instrument.capacityUnit}
                      </span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Accuracy Class (e / d)
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

            {/* Location & Audit Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-purple-700" />
                Physical Installation Location
              </h2>

              <p className="text-sm font-medium text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                {instrument.location}
              </p>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-6 text-xs text-slate-500">
                <div>
                  <span className="font-semibold text-slate-700">Created: </span>
                  {new Date(instrument.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Last Modified: </span>
                  {new Date(instrument.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};
