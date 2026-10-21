import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  Building2,
  ShieldCheck,
  Banknote,
  Send,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function StatusTimeline({ currentStatus, history = [] }) {
  // Key lifecycle milestones
  const stages = [
    {
      id: 'submitted',
      label: 'Submitted',
      desc: 'Application Submitted',
      icon: Send,
      isCompleted: [
        'Submitted',
        'Under Institution Review',
        'Correction Required',
        'Institution Approved',
        'Under Administrative Review',
        'Approved',
        'Under Disbursement',
        'Disbursed',
      ].includes(currentStatus),
      isActive: currentStatus === 'Submitted',
    },
    {
      id: 'institution',
      label: 'Institution Review',
      desc: 'College Document Verification',
      icon: Building2,
      isCompleted: [
        'Institution Approved',
        'Under Administrative Review',
        'Approved',
        'Under Disbursement',
        'Disbursed',
      ].includes(currentStatus),
      isActive: ['Under Institution Review', 'Correction Required'].includes(currentStatus),
      isFailed: currentStatus === 'Institution Rejected',
    },
    {
      id: 'admin',
      label: 'Board Approval',
      desc: 'State/Central Sanction',
      icon: ShieldCheck,
      isCompleted: ['Approved', 'Under Disbursement', 'Disbursed'].includes(currentStatus),
      isActive: ['Institution Approved', 'Under Administrative Review'].includes(currentStatus),
      isFailed: currentStatus === 'Rejected',
    },
    {
      id: 'disbursement',
      label: 'Disbursement',
      desc: 'Direct Benefit Transfer (DBT)',
      icon: Banknote,
      isCompleted: currentStatus === 'Disbursed',
      isActive: ['Approved', 'Under Disbursement'].includes(currentStatus),
      isFailed: currentStatus === 'Payment Failed',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Application Lifecycle Progress</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent tracking from student submission to bank account credit
          </p>
        </div>
        <StatusBadge status={currentStatus} size="lg" />
      </div>

      {/* Visual Stepper Tracker */}
      <div className="relative">
        <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-slate-200 -z-0"></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            let ringColor = 'border-slate-300 bg-white text-slate-400';
            let badgeText = 'Pending';
            let badgeBg = 'bg-slate-100 text-slate-600';

            if (stage.isCompleted) {
              ringColor = 'border-emerald-500 bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50';
              badgeText = 'Completed';
              badgeBg = 'bg-emerald-100 text-emerald-700';
            } else if (stage.isActive) {
              ringColor = 'border-blue-500 bg-blue-50 text-blue-600 ring-4 ring-blue-50 animate-pulse';
              badgeText = 'In Progress';
              badgeBg = 'bg-blue-100 text-blue-700';
            } else if (stage.isFailed) {
              ringColor = 'border-rose-500 bg-rose-50 text-rose-600 ring-4 ring-rose-50';
              badgeText = 'Rejected / Failed';
              badgeBg = 'bg-rose-100 text-rose-700';
            }

            return (
              <div
                key={stage.id}
                className="flex sm:flex-col items-center sm:items-center sm:text-center gap-3 bg-white p-3 sm:p-2 rounded-lg border sm:border-0 border-slate-100"
              >
                <div
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all ${ringColor}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <div className="text-xs font-semibold text-slate-800">{stage.label}</div>
                  <div className="text-[11px] text-slate-500 hidden sm:block">{stage.desc}</div>
                  <span className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Chronological History Log */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Verification & Transition Audit Trail
        </h4>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400">No transition records recorded yet.</p>
          ) : (
            history.map((step, idx) => (
              <div key={idx} className="relative group">
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-slate-900">{step.status}</span>
                      <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {step.role || 'system'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {step.timestamp ? new Date(step.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                  {step.remarks && (
                    <p className="text-xs text-slate-600 mt-1.5 bg-white p-2 rounded border border-slate-100">
                      &ldquo;{step.remarks}&rdquo;
                    </p>
                  )}
                  {step.changedBy && (
                    <div className="text-[10px] text-slate-400 mt-1">
                      Action logged by: {step.changedBy.name || step.changedBy}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
