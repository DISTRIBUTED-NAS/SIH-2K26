import React, { useState, useMemo } from 'react';

export const AddMeasurementRecordModal = ({ isOpen, onClose, onAdd, defaultUnit = 'kg' }) => {
  const [standardValue, setStandardValue] = useState('');
  const [observedValue, setObservedValue] = useState('');
  const [unit, setUnit] = useState(defaultUnit);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live preview calculation (preview only, backend is source of truth)
  const preview = useMemo(() => {
    const std = parseFloat(standardValue);
    const obs = parseFloat(observedValue);

    if (!isNaN(std) && !isNaN(obs) && std > 0 && obs >= 0) {
      const err = obs - std;
      const pct = (err / std) * 100;
      return {
        error: err.toFixed(4),
        percentage: pct.toFixed(4),
        valid: true,
      };
    }
    return null;
  }, [standardValue, observedValue]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const std = parseFloat(standardValue);
    const obs = parseFloat(observedValue);

    if (isNaN(std) || std <= 0) {
      setError('Standard value must be a positive number greater than zero.');
      return;
    }
    if (isNaN(obs) || obs < 0) {
      setError('Observed value must be a non-negative number.');
      return;
    }
    if (!unit.trim()) {
      setError('Measurement unit is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onAdd({
        standardValue: std,
        observedValue: obs,
        unit: unit.trim(),
        remarks: remarks.trim() || null,
      });
      // Reset form
      setStandardValue('');
      setObservedValue('');
      setRemarks('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add measurement record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gov-100 rounded-lg text-gov-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Add Measurement Test Reading</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start space-x-2">
              <svg className="w-5 h-5 flex-shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Standard Value <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={standardValue}
                onChange={(e) => setStandardValue(e.target.value)}
                placeholder="e.g. 10.000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:border-gov-500 outline-none text-slate-900 font-mono text-sm"
              />
              <span className="text-xs text-slate-500">Certified reference weight</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Observed Value <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={observedValue}
                onChange={(e) => setObservedValue(e.target.value)}
                placeholder="e.g. 10.020"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:border-gov-500 outline-none text-slate-900 font-mono text-sm"
              />
              <span className="text-xs text-slate-500">Reading shown on scale</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Measurement Unit <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="e.g. kg, g, mg, lb"
              maxLength={30}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:border-gov-500 outline-none text-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Remarks (Optional)
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Normal reading, Corner test, Mid-capacity"
              maxLength={1000}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:border-gov-500 outline-none text-slate-900 text-sm"
            />
          </div>

          {/* Live Preview Card */}
          {preview && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-blue-900 uppercase">Live Preview</span>
                <span className="text-[10px] text-blue-600 italic">Backend will calculate final verified values</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs text-blue-700">Calculated Error:</span>
                  <div className={`font-mono font-bold ${parseFloat(preview.error) > 0 ? 'text-amber-700' : parseFloat(preview.error) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {parseFloat(preview.error) > 0 ? `+${preview.error}` : preview.error} {unit}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-blue-700">Percentage Error:</span>
                  <div className={`font-mono font-bold ${parseFloat(preview.percentage) > 0 ? 'text-amber-700' : parseFloat(preview.percentage) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {parseFloat(preview.percentage) > 0 ? `+${preview.percentage}%` : `${preview.percentage}%`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-gov-600 rounded-lg hover:bg-gov-700 transition flex items-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Add Reading</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMeasurementRecordModal;
