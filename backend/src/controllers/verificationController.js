const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { isValidTransition } = require('../utils/statusStateMachine');

// @route   GET /api/verification/applications
// @desc    Get all applications belonging to the institution of logged in staff
// @access  Private (institution_staff)
const getInstitutionApplications = async (req, res, next) => {
  try {
    const institutionId = req.user.institutionId;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Your account is not linked to any recognized institution.',
      });
    }

    const { status, search, course } = req.query;
    const filter = { institutionId };

    if (status && status !== 'All') {
      filter.currentStatus = status;
    }

    if (course) {
      filter['studentProfileSnapshot.course'] = { $regex: course, $options: 'i' };
    }

    let query = Application.find(filter)
      .populate('scholarshipId', 'title code amount deadline')
      .populate('studentId', 'name email phone')
      .sort({ updatedAt: -1 });

    let applications = await query.exec();

    if (search) {
      const s = search.toLowerCase();
      applications = applications.filter(
        (app) =>
          app.applicationNumber.toLowerCase().includes(s) ||
          app.studentProfileSnapshot?.name?.toLowerCase().includes(s) ||
          app.studentProfileSnapshot?.admissionNumber?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/verification/applications/:id/verify-document
// @desc    Mark individual document verified or defective with remarks
// @access  Private (institution_staff)
const verifyDocument = async (req, res, next) => {
  try {
    const { docId, status, remarks } = req.body;

    if (!docId || !status || !['Verified', 'Defective'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid docId and status (Verified or Defective) are required.',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot review applications of other institutions.',
      });
    }

    const doc = application.documents.id(docId);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found within this application.',
      });
    }

    doc.status = status;
    doc.verificationRemarks = remarks || '';
    doc.verifiedBy = req.user._id;

    // Automatically transition to 'Under Institution Review' if currently in 'Submitted'
    if (application.currentStatus === 'Submitted') {
      application.currentStatus = 'Under Institution Review';
      application.statusHistory.push({
        status: 'Under Institution Review',
        changedBy: req.user._id,
        role: req.user.role,
        timestamp: new Date(),
        remarks: 'Institution verification in progress.',
      });
    }

    await application.save();

    await logAudit({
      req,
      action: 'DOCUMENT_VERIFIED',
      resourceType: 'Application',
      resourceId: application._id,
      details: { docType: doc.docType, status, remarks },
    });

    res.json({
      success: true,
      message: `Document '${doc.docType}' marked as ${status}.`,
      document: doc,
      currentStatus: application.currentStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/verification/applications/:id/decision
// @desc    Submit institutional review decision (Approve, Reject, or Request Correction)
// @access  Private (institution_staff)
const submitInstitutionDecision = async (req, res, next) => {
  try {
    const { decision, remarks } = req.body;

    const validDecisions = ['Institution Approved', 'Correction Required', 'Institution Rejected'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Decision must be one of: ${validDecisions.join(', ')}`,
      });
    }

    if ((decision === 'Correction Required' || decision === 'Institution Rejected') && !remarks) {
      return res.status(400).json({
        success: false,
        message: 'Remarks explaining the defect or rejection are required.',
      });
    }

    const application = await Application.findById(req.params.id).populate(
      'scholarshipId',
      'title code'
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.institutionId.toString() !== req.user.institutionId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify applications of another institution.',
      });
    }

    if (!isValidTransition(application.currentStatus, decision, req.user.role)) {
      return res.status(400).json({
        success: false,
        message: `Illegal state transition from '${application.currentStatus}' to '${decision}' for role '${req.user.role}'.`,
      });
    }

    application.currentStatus = decision;
    application.reviewRemarks.institutionRemarks = remarks || '';
    application.statusHistory.push({
      status: decision,
      changedBy: req.user._id,
      role: req.user.role,
      timestamp: new Date(),
      remarks: remarks || `Institutional review marked as ${decision}`,
    });

    await application.save();

    // Create student notification
    let notificationType = 'info';
    let notifTitle = 'Application Status Update';
    if (decision === 'Institution Approved') {
      notificationType = 'success';
      notifTitle = 'Institutional Verification Approved';
    } else if (decision === 'Correction Required') {
      notificationType = 'warning';
      notifTitle = 'Action Required: Application Defect Flagged';
    } else if (decision === 'Institution Rejected') {
      notificationType = 'error';
      notifTitle = 'Application Rejected by Institution';
    }

    await Notification.create({
      userId: application.studentId,
      title: notifTitle,
      message: `Your application #${application.applicationNumber} has been updated to '${decision}'. Remark: ${remarks || 'None'}`,
      type: notificationType,
      link: `/applications/${application._id}`,
    });

    await logAudit({
      req,
      action: 'INSTITUTION_DECISION',
      resourceType: 'Application',
      resourceId: application._id,
      details: { decision, remarks },
    });

    res.json({
      success: true,
      message: `Application decision recorded as '${decision}'.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInstitutionApplications,
  verifyDocument,
  submitInstitutionDecision,
};
