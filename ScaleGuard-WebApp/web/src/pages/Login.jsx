import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, Info, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected after registration or session expiration
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setInfoMessage('Registration successful! Please sign in with your credentials.');
    } else if (params.get('session') === 'expired') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim(), password);

      // Role-based redirection
      if (user.role === 'BUSINESS_OWNER') {
        navigate('/dashboard/business-owner');
      } else if (user.role === 'ADMIN') {
        navigate('/dashboard/admin');
      } else if (user.role === 'LMO_OFFICER') {
        navigate('/dashboard/officer');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to connect to the authentication server. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setInfoMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gov-900 shadow-md text-white mb-4">
          <ShieldCheck className="w-10 h-10 text-sky-400" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ScaleGuard Portal
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Legal Metrology Verification & Certification Lifecycle
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-200">
          
          {/* Information banner */}
          {infoMessage && (
            <div className="mb-6 p-4 rounded-lg bg-sky-50 border border-sky-200 flex items-start space-x-3 text-sky-800 text-sm">
              <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Official Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 focus:border-gov-600 sm:text-sm"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-600 focus:border-gov-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gov-700 hover:bg-gov-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gov-600 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-600">
              New business instrument owner?{' '}
              <Link
                to="/register"
                id="link-to-register"
                className="font-semibold text-gov-700 hover:text-gov-800 transition-colors"
              >
                Register your business here
              </Link>
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/80 -mx-4 -mb-8 p-4 sm:rounded-b-xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@scaleguard.com', 'Admin@123')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium text-left truncate"
              >
                🔑 Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('officer@scaleguard.com', 'Officer@123')}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 font-medium text-left truncate"
              >
                📱 LMO Officer
              </button>
            </div>
          </div>

        </div>

        {/* Security badge footer */}
        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
          Protected by 256-bit JWT Encryption & Role-Based Authorization
        </p>
      </div>
    </div>
  );
};
