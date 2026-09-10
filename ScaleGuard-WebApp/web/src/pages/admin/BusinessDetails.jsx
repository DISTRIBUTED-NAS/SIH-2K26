import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { businessService } from '../../services/businessService';
import { Building2, Mail, Phone, MapPin, ShieldCheck, ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react';

export const BusinessDetails = () => {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await businessService.getBusinessById(id);
        setBusiness(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve business record.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

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
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2">
              <Link to="/dashboard/admin" className="hover:text-purple-700">Admin Console</Link>
              <span>&rarr;</span>
              <Link to="/admin/businesses" className="hover:text-purple-700">Business Directory</Link>
              <span>&rarr;</span>
              <span className="text-purple-700 font-semibold">Business #{id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {business ? business.businessName : `Business Profile #${id}`}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Administrative inspection and compliance review details.
            </p>
          </div>

          <Link
            to="/admin/businesses"
            className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors self-start sm:self-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Directory
          </Link>
        </div>

        {error ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Record Not Found</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/businesses')}
              className="px-4 py-2 bg-purple-700 text-white rounded-lg text-xs font-semibold hover:bg-purple-800 transition-colors"
            >
              Return to Business Directory
            </button>
          </div>
        ) : (
          business && (
            <div className="space-y-6">
              {/* Header Overview Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h2 className="text-xl font-bold text-slate-900">{business.businessName}</h2>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        {business.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{business.businessType}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 self-start sm:self-center font-mono">
                  <div>Entity Record ID: <strong>#{business.id}</strong></div>
                  <div>Linked Owner Account: <strong>User #{business.ownerId}</strong></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Business Registration Identifiers */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-purple-700" />
                    Legal Identification & Licensing
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Legal Name</span>
                      <span className="font-semibold text-slate-800">{business.businessName}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Classification / Type</span>
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
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-purple-700" />
                    Contact & Communication Details
                  </h3>

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
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Associated Owner ID</span>
                      <span className="font-mono text-purple-700 font-semibold">User #{business.ownerId}</span>
                    </div>
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-purple-700" />
                    Registered Premise / Inspection Location
                  </h3>

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

                {/* Audit & Compliance Timestamps */}
                <div className="bg-slate-100/60 p-4 rounded-xl border border-slate-200 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Registered on: <strong>{formatDate(business.createdAt)}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Last Record Update: <strong>{formatDate(business.updatedAt)}</strong></span>
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
