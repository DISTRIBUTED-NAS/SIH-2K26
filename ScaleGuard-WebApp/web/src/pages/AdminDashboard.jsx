import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { authService } from '../services/authService';
import { ShieldCheck, UserCheck, Key, CheckCircle, AlertTriangle, RefreshCw, Lock, Building2, ChevronRight, Scale, FileText, ClipboardCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

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
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-2">
                SCALEGUARD CENTRAL ADMINISTRATION
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                System Administrator Console
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Central security and governance console for Legal Metrology certification.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 font-medium">
              <Key className="w-4 h-4 text-purple-600" />
              <span>Admin JWT Authority Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Profile Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-purple-700" />
              Administrator Credentials
            </h2>

            <div className="space-y-4 text-sm">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin ID</span>
                <span className="font-mono text-slate-800">#{user?.id}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</span>
                <span className="font-medium text-slate-800">{user?.fullName}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Official Email</span>
                <span className="font-medium text-slate-800">{user?.email}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Role</span>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* RBAC Verification & Business Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Component 2: Business Management Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 mt-0.5">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Registered Businesses Directory</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Inspect and govern all business entity profiles, registration numbers, GSTINs, and jurisdiction locations across the platform.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/businesses"
                  id="admin-view-businesses-btn"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  View Directory
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>

            {/* Component 3: Instrument Governance Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-purple-50 text-purple-700 rounded-lg border border-purple-100 mt-0.5">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Statewide Instruments Registry</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Inspect and audit weighing and measuring instruments registered by business establishments across the state.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/instruments"
                  id="admin-view-instruments-btn"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  View Instruments
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>

            {/* Component 4: Statewide Verification Applications Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mt-0.5">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Statewide Verification Applications</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Inspect and audit statutory verification requests, application dockets, and assign enforcement officers.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/verification-applications"
                  id="admin-view-applications-btn"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                >
                  View Applications
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Link>
              </div>
            </div>

            {/* Component 5: Legal Metrology Officers Management Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 mt-0.5">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Officer Management & Assignments</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Provision enforcement officers, manage jurisdictional districts, control active status, and track assigned inspections.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/admin/officers"
                    id="admin-view-officers-btn"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                  >
                    Officer Directory
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Component 6: Statewide Inspection Monitoring Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 mt-0.5">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Statewide Inspection Monitoring</h2>
                    <p className="text-sm text-slate-600 mt-1">
                      Monitor physical inspection schedules, officer field progress, calibration findings, and docket cancellations.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to="/admin/inspections"
                    id="admin-view-inspections-btn"
                    className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                  >
                    Inspection Monitor
                    <ChevronRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Live RBAC Test Console */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-purple-600" />
                Live Role-Based Access Control (RBAC) Test
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Verify backend security rules in real-time. The table below enforces that ADMIN accounts cannot access Business Owner or Officer-specific resources.
              </p>

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  id="test-admin-btn"
                  onClick={() => runTest('Admin Route (GET /api/admin/test)', authService.testAdmin)}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Test Admin Route (Expected: 200 OK)
                </button>

                <button
                  id="test-bo-from-admin-btn"
                  onClick={() => runTest('Business Owner Route (GET /api/business-owner/test)', authService.testBusinessOwner)}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  Test Business Route (Expected: 403 Forbidden)
                </button>

                <button
                  id="test-officer-from-admin-btn"
                  onClick={() => runTest('Officer Route (GET /api/officer/test)', authService.testOfficer)}
                  disabled={testing}
                  className="px-3.5 py-2 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  Test Officer Route (Expected: 403 Forbidden)
                </button>
              </div>

              {/* Test output display */}
              {testing && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center text-slate-600">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-purple-600" />
                  Sending authenticated request with Admin Bearer JWT...
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

            {/* Scope Control Notice */}
            <div className="bg-gradient-to-br from-slate-50 to-purple-50/40 rounded-xl border border-dashed border-purple-200 p-6">
              <div className="flex items-start space-x-3">
                <Lock className="w-6 h-6 text-purple-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Component 1 Scope: Administrative Security Foundation Active
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Seed administrator initialized with BCrypt-hashed credentials. Subsequent components will add Verification Approvals, LMO Officer Field Assignments, and Public Audit Log Management.
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
