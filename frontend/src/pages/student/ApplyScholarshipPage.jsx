import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  Building,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function ApplyScholarshipPage() {
  const { id } = useParams();
  const { user, studentProfile } = useAuth();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({}); // { [docType]: File }

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const res = await api.get(`/scholarships/${id}`);
        setScholarship(res.data.scholarship);
      } catch (err) {
        setError('Failed to load scholarship scheme.');
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
  }, [id]);

  const handleFileSelect = (docType, file) => {
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`File "${file.name}" exceeds maximum allowed size of 5MB.`);
      return;
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [docType]: file,
    }));
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError(null);

    if (!studentProfile || !studentProfile.isProfileComplete) {
      setError('Please complete your student profile and bank details before applying.');
      return;
    }

    // Check mandatory documents
    const missingDocs = (scholarship?.requiredDocuments || [])
      .filter((d) => d.isMandatory && !uploadedFiles[d.docType])
      .map((d) => d.docType);

    if (missingDocs.length > 0) {
      setError(`Please upload all mandatory documents: ${missingDocs.join(', ')}`);
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit application draft/record
      const appRes = await api.post('/applications', {
        scholarshipId: scholarship._id,
      });

      const newApplication = appRes.data.application;

      // 2. Upload each selected document
      for (const [docType, file] of Object.entries(uploadedFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('docType', docType);

        await api.post(`/applications/${newApplication._id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      navigate(`/applications/${newApplication._id}`, {
        state: { message: 'Application submitted successfully with verified digital documents!' },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit scholarship application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400">Loading application form...</div>
      </DashboardLayout>
    );
  }

  if (!scholarship) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-slate-500">Scholarship scheme not found.</p>
          <Link to="/scholarships" className="mt-3 inline-block text-xs font-semibold text-blue-600">
            Back to Available Schemes
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to="/scholarships"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Schemes</span>
        </Link>

        {/* Header Scheme Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                {scholarship.code}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">{scholarship.title}</h1>
              <p className="text-xs text-slate-500 mt-1">{scholarship.providerName}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-extrabold text-emerald-600">
                ₹{scholarship.amount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">Direct Benefit Transfer</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitApplication} className="space-y-6">
          {/* Section: Applicant Digital Profile Snapshot Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Student Profile Snapshot</h2>
              </div>
              <Link
                to="/student/profile"
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Edit Profile
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800">{user?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Roll / Admission No.</span>
                <span className="font-semibold text-slate-800">{studentProfile?.admissionNumber || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Enrolled Course</span>
                <span className="font-semibold text-slate-800">{studentProfile?.course || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Marks / Percentage</span>
                <span className="font-semibold text-slate-800">{studentProfile?.gpaOrPercentage}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Family Annual Income</span>
                <span className="font-semibold text-slate-800">₹{studentProfile?.familyAnnualIncome?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-800">{studentProfile?.category}</span>
              </div>
            </div>

            {/* DBT Bank Snapshot */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-semibold text-slate-800">
                    {studentProfile?.bankDetails?.bankName} (A/C: ...{studentProfile?.bankDetails?.accountNumber?.slice(-4) || '—'})
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    IFSC: {studentProfile?.bankDetails?.ifscCode} &bull; Holder: {studentProfile?.bankDetails?.accountHolderName}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Active DBT Account
              </span>
            </div>
          </div>

          {/* Section: Required Supporting Document Uploads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-sm font-bold text-slate-900">Upload Supporting Documents</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload clear PDF or image copies (Max 5MB each). Institution staff will digitally verify these documents.
              </p>
            </div>

            <div className="space-y-4">
              {(scholarship.requiredDocuments || []).map((docReq, idx) => {
                const currentFile = uploadedFiles[docReq.docType];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{docReq.docType}</span>
                        {docReq.isMandatory && (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            Required *
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {docReq.description || 'Valid issued document copy'}
                      </p>

                      {currentFile && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{currentFile.name} ({(currentFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>{currentFile ? 'Replace File' : 'Select File'}</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(docReq.docType, e.target.files[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-400">
              By submitting, you certify that all uploaded documents and declared credentials are authentic.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
            >
              <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
