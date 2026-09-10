import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Unauthorized } from '../pages/Unauthorized';
import { BusinessOwnerDashboard } from '../pages/BusinessOwnerDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { CreateBusinessProfile } from '../pages/business/CreateBusinessProfile';
import { BusinessProfile } from '../pages/business/BusinessProfile';
import { EditBusinessProfile } from '../pages/business/EditBusinessProfile';
import { BusinessList } from '../pages/admin/BusinessList';
import { BusinessDetails } from '../pages/admin/BusinessDetails';
import { InstrumentList } from '../pages/instruments/InstrumentList';
import { CreateInstrument } from '../pages/instruments/CreateInstrument';
import { InstrumentDetails } from '../pages/instruments/InstrumentDetails';
import { EditInstrument } from '../pages/instruments/EditInstrument';
import { AdminInstrumentList } from '../pages/admin/AdminInstrumentList';
import { AdminInstrumentDetails } from '../pages/admin/AdminInstrumentDetails';
import { VerificationApplicationList } from '../pages/verificationApplications/VerificationApplicationList';
import { CreateVerificationApplication } from '../pages/verificationApplications/CreateVerificationApplication';
import { VerificationApplicationDetails } from '../pages/verificationApplications/VerificationApplicationDetails';
import { EditVerificationApplication } from '../pages/verificationApplications/EditVerificationApplication';
import { AdminVerificationApplicationList } from '../pages/admin/AdminVerificationApplicationList';
import { AdminVerificationApplicationDetails } from '../pages/admin/AdminVerificationApplicationDetails';
import { OfficerList } from '../pages/admin/OfficerList';
import { CreateOfficer } from '../pages/admin/CreateOfficer';
import { OfficerDetails } from '../pages/admin/OfficerDetails';
import { EditOfficer } from '../pages/admin/EditOfficer';
import { OfficerDashboard } from '../pages/officer/OfficerDashboard';
import { OfficerProfile } from '../pages/officer/OfficerProfile';
import { AssignedApplications } from '../pages/officer/AssignedApplications';
import { OfficerApplicationDetails } from '../pages/officer/OfficerApplicationDetails';
import { MyInspections } from '../pages/officer/MyInspections';
import { InspectionDetails } from '../pages/officer/InspectionDetails';
import { InspectionList } from '../pages/admin/InspectionList';
import { AdminInspectionDetails } from '../pages/admin/AdminInspectionDetails';
import { MeasurementTesting } from '../pages/officer/MeasurementTesting';
import { MeasurementTestResults } from '../pages/admin/MeasurementTestResults';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Helper component for root index redirection based on auth status and role
const RootRedirect = () => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'BUSINESS_OWNER') {
    return <Navigate to="/dashboard/business-owner" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/dashboard/admin" replace />;
  }

  if (user.role === 'LMO_OFFICER') {
    return <Navigate to="/dashboard/officer" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Business Owner routes */}
      <Route
        path="/dashboard/business-owner"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <BusinessOwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-profile/create"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <CreateBusinessProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-profile"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <BusinessProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-profile/edit"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <EditBusinessProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instruments"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <InstrumentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instruments/create"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <CreateInstrument />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instruments/:id"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <InstrumentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/instruments/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <EditInstrument />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification-applications"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <VerificationApplicationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification-applications/create"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <CreateVerificationApplication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification-applications/:id"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <VerificationApplicationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/verification-applications/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
            <EditVerificationApplication />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin routes */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/businesses"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BusinessList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/businesses/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BusinessDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/instruments"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInstrumentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/instruments/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInstrumentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verification-applications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminVerificationApplicationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verification-applications/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminVerificationApplicationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <OfficerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers/create"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <CreateOfficer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <OfficerDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/officers/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <EditOfficer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspections"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <InspectionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspections/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminInspectionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/inspections/:inspectionId/measurement-tests"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MeasurementTestResults />
          </ProtectedRoute>
        }
      />

      {/* Protected Officer routes */}
      <Route
        path="/dashboard/officer"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/profile"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <OfficerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/applications"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <AssignedApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/applications/:id"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <OfficerApplicationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/inspections"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <MyInspections />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/inspections/:id"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <InspectionDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/inspections/:inspectionId/measurement-tests"
        element={
          <ProtectedRoute allowedRoles={['LMO_OFFICER']}>
            <MeasurementTesting />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
