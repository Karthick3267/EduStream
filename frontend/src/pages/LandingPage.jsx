import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Banknote,
  ArrowRight,
  CheckCircle2,
  FileText,
  Clock,
  Zap,
  Users,
  Award,
} from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/layout/Navbar';

export default function LandingPage() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const res = await api.get('/scholarships');
        setScholarships(res.data.scholarships || []);
      } catch (err) {
        console.error('Fetch scholarships error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Next-Generation MERN Scholarship Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Paperless Scholarship <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-200 to-teal-300">
                Disbursement Platform
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed">
              Digitizing the entire scholarship lifecycle. From student application and digital document
              verification at colleges to administrative sanction and transparent Direct Benefit Transfer (DBT) tracking.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Apply as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-all"
              >
                Access Stakeholder Portals
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights Banner */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Paperless Submissions</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-white">4-Tier</div>
              <div className="text-xs text-slate-400 mt-0.5">Role-Based Security</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-white">Zero</div>
              <div className="text-xs text-slate-400 mt-0.5">Physical Document Loss</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl font-bold text-white">Transparent</div>
              <div className="text-xs text-slate-400 mt-0.5">UTR & DBT Tracking</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 User Roles Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Integrated Multi-Stakeholder Workflow
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every participant operates within a secured, permission-enforced digital portal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Student */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Students</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Build digital profiles, evaluate eligibility, upload credentials, track real-time progress, and receive notifications.
              </p>
            </div>

            {/* Institution Staff */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">College Staff</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Verify bonafide enrollment, scrutinize student documents, flag defective records, and approve or reject at college level.
              </p>
            </div>

            {/* Administrator */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Scholarship Board</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Manage scholarship schemes, quotas, and criteria. Review multi-college applications and grant final financial sanctions.
              </p>
            </div>

            {/* Finance / Treasury */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Banknote className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Finance & Treasury</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Process disbursement batches, record UTR transaction reference numbers, manage payment dates, and verify credit status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Scholarship Schemes Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Active Scholarship Schemes</h2>
              <p className="text-xs text-slate-500 mt-1">
                Open schemes for the academic year 2026-2027
              </p>
            </div>
            <Link
              to="/scholarships"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Schemes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs">Loading available schemes...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scholarships.slice(0, 3).map((sch) => (
                <div
                  key={sch._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                        {sch.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        ₹{sch.amount.toLocaleString()} / year
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{sch.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {sch.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Provider:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[180px]">{sch.providerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Marks:</span>
                        <span className="font-medium text-slate-800">{sch.minPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Deadline:</span>
                        <span className="font-medium text-slate-800">
                          {new Date(sch.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/register"
                      className="w-full block text-center py-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 text-xs font-semibold transition-colors shadow-sm"
                    >
                      Apply for Scheme
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-800">
            EduStream &bull; Paperless Scholarship Disbursement Platform
          </p>
          <p className="mt-1">
            A comprehensive MERN solution for digital student verification, multi-stage governance, and DBT disbursement audit.
          </p>
        </div>
      </footer>
    </div>
  );
}
