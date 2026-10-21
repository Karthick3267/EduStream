import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  ExternalLink,
  ShieldCheck,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [institutionFilter, setInstitutionFilter] = useState('All');
  const [scholarshipFilter, setScholarshipFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Sanction Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [decision, setDecision] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchFilters = async () => {
    try {
      const [instRes, schRes] = await Promise.all([
        api.get('/auth/institutions'),
        api.get('/scholarships'),
      ]);
      setInstitutions(instRes.data.institutions || []);
      setScholarships(schRes.data.scholarships || []);
    } catch (err) {
      console.error('Failed to load filter metadata:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/applications', {
        params: {
          status: statusFilter,
          institutionId: institutionFilter,
          scholarshipId: scholarshipFilter,
          search,
        },
      });
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error('Failed to load admin applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, institutionFilter, scholarshipFilter, search]);

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setActionSuccess(null);
    try {
      const res = await api.patch(`/admin/applications/${selectedApp._id}/decision`, {
        decision,
        remarks,
      });
      setActionSuccess(res.data.message);
      setSelectedApp(null);
      setRemarks('');
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Decision submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Central Application Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review institutionally vetted applications and issue administrative sanctions for disbursement
          </p>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate, roll no, app ID..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Institution Approved">Awaiting Sanction (Inst. Approved)</option>
              <option value="Approved">Approved (Queued for DBT)</option>
              <option value="Disbursed">Disbursed (Completed)</option>
              <option value="Submitted">Submitted (At College)</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={institutionFilter}
              onChange={(e) => setInstitutionFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white font-medium text-slate-700 max-w-[180px] truncate"
            >
              <option value="All">All Institutions</option>
              {institutions.map((inst) => (
                <option key={inst._id} value={inst._id}>
                  {inst.code} - {inst.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Master Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading master applications...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No applications match the search/filter parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">App ID & Date</th>
                    <th className="p-4">Candidate & College</th>
                    <th className="p-4">Scholarship Scheme</th>
                    <th className="p-4">Marks / Income</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Sanction Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-slate-900 block">
                          {app.applicationNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {app.studentProfileSnapshot?.name || app.studentId?.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {app.institutionId?.name} ({app.institutionId?.code})
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
                        <div className="font-medium text-blue-700">
                          {app.studentProfileSnapshot?.gpaOrPercentage}%
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Income: ₹{app.studentProfileSnapshot?.familyAnnualIncome?.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-4">
                        <StatusBadge status={app.currentStatus} />
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <Link
                          to={`/applications/${app._id}`}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        {/* Admin Sanction button if in Institution Approved or Under Admin Review */}
                        {['Institution Approved', 'Under Administrative Review'].includes(
                          app.currentStatus
                        ) && (
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setDecision('Approved');
                            }}
                            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Sanction</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Board Sanction Modal */}
        {selectedApp && (
          <Modal
            isOpen={!!selectedApp}
            onClose={() => setSelectedApp(null)}
            title={`Board Sanction: ${selectedApp.applicationNumber}`}
          >
            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1">
                <div>Candidate: <strong>{selectedApp.studentProfileSnapshot?.name}</strong></div>
                <div>College: <strong>{selectedApp.institutionId?.name}</strong></div>
                <div>Scheme: <strong>{selectedApp.scholarshipId?.title}</strong></div>
                <div>Sanction Amount: <strong className="text-emerald-700">₹{(selectedApp.scholarshipId?.amount || 0).toLocaleString()}</strong></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Sanction Decision *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 ${
                      decision === 'Approved'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      value="Approved"
                      checked={decision === 'Approved'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>Grant Final Approval</span>
                  </label>

                  <label
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-2 ${
                      decision === 'Rejected'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adminDecision"
                      value="Rejected"
                      checked={decision === 'Rejected'}
                      onChange={(e) => setDecision(e.target.value)}
                    />
                    <span>Reject Application</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Board Sanction Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Official board remarks (e.g. 'Approved under merit quota for Direct Benefit Transfer')..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Processing...' : 'Confirm Decision'}</span>
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
