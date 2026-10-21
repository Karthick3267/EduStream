import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Award,
  FileText,
  Building,
  ShieldCheck,
  CreditCard,
  Bell,
  CheckSquare,
  Layers,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/profile', label: 'Student Profile', icon: User },
    { to: '/scholarships', label: 'Available Schemes', icon: Award },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const staffLinks = [
    { to: '/institution/dashboard', label: 'Verification Queue', icon: CheckSquare },
    { to: '/scholarships', label: 'Scheme Catalog', icon: Award },
    { to: '/notifications', label: 'Alerts', icon: Bell },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview & KPIs', icon: LayoutDashboard },
    { to: '/admin/applications', label: 'All Applications', icon: Layers },
    { to: '/admin/scholarships', label: 'Manage Schemes', icon: Award },
    { to: '/notifications', label: 'System Alerts', icon: Bell },
  ];

  const financeLinks = [
    { to: '/finance/dashboard', label: 'Disbursement Hub', icon: LayoutDashboard },
    { to: '/finance/disbursements', label: 'Process Payments', icon: CreditCard },
    { to: '/notifications', label: 'Alerts', icon: Bell },
  ];

  let links = [];
  let roleTitle = 'Navigation';

  if (user.role === 'student') {
    links = studentLinks;
    roleTitle = 'Student Portal';
  } else if (user.role === 'institution_staff') {
    links = staffLinks;
    roleTitle = 'College Desk';
  } else if (user.role === 'admin') {
    links = adminLinks;
    roleTitle = 'Administration';
  } else if (user.role === 'finance_officer') {
    links = financeLinks;
    roleTitle = 'Finance & DBT';
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col p-4 shrink-0">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
        {roleTitle}
      </div>
      <nav className="space-y-1 mt-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/student/dashboard' || link.to === '/institution/dashboard' || link.to === '/admin/dashboard' || link.to === '/finance/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Institutional Affiliation Badge if staff/student */}
      {user.institutionId && typeof user.institutionId === 'object' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-4">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            Affiliated Institute
          </div>
          <div className="text-xs font-semibold text-slate-800 mt-1 truncate">
            {user.institutionId.name}
          </div>
          <div className="text-[10px] text-slate-400">
            Code: {user.institutionId.code}
          </div>
        </div>
      )}
    </aside>
  );
}
