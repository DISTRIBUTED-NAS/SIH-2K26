import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { businessService } from '../../services/businessService';
import { Building2, Mail, Phone, MapPin, AlertCircle, CheckCircle2, Save, ArrowLeft } from 'lucide-react';

export const EditBusinessProfile = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    registrationNumber: '',
    gstNumber: '',
    contactEmail: '',
    contactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const businessTypes = [
    'Retail Shop',
    'Wholesale Trading',
    'Manufacturing Unit',
    'Packaging & Distribution',
    'Grain / Agricultural Market',
    'Petrol / Diesel Dispenser',
    'Jewellery & Precious Metals',
    'Weighbridge / Heavy Vehicle',
    'Healthcare / Clinic',
    'Other Commercial Establishment'
  ];

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const data = await businessService.getMyBusiness();
        setFormData({
          businessName: data.businessName || '',
          businessType: data.businessType || 'Retail Shop',
          registrationNumber: data.registrationNumber || '',
          gstNumber: data.gstNumber || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
          country: data.country || 'India',
        });
      } catch (err) {
        setGeneralError('Failed to load existing business profile details.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExisting();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      errors.businessName = 'Business name must be at least 2 characters';
    }

    if (!formData.businessType) {
      errors.businessType = 'Please select a business type';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail.trim() || !emailRegex.test(formData.contactEmail.trim())) {
      errors.contactEmail = 'Please provide a valid contact email';
    }

    if (!formData.contactPhone.trim() || formData.contactPhone.trim().length < 7) {
      errors.contactPhone = 'Please provide a valid contact phone number';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pincode.trim() || formData.pincode.trim().length < 4) {
      errors.pincode = 'Please enter a valid postal code';
    }

    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      await businessService.updateMyBusiness(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/business-profile');
      }, 1200);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.validationErrors) {
          setValidationErrors(errorData.validationErrors);
        }
        setGeneralError(errorData.message || 'Failed to update business profile.');
      } else {
        setGeneralError('An unexpected error occurred while updating the profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
              <Link to="/dashboard/business-owner" className="hover:text-gov-700">Dashboard</Link>
              <span>&rarr;</span>
              <Link to="/business-profile" className="hover:text-gov-700">Business Profile</Link>
              <span>&rarr;</span>
              <span className="text-gov-700 font-semibold">Edit</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Modify Business Profile</h1>
            <p className="mt-1 text-sm text-slate-600">
              Update legal metrology records and physical premise verification details.
            </p>
          </div>

          <Link
            to="/business-profile"
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 self-start sm:self-center transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Profile
          </Link>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Business Profile Updated Successfully!</p>
              <p className="text-xs text-emerald-700">Redirecting to updated view...</p>
            </div>
          </div>
        )}

        {generalError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION 1: BUSINESS IDENTIFIERS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Building2 className="w-5 h-5 text-gov-700" />
              <h2 className="text-base font-bold text-slate-900">1. Business Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="businessName" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Business Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.businessName ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.businessName && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.businessName}</p>
                )}
              </div>

              <div>
                <label htmlFor="businessType" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Business Category / Type <span className="text-rose-500">*</span>
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600 bg-white"
                >
                  {businessTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.businessType && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.businessType}</p>
                )}
              </div>

              <div>
                <label htmlFor="registrationNumber" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Trade License / Registration No. (Optional)
                </label>
                <input
                  id="registrationNumber"
                  name="registrationNumber"
                  type="text"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="gstNumber" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  GSTIN / Tax ID (Optional)
                </label>
                <input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gov-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT DETAILS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <Mail className="w-5 h-5 text-gov-700" />
              <h2 className="text-base font-bold text-slate-900">2. Official Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactEmail" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.contactEmail ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.contactEmail && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.contactEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.contactPhone ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.contactPhone && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: PHYSICAL ADDRESS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
              <MapPin className="w-5 h-5 text-gov-700" />
              <h2 className="text-base font-bold text-slate-900">3. Physical Business Location</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="addressLine1" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Address Line 1 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.addressLine1 ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.addressLine1 && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.addressLine1}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="addressLine2" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Address Line 2 (Optional)
                </label>
                <input
                  id="addressLine2"
                  name="addressLine2"
                  type="text"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.city ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.city && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="state" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  State / Province <span className="text-rose-500">*</span>
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.state ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.state && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.state}</p>
                )}
              </div>

              <div>
                <label htmlFor="pincode" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  PIN / Postal Code <span className="text-rose-500">*</span>
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.pincode ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.pincode && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.pincode}</p>
                )}
              </div>

              <div>
                <label htmlFor="country" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    validationErrors.country ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-gov-600`}
                />
                {validationErrors.country && (
                  <p className="mt-1 text-xs text-rose-600">{validationErrors.country}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={() => navigate('/business-profile')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="update-business-submit-btn"
              type="submit"
              disabled={saving || success}
              className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 disabled:opacity-60 transition-colors shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating Profile...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};
