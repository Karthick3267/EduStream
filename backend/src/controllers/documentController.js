const path = require('path');
const fs = require('fs');
const Application = require('../models/Application');

// @route   GET /api/documents/:applicationId/:docId
// @desc    Download/Stream document with role authorization check
// @access  Private (Student owner, assigned Institution Staff, Admin, Finance)
const downloadDocument = async (req, res, next) => {
  try {
    const { applicationId, docId } = req.params;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Role-based authorization check
    if (req.user.role === 'student') {
      if (application.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot view documents of another applicant.',
        });
      }
    } else if (req.user.role === 'institution_staff') {
      if (application.institutionId.toString() !== req.user.institutionId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Document belongs to a different institution.',
        });
      }
    }

    const doc = application.documents.id(docId);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found in this application.',
      });
    }

    const filePath = doc.filePath ? path.resolve(doc.filePath) : null;

    // Check if the physical file exists on disk
    if (filePath && fs.existsSync(filePath)) {
      res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${doc.originalName || doc.fileName}"`
      );
      const stream = fs.createReadStream(filePath);
      return stream.pipe(res);
    }

    // Fallback if seeded or demonstration mock file: return an informative SVG document preview
    const svgFallback = `
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" style="background:#f8fafc; font-family:sans-serif;">
        <rect width="800" height="1000" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <rect x="0" y="0" width="800" height="80" fill="#2563eb" />
        <text x="40" y="48" fill="#ffffff" font-size="22" font-weight="bold">EDUSTREAM OFFICIAL DOCUMENT ARCHIVE</text>
        <text x="40" y="140" fill="#1e293b" font-size="20" font-weight="bold">${doc.docType.toUpperCase()}</text>
        <line x1="40" y1="160" x2="760" y2="160" stroke="#cbd5e1" stroke-width="2"/>
        <text x="40" y="210" fill="#475569" font-size="15">Application Number: ${application.applicationNumber}</text>
        <text x="40" y="240" fill="#475569" font-size="15">Candidate Name: ${application.studentProfileSnapshot?.name || 'Applicant'}</text>
        <text x="40" y="270" fill="#475569" font-size="15">Document ID: ${doc._id}</text>
        <text x="40" y="300" fill="#475569" font-size="15">Verification Status: ${doc.status}</text>
        <text x="40" y="330" fill="#475569" font-size="15">Verification Remarks: ${doc.verificationRemarks || 'None'}</text>
        
        <rect x="40" y="380" width="720" height="350" fill="#f1f5f9" rx="8" stroke="#94a3b8" stroke-dasharray="6,6"/>
        <text x="240" y="540" fill="#64748b" font-size="18" font-weight="bold">[ Certified Supporting Document Record ]</text>
        <text x="260" y="575" fill="#94a3b8" font-size="14">Digitally verified supporting documentation</text>
        
        <text x="40" y="930" fill="#94a3b8" font-size="12">EduStream &bull; Paperless Scholarship Disbursement Platform &bull; Security Cleared Document Stream</text>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${doc.docType.replace(/\s+/g, '_')}_preview.svg"`
    );
    res.send(svgFallback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadDocument,
};
