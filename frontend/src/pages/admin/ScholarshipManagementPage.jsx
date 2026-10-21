import React, { useState, useEffect } from 'react';
import {
  Award,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';

export default function ScholarshipManagementPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    providerName: '',
    academicYear: '2026-2027',
    amount: '',
    maxAnnualIncome: '',
    minPercentage: '',
    deadline: '',
    quota: 100,
    requiredDocsList: 'Previous Marksheet, Family Income Certificate, College Bonafide, Bank Passbook',
  });

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/scholarships');
      setScholarships(res.data.scholarships || []);
    } catch (err) {
      console.error('Failed to load scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
    try {
      await api.patch(`/scholarships/${id}/status`, { status: nextStatus });
      await fetchSchemes();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update scheme status.');
    }
  };

  const handleCreateScheme = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const docTypes = formData.requiredDocsList
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
        .map((docType) => ({ docType, isMandatory: true }));

      await api.post('/scholarships', {
        title: formData.title,
        code: formData.code,
        description: formData.description,
        providerName: formData.providerName,
        academicYear: formData.academicYear,
        amount: Number(formData.amount),
        maxAnnualIncome: Number(formData.maxAnnualIncome) || 0,
        minPercentage: Number(formData.minPercentage) || 0,
        deadline: new Date(formData.deadline),
        quota: Number(formData.quota),
        requiredDocuments: docTypes,
      });

      setSuccess('Scholarship scheme created and published successfully!');
      setIsModalOpen(false);
      setFormData({
        title: '',
        code: '',
        description: '',
        providerName: '',
        academicYear: '2026-2027',
        amount: '',
        maxAnnualIncome: '',
        minPercentage: '',
        deadline: '',
        quota: 100,
        requiredDocsList: 'Previous Marksheet, Family Income Certificate, College Bonafide, Bank Passbook',
      });
      await fetchSchemes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create scheme.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Scholarship Scheme Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure scholarship schemes, define eligibility ceilings, document checklists, and application deadlines
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Scheme</span>
          </button>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Schemes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading schemes...</div>
          ) : scholarships.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No scholarship schemes defined yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Code & Title</th>
                    <th className="p-4">Provider / Sponsor</th>
                    <th className="p-4">Grant Amount</th>
                    <th className="p-4">Eligibility Rules</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scholarships.map((sch) => (
                    <tr key={sch._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                          {sch.code}
                        </span>
                        <div className="font-bold text-slate-900 mt-1">{sch.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{sch.description}</div>
                      </td>

                      <td className="p-4 font-medium text-slate-800">{sch.providerName}</td>

                      <td className="p-4 font-bold text-emerald-600 text-sm">
                        ₹{sch.amount.toLocaleString()}
                      </td>

                      <td className="p-4 space-y-0.5 text-[11px] text-slate-600">
                        <div>Min Marks: <strong>{sch.minPercentage}%</strong></div>
                        <div>
                          Income: <strong>{sch.maxAnnualIncome ? `₹${sch.maxAnnualIncome.toLocaleString()}` : 'None'}</strong>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600 font-medium">
                        {new Date(sch.deadline).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sch.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {sch.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(sch._id, sch.status)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                        >
                          {sch.status === 'Active' ? 'Close Scheme' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Scheme Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Scholarship Scheme"
          maxWidth="max-w-2xl"
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateScheme} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Merit-cum-Means Scholarship 2026"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheme Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MCM-2026"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide scope, beneficiaries, and purpose of the scholarship..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sponsoring Provider *</label>
                <input
                  type="text"
                  required
                  value={formData.providerName}
                  onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                  placeholder="e.g. Ministry of Education"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scholarship Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Income Ceiling (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxAnnualIncome}
                  onChange={(e) => setFormData({ ...formData, maxAnnualIncome: e.target.value })}
                  placeholder="0 for no ceiling (e.g. 300000)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Marks %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.minPercentage}
                  onChange={(e) => setFormData({ ...formData, minPercentage: e.target.value })}
                  placeholder="e.g. 75"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Deadline *</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Beneficiary Quota</label>
                <input
                  type="number"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Documents Checklist (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.requiredDocsList}
                  onChange={(e) => setFormData({ ...formData, requiredDocsList: e.target.value })}
                  placeholder="Marksheet, Income Certificate, Bonafide..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold shadow-md disabled:opacity-50"
              >
                {submitting ? 'Creating Scheme...' : 'Publish Scheme'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
