import React from 'react';

const statusConfig = {
  Draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
  },
  Submitted: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  'Under Institution Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  'Correction Required': {
    bg: 'bg-orange-50 text-orange-700 border-orange-300',
    dot: 'bg-orange-500',
  },
  'Institution Approved': {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  'Institution Rejected': {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  'Under Administrative Review': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  Approved: {
    bg: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
  },
  Rejected: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
  'Under Disbursement': {
    bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500',
  },
  Disbursed: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
    dot: 'bg-emerald-500 animate-pulse',
  },
  'Payment Failed': {
    bg: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-600',
  },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'lg' ? 'px-3.5 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
