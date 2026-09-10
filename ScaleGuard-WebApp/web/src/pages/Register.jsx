import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { ShieldCheck, User, Mail, Phone, Lock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error upon modification
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (!formData.phoneNumber.trim() || formData.phoneNumber.trim().length < 7) {
      errors.phoneNumber = 'Please provide a valid contact phone number';
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

    setLoading(true);

    try {
      await authService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login?registered=true');
      }, 1500);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.validationErrors) {
          setValidationErrors(errorData.validationErrors);
        }
        setGeneralError(errorData.message || 'Registration failed. Please review your input.');
      } else if (err.message) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Could not connect to the backend server. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gov-900 shadow-md text-white mb-4">
          <ShieldCheck className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Business Owner Registration
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Create an official account to manage weighing & measuring instrument verifications
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200">
          
          {/* Success banner */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration successful!</p>
                <p className="text-xs text-emerald-700">Redirecting to login portal...</p>
              </div>
            </div>
          )}

          {/* General error banner */}
          {generalError && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                Full Name / Business Representative
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rajesh Kumar"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.fullName ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 sm:text-sm`}
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Business Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="business@example.com"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.email ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 sm:text-sm`}
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-700">
                Phone Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91-9876543210"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.phoneNumber ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 sm:text-sm`}
                />
              </div>
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.phoneNumber}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.password ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 sm:text-sm`}
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    validationErrors.confirmPassword ? 'border-rose-400' : 'border-slate-300'
                  } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 sm:text-sm`}
                />
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600">{validationErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                id="register-submit-btn"
                type="submit"
                disabled={loading || success}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-600 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              Already have an official account?{' '}
              <Link
                to="/login"
                id="link-to-login"
                className="font-semibold text-gov-700 hover:text-gov-800 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
