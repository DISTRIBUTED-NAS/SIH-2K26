import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, FileText, AlertCircle, Loader2, X, CheckCircle2 } from 'lucide-react';
import { inspectionService } from '../services/inspectionService';

export const CreateInspectionModal = ({ isOpen, onClose, application, onSuccess }) => {
  // Format current date + 1 hour as default min
  const getDefaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [scheduledAt, setScheduledAt] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setScheduledAt(getDefaultDateTime());
      // Suggest business address if available
      const defaultLoc = application?.business?.premisesAddress 
        ? `${application.business.premisesAddress}, ${application.business.district || ''}` 
        : '';
      setLocation(defaultLoc);
      setNotes('');
      setError(null);
    }
  }, [isOpen, application]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) {
      setError('Please select a scheduled inspection date and time.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter the inspection premises location.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Backend expects ISO LocalDateTime (e.g. 2026-09-10T10:00:00)
      let formattedDate = scheduledAt;
      if (formattedDate.length === 16) {
        formattedDate += ':00';
      }

      const payload = {
        applicationId: application.id,
        scheduledAt: formattedDate,
        location: location.trim(),
        notes: notes.trim() || null,
      };

      const result = await inspectionService.scheduleInspection(payload);
      onSuccess?.(result);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule inspection. Please verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Schedule Inspection</h3>
              <p className="text-xs text-slate-500 font-mono">{application?.applicationNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Business:</span>
              <span className="font-semibold text-slate-700">{application?.business?.legalName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Instrument:</span>
              <span className="font-semibold text-slate-700">
                {application?.instrument?.name || 'Instrument'} ({application?.instrument?.category || 'Standard'})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Scheduled Date & Time *
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Select the scheduled date & time for on-site verification.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Inspection Location *
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Shop 4, Market Complex, North District"
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Preliminary Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any instructions, preparation notes, or testing requirements..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Schedule
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
