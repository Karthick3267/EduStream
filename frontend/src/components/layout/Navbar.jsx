import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Bell,
  LogOut,
  User,
  Shield,
  Building,
  DollarSign,
  ChevronDown,
  Sparkles,
  BookOpen,
  Bot,
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function Navbar() {
  const { user, logout, quickLogin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (roleKey) => {
    setShowDemoMenu(false);
    await quickLogin(roleKey);
    // Navigate to appropriate home based on role
    if (roleKey === 'student' || roleKey === 'student2') navigate('/student/dashboard');
    else if (roleKey === 'institution_staff') navigate('/institution/dashboard');
    else if (roleKey === 'admin') navigate('/admin/dashboard');
    else if (roleKey === 'finance_officer') navigate('/finance/dashboard');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'student':
        return { label: 'Student Portal', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'institution_staff':
        return { label: 'Institution Staff', color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'admin':
        return { label: 'Administrator', color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'finance_officer':
        return { label: 'Finance / Treasury', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'User', color: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to={
                !user
                  ? '/'
                  : user.role === 'student'
                  ? '/student/dashboard'
                  : user.role === 'institution_staff'
                  ? '/institution/dashboard'
                  : user.role === 'admin'
                  ? '/admin/dashboard'
                  : '/finance/dashboard'
              }
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                  EduStream
                </span>
                <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase block">
                  Paperless Scholarships
                </span>
              </div>
            </Link>

            {/* Current Role Pill */}
            {user && (
              <span
                className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ml-3 ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            )}

            {/* Quick Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-3">
              <Link
                to="/scholarships"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Schemes
              </Link>
              <Link
                to="/knowledge"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Knowledge Base</span>
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-ai-advisor'))}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI Advisor</span>
              </button>
            </nav>
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher (Crucial for Evaluation & Demoing) */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                title="Switch between roles for demonstration"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Switch Role</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      1-Click Demo Personas
                    </p>
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-slate-800">Student (Rahul Sharma)</div>
                      <div className="text-[10px] text-slate-400">Undergrad applicant</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('institution_staff')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 flex items-center gap-2.5"
                  >
                    <Building className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-medium text-slate-800">Institution Staff (Apex)</div>
                      <div className="text-[10px] text-slate-400">Verifies college documents</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-purple-50 flex items-center gap-2.5"
                  >
                    <Shield className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-slate-800">Scholarship Administrator</div>
                      <div className="text-[10px] text-slate-400">Sanctions & manages schemes</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('finance_officer')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 flex items-center gap-2.5"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-medium text-slate-800">Finance Officer (Treasury)</div>
                      <div className="text-[10px] text-slate-400">DBT disbursement & UTR records</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Account / Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-semibold">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'student' && (
                      <Link
                        to="/student/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        My Profile & Bank Details
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 border-t border-slate-100 text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors"
                >
                  Student Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
