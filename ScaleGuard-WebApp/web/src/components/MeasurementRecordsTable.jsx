import React, { useState } from 'react';

export const MeasurementRecordsTable = ({
  records = [],
  isEditable = false,
  onEdit,
  onDelete,
  loading = false,
}) => {
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      setDeleting(true);
      await onDelete(recordToDelete.id);
      setRecordToDelete(null);
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setDeleting(false);
    }
  };

  const formatNumber = (num, decimals = 3) => {
    if (num == null) return '-';
    const parsed = typeof num === 'number' ? num : parseFloat(num);
    if (isNaN(parsed)) return '-';
    return parsed.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 6,
    });
  };

  const formatError = (val, decimals = 3) => {
    if (val == null) return '-';
    const parsed = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(parsed)) return '-';
    const formatted = parsed.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: 6,
    });
    return parsed > 0 ? `+${formatted}` : formatted;
  };

  const formatPercentage = (val) => {
    if (val == null) return '-';
    const parsed = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(parsed)) return '-';
    const formatted = parsed.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
    return parsed > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-sm font-medium">Loading measurement readings...</span>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h4 className="text-base font-semibold text-slate-800 mb-1">No Measurement Readings Recorded</h4>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {isEditable
            ? 'Start adding verified calibration weights and recorded instrument readings using the "Add Reading" button above.'
            : 'No measurement test points were recorded for this inspection session.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4 text-center w-16">Point</th>
              <th className="py-3 px-4 text-right">Standard Value</th>
              <th className="py-3 px-4 text-right">Observed Value</th>
              <th className="py-3 px-4 text-right">Error Value</th>
              <th className="py-3 px-4 text-right">% Error</th>
              <th className="py-3 px-4 text-center">Unit</th>
              <th className="py-3 px-4">Remarks</th>
              {isEditable && <th className="py-3 px-4 text-center w-28">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => {
              const errNum = parseFloat(r.errorValue);
              const errColor =
                errNum > 0
                  ? 'text-amber-700 bg-amber-50/50'
                  : errNum < 0
                  ? 'text-rose-700 bg-rose-50/50'
                  : 'text-emerald-700 bg-emerald-50/50';

              return (
                <tr key={r.id} className="hover:bg-slate-50/80 transition group">
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                      #{r.testPoint}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                    {formatNumber(r.standardValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-900">
                    {formatNumber(r.observedValue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded ${errColor}`}>
                      {formatError(r.errorValue)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded ${errColor}`}>
                      {formatPercentage(r.percentageError)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">
                      {r.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                    {r.remarks || <span className="text-slate-400 italic">—</span>}
                  </td>
                  {isEditable && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onEdit(r)}
                          title="Edit reading"
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setRecordToDelete(r)}
                          title="Delete reading"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-rose-100 rounded-full text-rose-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Delete Reading #{recordToDelete.testPoint}?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete this measurement reading? Remaining test point numbers will be preserved for audit consistency.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Reading</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MeasurementRecordsTable;
