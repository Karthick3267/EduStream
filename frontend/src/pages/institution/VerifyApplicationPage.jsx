import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  ArrowLeft,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  Send,
} from 'lucide-react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';

export default function VerifyApplicationPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document verification modal/state
  const [docRemarks, setDocRemarks] = useState({});
  const [updatingDocId, setUpdatingDocId] = useState(null);

  // Institutional Decision state
  const [decision, setDecision] = useState('');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      setApplication(res.data.application);
      // Pre-fill existing doc remarks
      const remarksMap = {};
      (res.data.application.documents || []).forEach((d) => {
        remarksMap[d._id] = d.verificationRemarks || '';
      });
      setDocRemarks(remarksMap);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load application.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleVerifyDocument = async (docId, status) => {
    setUpdatingDocId(docId);
    try {
      const remarks = docRemarks[docId] || '';
      await api.patch(`/verification/applications/${id}/verify-document`, {
        docId,
        status,
        remarks,
      });
      await fetchApplication();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update document status.');
    } finally {
      setUpdatingDocId(null);
    }
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!decision) {
      alert('Please select an institutional decision.');
      return;
    }

    if ((decision === 'Correction Required' || decision === 'Institution Rejected') && !decisionRemarks) {
      alert('Remarks are required for Correction Required or Rejection.');
      return;
    }

    setSubmittingDecision(true);
    setActionSuccess(null);
    try {
      const res = await api.patch(`/verification/applications/${id}/decision`, {
        decision,
        remarks: decisionRemarks,
      });
      setActionSuccess(res.data.message);
      await fetchApplication();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record decision.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400">Loading application details for scrutiny...</div>
      </DashboardLayout>
    );
  }

  if (error || !application) {
    return (
      <DashboardLayout>
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <p className="text-xs text-rose-600">{error || 'Application not found.'}</p>
          <Link to="/institution/dashboard" className="mt-3 inline-block text-xs font-semibold text-amber-600">
            Back to Queue
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const allDocsVerified =
    application.documents.length > 0 &&
    application.documents.every((d) => d.status === 'Verified');

  const hasDefectiveDocs = application.documents.some((d) => d.status === 'Defective');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/institution/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Verification Queue</span>
          </Link>
          <StatusBadge status={application.currentStatus} size="lg" />
        </div>

        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Applicant Overview Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                {application.applicationNumber}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">
                Candidate: {application.studentProfileSnapshot?.name || application.studentId?.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Roll No: <strong className="text-slate-800">{application.studentProfileSnapshot?.admissionNumber}</strong> &bull; Scheme: <strong className="text-blue-700">{application.scholarshipId?.title}</strong>
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-extrabold text-emerald-600">
                ₹{(application.scholarshipId?.amount || 0).toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400">Scheme Grant Value</span>
            </div>
          </div>
        </div>

        {/* Academic & Bonafide Credentials Verification Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Student Bonafide Credentials Check
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Enrolled Course</span>
              <span className="font-bold text-slate-800">{application.studentProfileSnapshot?.course}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Year & Semester</span>
              <span className="font-bold text-slate-800">
                Year {application.studentProfileSnapshot?.yearOfStudy} (Sem {application.studentProfileSnapshot?.currentSemester || 1})
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Marks Score</span>
              <span className="font-bold text-blue-700">{application.studentProfileSnapshot?.gpaOrPercentage}%</span>
              <span className="text-[10px] text-slate-400 block">
                (Scheme Min: {application.scholarshipId?.minPercentage}%)
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Family Annual Income</span>
              <span className="font-bold text-slate-800">
                ₹{application.studentProfileSnapshot?.familyAnnualIncome?.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block">
                (Max Allowed: ₹{(application.scholarshipId?.maxAnnualIncome || 0).toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        {/* Supporting Document Scrutiny & Verification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Document Scrutiny Desk</h2>
              <p className="text-xs text-slate-500">
                Verify each uploaded document. Mark as Verified or Defective with specific comments.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {application.documents.filter((d) => d.status === 'Verified').length} of{' '}
              {application.documents.length} Verified
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {application.documents.map((doc) => (
              <div key={doc._id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
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
                      <div className="text-[11px] text-slate-500">
                        {doc.originalName} &bull; {(doc.fileSize / 1024).toFixed(0)} KB &bull; Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${application._id}/${doc._id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Inspect Document</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleVerifyDocument(doc._id, 'Verified')}
                      disabled={updatingDocId === doc._id}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
                    >
                      Mark Verified
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVerifyDocument(doc._id, 'Defective')}
                      disabled={updatingDocId === doc._id}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-60"
                    >
                      Flag Defect
                    </button>
                  </div>
                </div>

                {/* Scrutiny remark input */}
                <div className="flex items-center gap-2 pl-12">
                  <input
                    type="text"
                    value={docRemarks[doc._id] || ''}
                    onChange={(e) =>
                      setDocRemarks((prev) => ({ ...prev, [doc._id]: e.target.value }))
                    }
                    placeholder="Verification remarks (e.g. 'Marksheet verified with university seal', 'Income certificate illegible')..."
                    className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyDocument(doc._id, doc.status || 'Pending')}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-lg"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Decision Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Institutional Review Decision</h2>
            <p className="text-xs text-slate-500">
              Submit your formal recommendation to the Central Scholarship Board
            </p>
          </div>

          <form onSubmit={handleSubmitDecision} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  decision === 'Institution Approved'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Institution Approved"
                  checked={decision === 'Institution Approved'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-emerald-600"
                />
                <div>
                  <div className="text-xs font-bold">Approve Application</div>
                  <div className="text-[10px] text-slate-500">Forward to Board</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  decision === 'Correction Required'
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Correction Required"
                  checked={decision === 'Correction Required'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-orange-600"
                />
                <div>
                  <div className="text-xs font-bold">Request Correction</div>
                  <div className="text-[10px] text-slate-500">Notify student to fix docs</div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-2.5 ${
                  decision === 'Institution Rejected'
                    ? 'border-rose-500 bg-rose-50 text-rose-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="Institution Rejected"
                  checked={decision === 'Institution Rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-rose-600"
                />
                <div>
                  <div className="text-xs font-bold">Reject Application</div>
                  <div className="text-[10px] text-slate-500">Ineligible / Disqualified</div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Review Remarks / Recommendation *
              </label>
              <textarea
                rows={3}
                value={decisionRemarks}
                onChange={(e) => setDecisionRemarks(e.target.value)}
                placeholder="Explain the rationale for approval, defect details, or reason for rejection..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingDecision || !decision}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingDecision ? 'Submitting...' : 'Submit Official Review'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Workflow Timeline */}
        <StatusTimeline
          currentStatus={application.currentStatus}
          history={application.statusHistory}
        />
      </div>
    </DashboardLayout>
  );
}
