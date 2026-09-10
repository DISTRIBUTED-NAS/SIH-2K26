import React, { useState, useEffect } from 'react';
import { officerService } from '../services/officerService';
import { officerAssignmentService } from '../services/officerAssignmentService';
import { UserCheck, AlertCircle, Loader2, X, Shield } from 'lucide-react';

export const OfficerAssignmentModal = ({ isOpen, onClose, application, onSuccess }) => {
  const [officers, setOfficers] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isReassign = application?.status === 'OFFICER_ASSIGNED';

  useEffect(() => {
    if (isOpen) {
      loadActiveOfficers();
      setSelectedOfficerId(application?.assignedOfficer?.id ? String(application.assignedOfficer.id) : '');
      setError(null);
    }
  }, [isOpen, application]);

  const loadActiveOfficers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await officerService.getOfficers({ status: 'ACTIVE', size: 100 });
      const officerList = data.content || (Array.isArray(data) ? data : []);
      setOfficers(officerList);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load active officers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) {
      setError('Please select an officer to assign.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isReassign) {
        await officerAssignmentService.reassignOfficer(application.id, Number(selectedOfficerId));
      } else {
        await officerAssignmentService.assignOfficer(application.id, Number(selectedOfficerId));
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isReassign ? 'reassign' : 'assign'} officer`);
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
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                {isReassign ? 'Reassign Inspection Officer' : 'Assign Inspection Officer'}
              </h3>
              <p className="text-xs text-slate-500">
                Application: <span className="font-mono font-medium text-slate-700">{application?.applicationNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isReassign && application?.assignedOfficer && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <span className="font-semibold">Currently Assigned:</span>{' '}
              {application.assignedOfficer.name} ({application.assignedOfficer.officerCode}) —{' '}
              {application.assignedOfficer.designation}, {application.assignedOfficer.district}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Active Officer <span className="text-rose-500">*</span>
            </label>

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs">Loading active officers...</span>
              </div>
            ) : officers.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200">
                No active officers found. Please add or activate officers in Officer Management.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {officers.map((officer) => {
                  const isSelected = selectedOfficerId === String(officer.id);
                  return (
                    <label
                      key={officer.id}
                      className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="officerId"
                        value={officer.id}
                        checked={isSelected}
                        onChange={(e) => setSelectedOfficerId(e.target.value)}
                        className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <div className="ml-3 flex-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{officer.name}</span>
                          <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {officer.officerCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {officer.designation} • {officer.department}
                        </p>
                        <p className="text-xs text-indigo-600 font-medium mt-0.5">
                          Jurisdiction: {officer.district}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !selectedOfficerId}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-1.5" />
                  {isReassign ? 'Reassign Officer' : 'Assign Officer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
