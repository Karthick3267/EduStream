import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications & Activity Alerts</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time updates regarding your applications, verification milestones, and disbursements
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAsRead('all')}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    notif.isRead ? 'bg-white' : 'bg-blue-50/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{notif.title}</h3>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {notif.link && (
                      <Link
                        to={notif.link}
                        onClick={() => markAsRead(notif._id)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
