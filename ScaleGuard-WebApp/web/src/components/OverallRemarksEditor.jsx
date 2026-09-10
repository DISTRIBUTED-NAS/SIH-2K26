import React, { useState, useEffect } from 'react';

export const OverallRemarksEditor = ({
  initialRemarks = '',
  isEditable = false,
  onSave,
}) => {
  const [remarks, setRemarks] = useState(initialRemarks || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRemarks(initialRemarks || '');
  }, [initialRemarks]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSavedSuccess(false);

    try {
      setSaving(true);
      await onSave(remarks.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save overall remarks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gov-100 rounded text-gov-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Overall Testing Remarks</h3>
        </div>
        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
            Remarks saved successfully
          </span>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
            {error}
          </div>
        )}

        {isEditable ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <textarea
                rows={4}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter general observations regarding instrument sensitivity, environmental temperature, repeatable accuracy, zero-point stability, etc."
                maxLength={2000}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 focus:border-gov-500 outline-none text-slate-800 text-sm resize-y"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Maximum 2,000 characters</span>
                <span>{remarks.length} / 2000</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Remarks</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {remarks ? (
              <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded-lg border border-slate-200">
                {remarks}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No overall testing remarks provided.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverallRemarksEditor;
