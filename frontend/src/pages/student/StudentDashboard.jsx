import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  Banknote,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function StudentDashboard() {
  const { user, studentProfile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications/my');
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const totalApps = applications.length;
  const underReviewApps = applications.filter((a) =>
    ['Submitted', 'Under Institution Review', 'Under Administrative Review', 'Correction Required'].includes(
      a.currentStatus
    )
  ).length;
  const approvedApps = applications.filter((a) =>
    ['Institution Approved', 'Approved', 'Under Disbursement'].includes(a.currentStatus)
  ).length;
  const disbursedApps = applications.filter((a) => a.currentStatus === 'Disbursed');
  const totalDisbursedAmount = disbursedApps.reduce(
    (sum, a) => sum + (a.disbursementId?.amount || a.scholarshipId?.amount || 0),
    0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Track your scholarship applications, review verification remarks from your college, and monitor DBT fund disbursements.
            </p>
          </div>

          <Link
            to="/scholarships"
            className="px-4 py-2.5 rounded-xl bg-white text-blue-800 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            <Award className="w-4 h-4 text-blue-700" />
            <span>Apply for Scholarships</span>
          </Link>
        </div>

        {/* Profile Incomplete Warning Banner */}
        {studentProfile && !studentProfile.isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900">
                  Student Profile Incomplete
                </h3>
                <p className="text-[11px] text-amber-700">
                  Please complete your academic record and bank account details (IFSC, Account Number) before submitting scholarship applications.
                </p>
              </div>
            </div>
            <Link
              to="/student/profile"
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-sm"
            >
              Complete Profile
            </Link>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Applications</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{totalApps}</div>
            <div className="text-[11px] text-slate-400 mt-1">Submitted till date</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Under Review</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{underReviewApps}</div>
            <div className="text-[11px] text-slate-400 mt-1">At College / Board Stage</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Approved</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{approvedApps}</div>
            <div className="text-[11px] text-slate-400 mt-1">Sanctioned for DBT</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Disbursed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-2">
              ₹{totalDisbursedAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Credited directly to bank
            </div>
          </div>
        </div>

        {/* Recent Applications Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Your Scholarship Applications</h2>
              <p className="text-xs text-slate-500">Current status and verification feedback</p>
            </div>
            <Link
              to="/student/applications"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No applications submitted yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Explore available government and institutional scholarships and submit your digital application.
              </p>
              <Link
                to="/scholarships"
                className="mt-4 inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Browse Open Schemes
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="p-5 hover:bg-slate-50/80 transition-colors flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {app.scholarshipId?.title || 'Scholarship Scheme'}
                      </span>
                      <StatusBadge status={app.currentStatus} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>App ID: <strong className="text-slate-700">{app.applicationNumber}</strong></span>
                      <span>&bull;</span>
                      <span>Amount: <strong className="text-emerald-700 font-semibold">₹{(app.scholarshipId?.amount || 0).toLocaleString()}</strong></span>
                      <span>&bull;</span>
                      <span>Submitted: {new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Show Defect / Correction warning if any */}
                    {app.currentStatus === 'Correction Required' && (
                      <div className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 mt-2 inline-block">
                        <strong>Correction Required:</strong> {app.reviewRemarks?.institutionRemarks || 'Please re-upload required documents.'}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/applications/${app._id}`}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <span>View Timeline</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
