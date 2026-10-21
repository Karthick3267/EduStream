import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Banknote,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Building,
  FileCheck,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';

export default function FinanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [pendingDisbursements, setPendingDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        const [sumRes, disbRes] = await Promise.all([
          api.get('/disbursements/summary'),
          api.get('/disbursements', { params: { status: 'Pending' } }),
        ]);
        setSummary(sumRes.data.summary);
        setPendingDisbursements(disbRes.data.disbursements || []);
      } catch (err) {
        console.error('Failed to load finance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Treasury Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <DollarSign className="w-4 h-4" />
              <span>Treasury & Disbursement Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Direct Benefit Transfer (DBT) Desk
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              Execute approved scholarship disbursements, generate batch payment advice, record UTR transaction references, and maintain financial audit integrity.
            </p>
          </div>

          <Link
            to="/finance/disbursements"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-xs hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>Process Payment Ledger</span>
          </Link>
        </div>

        {/* Financial KPI Cards */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading treasury figures...</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Funds Disbursed</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                ₹{(summary?.totalPaidOut || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summary?.totalCompleted || 0} Successful Transactions
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Pending Execution</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-amber-600 mt-2">
                ₹{(summary?.totalPendingAmount || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {summary?.totalPending || 0} Batches in queue
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Failed / Rejected</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-rose-600 mt-2">
                {summary?.totalFailed || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Account/IFSC issues</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Total Sanctions</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">
                {summary?.totalRecords || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Sanctioned by Board</div>
            </div>
          </div>
        )}

        {/* Pending Disbursement Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pending Treasury Payment Queue
              </h2>
              <p className="text-xs text-slate-500">
                Applications with administrative clearance ready for bank account DBT execution
              </p>
            </div>

            <Link
              to="/finance/disbursements"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Full Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading queue...</div>
          ) : pendingDisbursements.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No pending disbursements right now. All cleared payments have been recorded!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Candidate & App ID</th>
                    <th className="p-4">Scholarship Scheme</th>
                    <th className="p-4">Approved Amount</th>
                    <th className="p-4">Beneficiary Bank & A/C</th>
                    <th className="p-4">IFSC Code</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDisbursements.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{d.studentId?.name}</div>
                        <div className="text-[11px] font-mono text-blue-600">
                          {d.applicationId?.applicationNumber}
                        </div>
                      </td>

                      <td className="p-4 font-medium text-slate-800">
                        {d.scholarshipId?.title}
                      </td>

                      <td className="p-4 font-bold text-emerald-600 text-sm">
                        ₹{d.amount.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <div className="font-semibold text-slate-800">
                          {d.bankDetailsSnapshot?.bankName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          A/C: {d.bankDetailsSnapshot?.accountNumber}
                        </div>
                      </td>

                      <td className="p-4 font-mono font-semibold text-slate-700">
                        {d.bankDetailsSnapshot?.ifscCode}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to="/finance/disbursements"
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-1"
                        >
                          <span>Process DBT</span>
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
