import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Layers,
  Banknote,
  Users,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  PlusCircle,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/metrics');
        setMetrics(res.data.metrics);
        setRecentAudits(res.data.recentAudits || []);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-200">
              <ShieldCheck className="w-4 h-4" />
              <span>Central Scholarship Board Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Administrator Governance Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1 max-w-xl">
              System-wide oversight of scholarship schemes, inter-college application review queues, financial sanctioning, and audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/scholarships"
              className="px-3.5 py-2 rounded-xl bg-white text-purple-900 font-semibold text-xs hover:bg-purple-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
              <span>Manage Schemes</span>
            </Link>

            <Link
              to="/admin/applications"
              className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sanction Queue</span>
            </Link>
          </div>
        </div>

        {/* High-level KPI Cards */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading system metrics...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Total Applications</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2">
                  {metrics?.totalApplications || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Across all institutions</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Awaiting Board Approval</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-amber-600 mt-2">
                  {metrics?.pendingAdmin || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Cleared by colleges</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Sanctioned Amount</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Banknote className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-indigo-600 mt-2">
                  ₹{(metrics?.totalCommittedAmount || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Approved for DBT</div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Funds Disbursed</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                  ₹{(metrics?.totalDisbursedAmount || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Recorded via UTR</div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{metrics?.activeScholarshipsCount}</div>
                  <div className="text-xs text-slate-500">Active Schemes Published</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{metrics?.institutionsCount}</div>
                  <div className="text-xs text-slate-500">Affiliated Institutions</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">{metrics?.registeredStudentsCount}</div>
                  <div className="text-xs text-slate-500">Registered Students</div>
                </div>
              </div>
            </div>

            {/* Audit Log Activity Stream */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-slate-900">System Activity Audit Log</h3>
                </div>
                <span className="text-xs text-slate-400">Append-only secure governance trail</span>
              </div>

              <div className="divide-y divide-slate-100">
                {recentAudits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No audit records yet.</p>
                ) : (
                  recentAudits.map((log) => (
                    <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-800">{log.action}</span>
                        <span className="text-slate-400 mx-2">&bull;</span>
                        <span className="text-slate-500">
                          {log.resourceType} {log.resourceId ? `(#${log.resourceId.slice(-6)})` : ''}
                        </span>
                        <span className="text-slate-400 mx-2">&bull;</span>
                        <span className="text-slate-600">
                          By: {log.userId?.name || 'System'} ({log.userRole})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()} &bull;{' '}
                        {new Date(log.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
