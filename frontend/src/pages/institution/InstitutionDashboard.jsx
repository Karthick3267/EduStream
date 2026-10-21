import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function InstitutionDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/verification/applications', {
        params: { status: statusFilter, search },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load institution applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, search]);

  const pendingCount = applications.filter((a) =>
    ['Submitted', 'Under Institution Review'].includes(a.currentStatus)
  ).length;
  const approvedCount = applications.filter((a) =>
    ['Institution Approved', 'Approved', 'Disbursed'].includes(a.currentStatus)
  ).length;
  const correctionCount = applications.filter(
    (a) => a.currentStatus === 'Correction Required'
  ).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-800 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-100">
              <Building2 className="w-4 h-4" />
              <span>College Verification Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Institutional Verification Portal
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
              Scrutinize student credentials, verify bonafide status, certify supporting documents, and grant institutional clearance.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">{pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting scrutiny</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Defects Flagged</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-orange-600 mt-2">{correctionCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Returned for student re-upload</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Institution Approved</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2">{approvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Cleared for Board sanction</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Assigned</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{applications.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">From your institute</div>
          </div>
        </div>

        {/* Verification Queue & Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Scrutiny Queue</h2>
              <p className="text-xs text-slate-500">
                Filter by review status or search by student name or roll number
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, roll no, app ID..."
                  className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted (New)</option>
                <option value="Under Institution Review">Under Review</option>
                <option value="Correction Required">Correction Required</option>
                <option value="Institution Approved">Institution Approved</option>
                <option value="Institution Rejected">Institution Rejected</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading verification queue...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No applications match the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Applicant & Roll No</th>
                    <th className="p-4">Scholarship Scheme</th>
                    <th className="p-4">Academic Details</th>
                    <th className="p-4">Annual Income</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {app.studentProfileSnapshot?.name || app.studentId?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Roll: {app.studentProfileSnapshot?.admissionNumber || '—'}
                        </div>
                        <div className="text-[10px] text-blue-600 font-mono">
                          {app.applicationNumber}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {app.scholarshipId?.title}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-bold">
                          ₹{(app.scholarshipId?.amount || 0).toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-800">{app.studentProfileSnapshot?.course}</div>
                        <div className="text-[11px] text-slate-500">
                          Score: <strong className="text-slate-700">{app.studentProfileSnapshot?.gpaOrPercentage}%</strong> (Yr {app.studentProfileSnapshot?.yearOfStudy})
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-medium text-slate-800">
                          ₹{app.studentProfileSnapshot?.familyAnnualIncome?.toLocaleString()}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {app.studentProfileSnapshot?.category}
                        </div>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={app.currentStatus} />
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/institution/verify/${app._id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm"
                        >
                          <span>Scrutinize</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
