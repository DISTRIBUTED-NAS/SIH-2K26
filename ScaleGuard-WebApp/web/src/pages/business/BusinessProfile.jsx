import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { businessService } from '../../services/businessService';
import { Building2, Mail, Phone, MapPin, Edit3, ShieldCheck, Calendar, Clock, AlertCircle, PlusCircle } from 'lucide-react';

export const BusinessProfile = () => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await businessService.getMyBusiness();
        setBusiness(data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No business profile found. Please register your business profile first.');
        } else {
          setError(err.response?.data?.message || 'Failed to load business profile.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
          <Link to="/dashboard/business-owner" className="hover:text-gov-700">Dashboard</Link>
          <span>&rarr;</span>
          <span className="text-gov-700 font-semibold">Business Profile</span>
        </div>

        {error ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-lg mx-auto mt-8">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">No Profile Registered</h2>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Link
              to="/business-profile/create"
              className="inline-flex items-center px-4 py-2 bg-gov-700 text-white rounded-lg text-sm font-semibold hover:bg-gov-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Business Profile Now
            </Link>
          </div>
        ) : (
          business && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gov-50 rounded-xl text-gov-700">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl font-bold text-slate-900">{business.businessName}</h1>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        {business.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{business.businessType}</p>
                  </div>
                </div>

                <Link
                  to="/business-profile/edit"
                  id="edit-business-profile-btn"
                  className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-center"
                >
                  <Edit3 className="w-4 h-4 mr-1.5 text-gov-600" />
                  Edit Profile
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business & Registration Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-gov-700" />
                    Business & Compliance Identifiers
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Legal Name</span>
                      <span className="font-semibold text-slate-800">{business.businessName}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Category / Type</span>
                      <span className="text-slate-800">{business.businessType}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Trade License / Reg. No.</span>
                      <span className="font-mono text-slate-800">{business.registrationNumber || 'Not Specified'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">GSTIN / Tax ID</span>
                      <span className="font-mono font-semibold text-slate-800">{business.gstNumber || 'Not Specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gov-700" />
                    Official Communications
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Email</span>
                      <span className="text-slate-800 font-medium">{business.contactEmail}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Phone</span>
                      <span className="text-slate-800 font-medium">{business.contactPhone}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">System Owner ID</span>
                      <span className="font-mono text-slate-600">User #{business.ownerId}</span>
                    </div>
                  </div>
                </div>

                {/* Physical Location */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gov-700" />
                    Physical Premises & Verification Address
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Premises Address</span>
                      <span className="text-slate-800 font-medium">
                        {business.addressLine1}
                        {business.addressLine2 && `, ${business.addressLine2}`}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">City</span>
                      <span className="text-slate-800 font-medium">{business.city}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">State</span>
                      <span className="text-slate-800 font-medium">{business.state}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">PIN Code</span>
                      <span className="text-slate-800 font-mono font-medium">{business.pincode}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Country</span>
                      <span className="text-slate-800 font-medium">{business.country}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Metadata */}
                <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Registered: <strong>{formatDate(business.createdAt)}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Last Updated: <strong>{formatDate(business.updatedAt)}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};
