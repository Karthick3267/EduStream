import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Send,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';

export default function DisbursementManagementPage() {
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Payment Execution Modal
  const [selectedDisbursement, setSelectedDisbursement] = useState(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMode, setPaymentMode] = useState('Direct Benefit Transfer (DBT)');
  const [paymentStatus, setPaymentStatus] = useState('Completed');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchDisbursements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/disbursements', {
        params: { status: statusFilter, search },
      });
      setDisbursements(res.data.disbursements || []);
    } catch (err) {
      console.error('Failed to load disbursements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisbursements();
  }, [statusFilter, search]);

  const handleOpenProcessModal = (d) => {
    setSelectedDisbursement(d);
    setTransactionRef(d.transactionReference || '');
    setPaymentStatus(d.disbursementStatus === 'Failed' ? 'Completed' : 'Completed');
    setRemarks(d.remarks || '');
  };

  const handleGenerateMockUTR = () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(100000 + Math.random() * 900000);
    setTransactionRef(`UTR${today}${random}`);
  };

  const handleSubmitDisbursement = async (e) => {
    e.preventDefault();
    if (!selectedDisbursement) return;

    if (paymentStatus === 'Completed' && !transactionRef) {
      alert('Please enter or generate a Transaction Reference (UTR) number.');
      return;
    }

    setSubmitting(true);
    setActionSuccess(null);
    try {
      const res = await api.post('/disbursements/process', {
        applicationId: selectedDisbursement.applicationId?._id || selectedDisbursement.applicationId,
        transactionReference: transactionRef,
        paymentDate,
        paymentMode,
        status: paymentStatus,
        remarks,
      });

      setActionSuccess(res.data.message);
      setSelectedDisbursement(null);
      await fetchDisbursements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process disbursement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Direct Benefit Transfer (DBT) Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized disbursement batches, record UTR references, and confirm treasury credit
          </p>
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by UTR reference, candidate, or account number..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="All">All Disbursement States</option>
              <option value="Pending">Pending Processing</option>
              <option value="Completed">Completed (Disbursed)</option>
              <option value="Failed">Failed / Defective A/C</option>
            </select>
          </div>
        </div>

        {/* Disbursement Ledger Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading disbursement ledger...</div>
          ) : disbursements.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">App ID & Candidate</th>
                    <th className="p-4">Scholarship Scheme</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Beneficiary Bank & A/C</th>
                    <th className="p-4">UTR Reference</th>
                    <th className="p-4">Payment Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disbursements.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-blue-700 block">
                          {d.applicationId?.applicationNumber}
                        </span>
                        <div className="font-semibold text-slate-900 mt-0.5">
                          {d.studentId?.name}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{d.scholarshipId?.title}</div>
                        <div className="text-[11px] text-slate-400">{d.scholarshipId?.providerName}</div>
                      </td>

                      <td className="p-4 font-bold text-emerald-600 text-sm">
                        ₹{d.amount.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {d.bankDetailsSnapshot?.bankName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          A/C: {d.bankDetailsSnapshot?.accountNumber}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IFSC: {d.bankDetailsSnapshot?.ifscCode}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-700">
                        {d.transactionReference ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {d.transactionReference}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Not Yet Generated</span>
                        )}
                        {d.paymentDate && (
                          <div className="text-[10px] text-slate-400 font-sans mt-1">
                            Paid: {new Date(d.paymentDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            d.disbursementStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d.disbursementStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              d.disbursementStatus === 'Completed'
                                ? 'bg-emerald-500'
                                : d.disbursementStatus === 'Pending'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span>{d.disbursementStatus}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenProcessModal(d)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{d.disbursementStatus === 'Completed' ? 'Update UTR' : 'Disburse Funds'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Process Payment Modal */}
        {selectedDisbursement && (
          <Modal
            isOpen={!!selectedDisbursement}
            onClose={() => setSelectedDisbursement(null)}
            title="Record Direct Benefit Transfer (DBT) Payment"
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleSubmitDisbursement} className="space-y-4">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate:</span>
                  <span className="font-bold text-slate-900">{selectedDisbursement.studentId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Application Number:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {selectedDisbursement.applicationId?.applicationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sanctioned Amount:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">
                    ₹{selectedDisbursement.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-100">
                  <span className="text-slate-500">Beneficiary Account:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDisbursement.bankDetailsSnapshot?.bankName} (A/C: {selectedDisbursement.bankDetailsSnapshot?.accountNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedDisbursement.bankDetailsSnapshot?.ifscCode}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Transaction Reference (UTR Number) *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateMockUTR}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generate UTR Ref</span>
                  </button>
                </div>
                <input
                  type="text"
                  required={paymentStatus === 'Completed'}
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. UTR2026091800492"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white font-medium text-slate-700"
                  >
                    <option value="Direct Benefit Transfer (DBT)">Direct Benefit Transfer (DBT)</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="PFMS Direct Credit">PFMS Direct Credit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status *</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-2.5 rounded-xl border-2 cursor-pointer flex items-center gap-2 ${
                      paymentStatus === 'Completed'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disbStatus"
                      value="Completed"
                      checked={paymentStatus === 'Completed'}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    />
                    <span className="text-xs">Mark Completed (Disbursed)</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border-2 cursor-pointer flex items-center gap-2 ${
                      paymentStatus === 'Failed'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="disbStatus"
                      value="Failed"
                      checked={paymentStatus === 'Failed'}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    />
                    <span className="text-xs">Mark Failed (Invalid A/C)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Treasury Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Cleared via treasury gateway; bank confirmation received..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDisbursement(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Recording...' : 'Confirm DBT Credit'}</span>
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
