import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { authService } from '../services/authService';
import { businessService } from '../services/businessService';
import { instrumentService } from '../services/instrumentService';
import { verificationApplicationService } from '../services/verificationApplicationService';
import { BusinessProfileCard } from '../components/BusinessProfileCard';
import { Building2, ShieldCheck, UserCheck, Key, CheckCircle, AlertTriangle, RefreshCw, PlusCircle, ArrowRight, Scale, ChevronRight, FileText, Send } from 'lucide-react';

export const BusinessOwnerDashboard = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [businessLoading, setBusinessLoading] = useState(true);
  const [instrumentStats, setInstrumentStats] = useState({ total: 0, active: 0, inactive: 0, loading: true });
  const [applicationStats, setApplicationStats] = useState({ total: 0, draft: 0, submitted: 0, loading: true });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await businessService.getMyBusiness();
        setBusiness(data);

        // If business exists, fetch instruments & applications
        try {
          const instList = await instrumentService.getMyInstruments();
          const total = instList.length;
          const active = instList.filter((i) => i.status === 'ACTIVE').length;
          const inactive = instList.filter((i) => i.status === 'INACTIVE').length;
          setInstrumentStats({ total, active, inactive, loading: false });
        } catch {
          setInstrumentStats({ total: 0, active: 0, inactive: 0, loading: false });
        }

        try {
          const appList = await verificationApplicationService.getMyApplications();
          const totalApps = appList.length;
          const draftApps = appList.filter((a) => a.status === 'DRAFT').length;
          const submittedApps = appList.filter((a) => a.status === 'SUBMITTED').length;
          setApplicationStats({ total: totalApps, draft: draftApps, submitted: submittedApps, loading: false });
        } catch {
          setApplicationStats({ total: 0, draft: 0, submitted: 0, loading: false });
        }
      } catch (err) {
        // 404 means no business profile has been registered yet
        setBusiness(null);
        setInstrumentStats({ total: 0, active: 0, inactive: 0, loading: false });
        setApplicationStats({ total: 0, draft: 0, submitted: 0, loading: false });
      } finally {
        setBusinessLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const runTest = async (testName, testFn) => {
    setTesting(true);
    setTestResult(null);
    try {
      const data = await testFn();
      setTestResult({
        test: testName,
        status: 'SUCCESS',
        code: 200,
        message: data.message || 'Access Authorized by Backend Security Filter',
        data,
      });
    } catch (err) {
      setTestResult({
        test: testName,
        status: 'FORBIDDEN / ERROR',
        code: err.response ? err.response.status : 500,
        message: err.response?.data?.message || err.message || 'Request failed',
        data: err.response?.data,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-2">
                AUTHENTICATED BUSINESS OWNER PORTAL
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome, {user?.fullName || 'Business Owner'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Legal Metrology weighing & measuring instruments compliance portal.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <Key className="w-4 h-4 text-gov-600" />
              <span>JWT Authentication Active</span>
            </div>
          </div>
        </div>

        {/* SECTION: BUSINESS PROFILE STATUS CALLOUT */}
        <div className="mb-8">
          {businessLoading ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-center space-x-3 text-slate-500 text-sm">
              <div className="w-5 h-5 border-2 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Checking official business registration status...</span>
            </div>
          ) : business ? (
            /* IF BUSINESS PROFILE EXISTS */
            <BusinessProfileCard business={business} showAction={true} />
          ) : (
            /* IF NO BUSINESS PROFILE */
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm mt-0.5">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-950">
                    Complete your business profile to continue.
                  </h3>
                  <p className="text-sm text-amber-800/80 mt-1 max-w-2xl leading-relaxed">
                    You have not registered an official business establishment yet. You must establish your business profile before applying for instrument verification or inspection certificates.
                  </p>
                </div>
              </div>

              <Link
                to="/business-profile/create"
                id="create-business-profile-cta"
                className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 transition-colors shadow-sm self-start md:self-center whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Business Profile
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: INSTRUMENT MANAGEMENT (COMPONENT 3) */}
        <div className="mb-8">
          {business ? (
            /* IF BUSINESS PROFILE EXISTS */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 bg-gov-50 text-gov-700 rounded-xl border border-gov-100 mt-0.5">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Instrument Management</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Manage weighing & measuring instruments registered under your legal metrology establishment.
                    </p>
                  </div>
                </div>

                <Link
                  to="/instruments"
                  id="manage-instruments-cta"
                  className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gov-600 hover:bg-gov-700 transition-colors shadow-sm self-start md:self-center whitespace-nowrap"
                >
                  Manage Instruments
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Instruments
                  </span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">
                    {instrumentStats.loading ? '...' : instrumentStats.total}
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                    Active Instruments
                  </span>
                  <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                    {instrumentStats.loading ? '...' : instrumentStats.active}
                  </span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-100">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                    Inactive Instruments
                  </span>
                  <span className="text-2xl font-bold text-amber-900 mt-1 block">
                    {instrumentStats.loading ? '...' : instrumentStats.inactive}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* IF NO BUSINESS PROFILE */
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-slate-200 text-slate-500 rounded-xl mt-0.5">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-700">
                    Complete your business profile before adding instruments.
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Equipment cannot be registered without an associated legal business entity.
                  </p>
                </div>
              </div>

              <Link
                to="/business-profile/create"
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors self-start md:self-center whitespace-nowrap"
              >
                Go to Business Profile
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          )}
        </div>

        {/* SECTION: VERIFICATION APPLICATIONS (COMPONENT 4) */}
        <div className="mb-8">
          {business ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-start space-x-3.5">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Verification Applications</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Statutory inspection and certification lifecycle applications for your instruments.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-start md:self-center">
                  <Link
                    to="/verification-applications/create"
                    className="inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-semibold text-gov-700 bg-gov-50 hover:bg-gov-100 border border-gov-200 transition-colors shadow-sm whitespace-nowrap"
                  >
                    + New Application
                  </Link>

                  <Link
                    to="/verification-applications"
                    id="manage-applications-cta"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gov-600 hover:bg-gov-700 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Manage Applications
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Total Applications
                  </span>
                  <span className="text-2xl font-bold text-slate-900 mt-1 block">
                    {applicationStats.loading ? '...' : applicationStats.total}
                  </span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-100">
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                    Draft Applications
                  </span>
                  <span className="text-2xl font-bold text-amber-900 mt-1 block">
                    {applicationStats.loading ? '...' : applicationStats.draft}
                  </span>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">
                    Submitted Applications
                  </span>
                  <span className="text-2xl font-bold text-blue-900 mt-1 block">
                    {applicationStats.loading ? '...' : applicationStats.submitted}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 bg-slate-200 text-slate-500 rounded-xl mt-0.5">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-700">
                    Complete your business profile before submitting verification applications.
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Verification requests require a verified legal business profile and registered instruments.
                  </p>
                </div>
              </div>

              <Link
                to="/business-profile/create"
                className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors self-start md:self-center whitespace-nowrap"
              >
                Go to Business Profile
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-gov-700" />
              Account Credentials
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Account ID</span>
                <span className="font-mono text-slate-800">#{user?.id}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                <span className="font-medium text-slate-800">{user?.fullName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                <span className="font-medium text-slate-800">{user?.email}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</span>
                <span className="font-medium text-slate-800">{user?.phoneNumber}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive RBAC Verification */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live RBAC Test Console */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                Live Role-Based Access Control (RBAC) Test
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Verify backend security enforcement in real-time. Test your access against protected backend API routes.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  id="test-bo-endpoint-btn"
                  onClick={() => runTest('Business Owner Endpoint (GET /api/business-owner/test)', authService.testBusinessOwner)}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Test Own Access (Expected: 200 OK)
                </button>

                <button
                  id="test-admin-endpoint-btn"
                  onClick={() => runTest('Admin Endpoint (GET /api/admin/test)', authService.testAdmin)}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition-colors shadow-sm disabled:opacity-50"
                >
                  Test Admin Route (Expected: 403 Forbidden)
                </button>
              </div>

              {testing && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center text-slate-600">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gov-600" />
                  Sending authenticated request with Bearer JWT...
                </div>
              )}

              {testResult && (
                <div
                  className={`p-4 rounded-lg border text-xs font-mono transition-all ${
                    testResult.code === 200
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center font-bold mb-1">
                    {testResult.code === 200 ? (
                      <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                    )}
                    {testResult.test} &rarr; HTTP {testResult.code}
                  </div>
                  <p className="mt-1">{testResult.message}</p>
                </div>
              )}
            </div>

            {/* Component 2 Active Banner */}
            <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-xl border border-dashed border-slate-300 p-6">
              <div className="flex items-start space-x-3">
                <Building2 className="w-6 h-6 text-gov-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Component 2 Active: Business Profile Management
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Official business registration establishes your legal entity on ScaleGuard. Future components will link your registered weighing and measuring instruments directly to this verified business profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
