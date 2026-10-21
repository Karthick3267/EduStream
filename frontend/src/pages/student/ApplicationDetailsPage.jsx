import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  CreditCard,
  Building2,
  Printer,
  ExternalLink,
  ArrowLeft,
  Banknote,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';

export default function ApplicationDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Correction re-upload state
  const [correctionFiles, setCorrectionFiles] = useState({});
  const [reuploading, setReuploading] = useState(false);
  const [reuploadSuccess, setReuploadSuccess] = useState(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      setApplication(res.data.application);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleCorrectionUpload = async (docType) => {
    const file = correctionFiles[docType];
    if (!file) return;

    setReuploading(true);
    setReuploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', docType);

      const res = await api.post(`/applications/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReuploadSuccess(res.data.message);
      // Clean selected file
      setCorrectionFiles((prev) => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
      // Refresh application data
      await fetchApplication();
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setReuploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400">Loading application details...</div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-rose-600">{error || 'Application not found.'}</p>
          <Link
            to={user?.role === 'student' ? '/student/applications' : '/institution/dashboard'}
            className="mt-3 inline-block text-xs font-semibold text-blue-600"
          >
            Go Back
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user?.role === 'student';
  const isCorrection = application.currentStatus === 'Correction Required';
  const isDisbursed = application.currentStatus === 'Disbursed';
  const disb = application.disbursementId;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 print:p-0">
        {/* Navigation & Print Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to={
              isStudent
                ? '/student/applications'
                : user?.role === 'institution_staff'
                ? '/institution/dashboard'
                : user?.role === 'admin'
                ? '/admin/applications'
                : '/finance/disbursements'
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Applications</span>
          </Link>

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Application Receipt</span>
          </button>
        </div>

        {/* Application Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {application.applicationNumber}
                </span>
                <StatusBadge status={application.currentStatus} size="lg" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                {application.scholarshipId?.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Sponsor: <strong className="text-slate-700">{application.scholarshipId?.providerName}</strong></span>
                <span>&bull;</span>
                <span>College: <strong className="text-slate-700">{application.institutionId?.name}</strong></span>
                <span>&bull;</span>
                <span>Submitted: {new Date(application.submittedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-extrabold text-emerald-600">
                ₹{(application.scholarshipId?.amount || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">Approved DBT Grant</span>
            </div>
          </div>
        </div>

        {/* Disbursement Receipt (If Disbursed) */}
        {isDisbursed && disb && (
          <div className="bg-gradient-to-tr from-emerald-500/10 via-teal-500/10 to-emerald-500/5 rounded-2xl border-2 border-emerald-500/30 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-950">
                  Official Direct Benefit Transfer (DBT) Receipt
                </h3>
                <p className="text-xs text-emerald-700">
                  Scholarship grant successfully credited to student bank account
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/80 border border-emerald-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">UTR / Ref Number</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {disb.transactionReference || 'UTR-RECORDED'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Payment Date</span>
                <span className="font-semibold text-slate-800">
                  {disb.paymentDate ? new Date(disb.paymentDate).toLocaleDateString() : 'Confirmed'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Disbursement Mode</span>
                <span className="font-semibold text-slate-800">{disb.paymentMode || 'DBT'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Credited To</span>
                <span className="font-semibold text-slate-800">
                  {disb.bankDetailsSnapshot?.bankName} (A/C: ...{disb.bankDetailsSnapshot?.accountNumber?.slice(-4)})
                </span>
              </div>
            </div>

            {disb.remarks && (
              <p className="text-xs text-emerald-800 mt-3 italic">
                Remark from Finance Desk: &ldquo;{disb.remarks}&rdquo;
              </p>
            )}
          </div>
        )}

        {/* Status Stepper & Audit Log Timeline */}
        <StatusTimeline
          currentStatus={application.currentStatus}
          history={application.statusHistory}
        />

        {/* Student Profile Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4">
            Candidate Academic & Bank Snapshot
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Candidate Name</span>
              <span className="font-semibold text-slate-800">{application.studentProfileSnapshot?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Roll / Admission No.</span>
              <span className="font-semibold text-slate-800">{application.studentProfileSnapshot?.admissionNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Degree & Year</span>
              <span className="font-semibold text-slate-800">
                {application.studentProfileSnapshot?.course} (Yr {application.studentProfileSnapshot?.yearOfStudy})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Percentage / CGPA</span>
              <span className="font-semibold text-slate-800">{application.studentProfileSnapshot?.gpaOrPercentage}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Family Annual Income</span>
              <span className="font-semibold text-slate-800">
                ₹{application.studentProfileSnapshot?.familyAnnualIncome?.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Social Category</span>
              <span className="font-semibold text-slate-800">{application.studentProfileSnapshot?.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank & IFSC</span>
              <span className="font-semibold text-slate-800">
                {application.studentProfileSnapshot?.bankDetails?.bankName} ({application.studentProfileSnapshot?.bankDetails?.ifscCode})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Bank A/C Number</span>
              <span className="font-semibold text-slate-800">
                {application.studentProfileSnapshot?.bankDetails?.accountNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Document Repository & Re-upload Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Submitted Documents</h3>
              <p className="text-xs text-slate-500">
                Digital documents certified by student and scrutinized by college verifier
              </p>
            </div>
          </div>

          {reuploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{reuploadSuccess}</span>
            </div>
          )}

          <div className="divide-y divide-slate-100">
            {application.documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No documents uploaded.</div>
            ) : (
              application.documents.map((doc) => {
                const isDocDefective = doc.status === 'Defective';
                const token = localStorage.getItem('scholarship_token');

                return (
                  <div
                    key={doc._id}
                    className={`py-4 flex flex-wrap items-center justify-between gap-4 ${
                      isDocDefective ? 'bg-amber-50/50 p-4 rounded-xl my-2 border border-amber-200' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">{doc.docType}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            doc.status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.status === 'Defective'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{doc.originalName}</span>
                        <span>&bull;</span>
                        <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                        <span>&bull;</span>
                        <span>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>

                      {doc.verificationRemarks && (
                        <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 mt-1.5 inline-block">
                          <strong>Verification Feedback:</strong> &ldquo;{doc.verificationRemarks}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Secure View/Download Button */}
                      <a
                        href={`/api/documents/${application._id}/${doc._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Document</span>
                      </a>

                      {/* If student and status is Correction Required and document is defective */}
                      {isStudent && (isDocDefective || isCorrection) && (
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition-colors flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            <span>
                              {correctionFiles[doc.docType]
                                ? correctionFiles[doc.docType].name.slice(0, 15) + '...'
                                : 'Select Corrected'}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                setCorrectionFiles((prev) => ({
                                  ...prev,
                                  [doc.docType]: e.target.files[0],
                                }))
                              }
                              className="hidden"
                            />
                          </label>

                          {correctionFiles[doc.docType] && (
                            <button
                              type="button"
                              onClick={() => handleCorrectionUpload(doc.docType)}
                              disabled={reuploading}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
                            >
                              {reuploading ? 'Uploading...' : 'Re-submit'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
