import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Building,
  DollarSign,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (role) => {
    switch (role) {
      case 'student':
        navigate('/student/dashboard');
        break;
      case 'institution_staff':
        navigate('/institution/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'finance_officer':
        navigate('/finance/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      redirectByRole(result.user.role);
    } else {
      setFormError(result.message);
    }
  };

  const handleDemoLogin = async (roleKey) => {
    setSubmitting(true);
    setFormError('');
    const result = await quickLogin(roleKey);
    setSubmitting(false);
    if (result.success) {
      redirectByRole(result.user.role);
    } else {
      setFormError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <GraduationCap className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to EduStream
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Paperless Scholarship Disbursement Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200">
          {formError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.edu"
                  required
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-10 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-2.5 px-4 border border-transparent rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-60"
            >
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick 1-Click Demo Login Personas */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>1-Click Demo Logins (All 4 Roles):</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-left transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-blue-900">Student</div>
                  <div className="text-[9px] text-blue-700 truncate">Rahul Sharma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('institution_staff')}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-left transition-colors flex items-center gap-2"
              >
                <Building className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-amber-900">College Staff</div>
                  <div className="text-[9px] text-amber-700 truncate">Prof. Anita (Apex)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-left transition-colors flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-purple-900">Administrator</div>
                  <div className="text-[9px] text-purple-700 truncate">Dr. Rajesh Verma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('finance_officer')}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-left transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-bold text-emerald-900">Finance Officer</div>
                  <div className="text-[9px] text-emerald-700 truncate">Suresh Menon</div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
