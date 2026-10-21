import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, Award, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

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

  const filteredApps = applications.filter((app) => {
    if (filter === 'All') return true;
    if (filter === 'Review')
      return ['Submitted', 'Under Institution Review', 'Under Administrative Review'].includes(
        app.currentStatus
      );
    if (filter === 'Approved')
      return ['Institution Approved', 'Approved', 'Under Disbursement'].includes(app.currentStatus);
    if (filter === 'Disbursed') return app.currentStatus === 'Disbursed';
    if (filter === 'Correction') return app.currentStatus === 'Correction Required';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Scholarship Applications</h1>
            <p className="text-xs text-slate-500 mt-1">
              Track multi-stage verification status and disbursement timelines
            </p>
          </div>

          <Link
            to="/scholarships"
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-sm"
          >
            Apply for Another Scheme
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'All', label: 'All Applications' },
            { id: 'Review', label: 'Under Review' },
            { id: 'Correction', label: 'Correction Required' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Disbursed', label: 'Disbursed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading your applications...</div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No applications match this filter</h3>
            <p className="text-xs text-slate-400 mt-1">Select another tab or explore available schemes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-blue-300 transition-colors flex flex-wrap items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-900">
                      {app.scholarshipId?.title || 'Scholarship Scheme'}
                    </span>
                    <StatusBadge status={app.currentStatus} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Application ID: <strong className="text-slate-800">{app.applicationNumber}</strong></span>
                    <span>&bull;</span>
                    <span>Sanction Amount: <strong className="text-emerald-700">₹{(app.scholarshipId?.amount || 0).toLocaleString()}</strong></span>
                    <span>&bull;</span>
                    <span>Submitted On: {new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {app.currentStatus === 'Correction Required' && (
                    <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 mt-2">
                      <strong>Defect Remark:</strong> {app.reviewRemarks?.institutionRemarks || 'Please re-upload required documents.'}
                    </div>
                  )}

                  {app.currentStatus === 'Disbursed' && app.disbursementId && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 mt-2">
                      <strong>DBT Disbursed:</strong> Transaction Reference: <span className="font-mono font-bold">{app.disbursementId.transactionReference}</span>
                    </div>
                  )}
                </div>

                <Link
                  to={`/applications/${app._id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>View Details & Timeline</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
