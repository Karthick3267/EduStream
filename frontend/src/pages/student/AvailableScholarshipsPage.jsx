import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  DollarSign,
  FileCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function AvailableScholarshipsPage() {
  const { user, studentProfile } = useAuth();
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scholarships', {
          params: { search, category: categoryFilter },
        });
        setScholarships(res.data.scholarships || []);
      } catch (err) {
        console.error('Failed to load scholarships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [search, categoryFilter]);

  // Evaluates eligibility of student profile against scholarship criteria
  const checkEligibility = (sch) => {
    if (!studentProfile || !studentProfile.isProfileComplete) {
      return { eligible: false, reasons: ['Complete your profile first to check eligibility.'] };
    }

    const reasons = [];

    // Check Marks
    if (sch.minPercentage && studentProfile.gpaOrPercentage < sch.minPercentage) {
      reasons.push(`Requires minimum ${sch.minPercentage}% marks (Yours: ${studentProfile.gpaOrPercentage}%)`);
    }

    // Check Annual Income
    if (sch.maxAnnualIncome && studentProfile.familyAnnualIncome > sch.maxAnnualIncome) {
      reasons.push(
        `Income limit is ₹${sch.maxAnnualIncome.toLocaleString()} (Yours: ₹${studentProfile.familyAnnualIncome.toLocaleString()})`
      );
    }

    // Check Gender
    if (
      sch.eligibleGenders &&
      !sch.eligibleGenders.includes('All') &&
      !sch.eligibleGenders.includes(studentProfile.gender)
    ) {
      reasons.push(`Reserved for ${sch.eligibleGenders.join('/')} applicants`);
    }

    // Check Category
    if (
      sch.eligibleCategories &&
      sch.eligibleCategories.length > 0 &&
      !sch.eligibleCategories.includes(studentProfile.category)
    ) {
      reasons.push(`Reserved for ${sch.eligibleCategories.join(', ')} categories`);
    }

    return {
      eligible: reasons.length === 0,
      reasons,
    };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Available Scholarship Schemes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse active state, central, and institutional scholarship schemes and evaluate your eligibility
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scheme by title, code, or sponsor..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
              <option value="Minority">Minority</option>
            </select>
          </div>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading scholarships...</div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No scholarships found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting search keywords or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((sch) => {
              const elig = user?.role === 'student' ? checkEligibility(sch) : null;

              return (
                <div
                  key={sch._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                        {sch.code}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-600">
                        ₹{sch.amount.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sch.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {sch.description}
                    </p>

                    {/* Criteria Checklist */}
                    <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Provider:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[170px]">{sch.providerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Percentage:</span>
                        <span className="font-semibold text-slate-800">{sch.minPercentage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Income Limit:</span>
                        <span className="font-semibold text-slate-800">
                          {sch.maxAnnualIncome ? `₹${sch.maxAnnualIncome.toLocaleString()}` : 'No ceiling'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Application Closes:</span>
                        <span className="font-semibold text-rose-600">
                          {new Date(sch.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Banner for Students */}
                    {user?.role === 'student' && (
                      <div
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                          elig?.eligible
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {elig?.eligible ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        )}
                        <div className="text-[11px]">
                          <strong className="block font-semibold">
                            {elig?.eligible ? 'You meet the eligibility criteria' : 'Eligibility Notice'}
                          </strong>
                          {!elig?.eligible && (
                            <span className="text-[10px] text-amber-700 block mt-0.5">
                              {elig?.reasons[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    {user?.role === 'student' ? (
                      <Link
                        to={`/student/apply/${sch._id}`}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-blue-500/20"
                      >
                        <span>Apply for Scholarship</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <div className="text-center text-[11px] text-slate-400 font-medium">
                        Scheme Active &bull; Quota: {sch.quota}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
