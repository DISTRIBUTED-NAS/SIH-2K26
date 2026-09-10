import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { officerService } from '../../services/officerService';
import {
  UserPlus,
  Shield,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Mail,
  Lock,
  User,
  Building,
  MapPin,
  Phone,
  BadgeAlert
} from 'lucide-react';

export const CreateOfficer = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    officerCode: '',
    designation: 'Inspector of Legal Metrology',
    department: 'Legal Metrology Department',
    district: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await officerService.createOfficer(formData);
      navigate('/admin/officers');
    } catch (err) {
      console.error('Failed to create officer', err);
      if (err.response?.data?.validationErrors) {
        setFieldErrors(err.response.data.validationErrors);
      }
      setError(err.response?.data?.message || 'Failed to provision officer. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/admin/officers"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Officers Directory
          </Link>
        </div>

        {/* Card Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Provision Legal Metrology Officer
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Create a government enforcement officer account with assigned jurisdiction and inspection credentials.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="m-6 sm:m-8 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Creation Error: </span>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Account Credentials Section */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Account Credentials (Role: LMO_OFFICER)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Officer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Inspector Ramesh K. Patel"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.name && <p className="text-xs text-rose-600 mt-1">{fieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. ramesh.patel@gujarat.gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
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
                      placeholder="e.g. +91-9876543210"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.phoneNumber && <p className="text-xs text-rose-600 mt-1">{fieldErrors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Jurisdiction & Profile Section */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-2">
                <BadgeAlert className="w-4 h-4 text-indigo-600" />
                <span>Officer Profile & Jurisdiction</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Officer Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="officerCode"
                    required
                    placeholder="e.g. LMO-GUJ-AHM-01"
                    value={formData.officerCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {fieldErrors.officerCode && <p className="text-xs text-rose-600 mt-1">{fieldErrors.officerCode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="designation"
                    required
                    placeholder="e.g. Inspector of Legal Metrology"
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
                      placeholder="e.g. Legal Metrology Department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.department && <p className="text-xs text-rose-600 mt-1">{fieldErrors.department}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    District / Jurisdiction <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      name="district"
                      required
                      placeholder="e.g. Ahmedabad"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {fieldErrors.district && <p className="text-xs text-rose-600 mt-1">{fieldErrors.district}</p>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-end space-x-3">
              <Link
                to="/admin/officers"
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Provisioning Officer...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Provision Officer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
