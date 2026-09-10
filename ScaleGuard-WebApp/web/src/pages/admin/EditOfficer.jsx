import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { officerService } from '../../services/officerService';
import {
  Edit2,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Building,
  MapPin,
  Phone,
  User,
  Shield,
  Hash,
  Mail
} from 'lucide-react';

export const EditOfficer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    district: '',
    phoneNumber: '',
  });

  const [staticData, setStaticData] = useState({
    officerCode: '',
    email: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchOfficerData();
  }, [id]);

  const fetchOfficerData = async () => {
    try {
      setInitialLoading(true);
      setError('');
      const data = await officerService.getOfficerById(id);
      setFormData({
        name: data.name || '',
        designation: data.designation || '',
        department: data.department || '',
        district: data.district || '',
        phoneNumber: data.phoneNumber || '',
      });
      setStaticData({
        officerCode: data.officerCode || '',
        email: data.email || '',
      });
    } catch (err) {
      console.error('Failed to load officer for editing', err);
      setError(err.response?.data?.message || 'Failed to fetch officer data.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      await officerService.updateOfficer(id, formData);
      navigate(`/admin/officers/${id}`);
    } catch (err) {
      console.error('Failed to update officer', err);
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
      }
      setError(err.response?.data?.message || 'Failed to update officer details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            to={`/admin/officers/${id}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Officer Details
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Edit2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Update Officer Record
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Modify profile, assignment details, and official contact information.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-6 sm:m-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Update Error: </span>
                {error}
              </div>
            </div>
          )}

          {initialLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Loading officer record...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Immutable Identity Notice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 flex items-center space-x-1 mb-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span>Officer Code (Permanent Identifier):</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{staticData.officerCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 flex items-center space-x-1 mb-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Email (Primary Login ID):</span>
                  </span>
                  <span className="font-semibold text-slate-800 text-sm">{staticData.email}</span>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.phoneNumber && <p className="text-xs text-rose-600 mt-1">{fieldErrors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    required
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {fieldErrors.designation && <p className="text-xs text-rose-600 mt-1">{fieldErrors.designation}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.department && <p className="text-xs text-rose-600 mt-1">{fieldErrors.department}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jurisdiction / District <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      name="district"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.district && <p className="text-xs text-rose-600 mt-1">{fieldErrors.district}</p>}
                </div>
              </div>

              {/* Submit / Cancel buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
                <Link
                  to={`/admin/officers/${id}`}
                  className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};
