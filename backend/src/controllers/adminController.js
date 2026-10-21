const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const Institution = require('../models/Institution');
const Disbursement = require('../models/Disbursement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');
const { isValidTransition } = require('../utils/statusStateMachine');

// @route   GET /api/admin/applications
// @desc    Get all applications across institutions with filtering
// @access  Private (Admin)
const getAllApplications = async (req, res, next) => {
  try {
    const { status, institutionId, scholarshipId, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.currentStatus = status;
    }

    if (institutionId && institutionId !== 'All') {
      filter.institutionId = institutionId;
    }

    if (scholarshipId && scholarshipId !== 'All') {
      filter.scholarshipId = scholarshipId;
    }

    let applications = await Application.find(filter)
      .populate('scholarshipId', 'title code amount deadline providerName')
      .populate('institutionId', 'name code state')
      .populate('studentId', 'name email phone')
      .populate('disbursementId')
      .sort({ updatedAt: -1 });

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

// @route   PATCH /api/admin/applications/:id/decision
// @desc    Administrator final approval or rejection
// @access  Private (Admin)
const submitAdminDecision = async (req, res, next) => {
  try {
    const { decision, remarks } = req.body;

    const validDecisions = ['Approved', 'Rejected', 'Under Administrative Review'];
    if (!validDecisions.includes(decision)) {
      return res.status(400).json({
        success: false,
        message: `Decision must be one of: ${validDecisions.join(', ')}`,
      });
    }

    const application = await Application.findById(req.params.id)
      .populate('scholarshipId')
      .populate('studentId', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (!isValidTransition(application.currentStatus, decision, req.user.role)) {
      return res.status(400).json({
        success: false,
        message: `Illegal state transition from '${application.currentStatus}' to '${decision}' for Administrator.`,
      });
    }

    application.currentStatus = decision;
    application.reviewRemarks.adminRemarks = remarks || '';
    application.statusHistory.push({
      status: decision,
      changedBy: req.user._id,
      role: req.user.role,
      timestamp: new Date(),
      remarks: remarks || `Administrative review decided as: ${decision}`,
    });

    // If Approved, automatically generate a pending Disbursement record
    if (decision === 'Approved') {
      let disbursement = await Disbursement.findOne({ applicationId: application._id });
      if (!disbursement) {
        disbursement = await Disbursement.create({
          applicationId: application._id,
          studentId: application.studentId._id,
          scholarshipId: application.scholarshipId._id,
          amount: application.scholarshipId.amount,
          disbursementStatus: 'Pending',
          bankDetailsSnapshot: application.studentProfileSnapshot?.bankDetails,
          remarks: 'Queued for finance disbursement processing upon admin approval.',
        });
      }
      application.disbursementId = disbursement._id;

      // Notify Finance Officers
      const financeOfficers = await User.find({ role: 'finance_officer', isActive: true });
      for (const fo of financeOfficers) {
        await Notification.create({
          userId: fo._id,
          title: 'New Disbursement Queued',
          message: `Application #${application.applicationNumber} approved for ₹${application.scholarshipId.amount.toLocaleString()}. Ready for payment processing.`,
          type: 'info',
          link: `/finance/disbursements`,
        });
      }
    }

    await application.save();

    // Notify student
    await Notification.create({
      userId: application.studentId._id,
      title: decision === 'Approved' ? 'Scholarship Approved!' : 'Application Decision',
      message: `Your application #${application.applicationNumber} has been ${decision.toUpperCase()} by the Scholarship Board. ${remarks ? 'Remark: ' + remarks : ''}`,
      type: decision === 'Approved' ? 'success' : 'error',
      link: `/applications/${application._id}`,
    });

    await logAudit({
      req,
      action: 'ADMIN_DECISION',
      resourceType: 'Application',
      resourceId: application._id,
      details: { decision, remarks, amount: application.scholarshipId?.amount },
    });

    res.json({
      success: true,
      message: `Application successfully marked as '${decision}'.`,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/metrics
// @desc    Aggregated analytics dashboard metrics
// @access  Private (Admin)
const getAdminMetrics = async (req, res, next) => {
  try {
    const totalApplications = await Application.countDocuments();
    const submittedCount = await Application.countDocuments({ currentStatus: 'Submitted' });
    const underInstReviewCount = await Application.countDocuments({
      currentStatus: 'Under Institution Review',
    });
    const instApprovedCount = await Application.countDocuments({
      currentStatus: 'Institution Approved',
    });
    const correctionCount = await Application.countDocuments({
      currentStatus: 'Correction Required',
    });
    const approvedCount = await Application.countDocuments({ currentStatus: 'Approved' });
    const disbursedCount = await Application.countDocuments({ currentStatus: 'Disbursed' });
    const rejectedCount = await Application.countDocuments({
      currentStatus: { $in: ['Institution Rejected', 'Rejected'] },
    });

    // Financial totals
    const disbursements = await Disbursement.find();
    let totalCommittedAmount = 0;
    let totalDisbursedAmount = 0;

    disbursements.forEach((d) => {
      totalCommittedAmount += d.amount || 0;
      if (d.disbursementStatus === 'Completed') {
        totalDisbursedAmount += d.amount || 0;
      }
    });

    const activeScholarshipsCount = await Scholarship.countDocuments({ status: 'Active' });
    const institutionsCount = await Institution.countDocuments({ isActive: true });
    const registeredStudentsCount = await User.countDocuments({ role: 'student' });

    // Recent system audit activities
    const recentAudits = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name role email');

    res.json({
      success: true,
      metrics: {
        totalApplications,
        pendingInstitution: submittedCount + underInstReviewCount + correctionCount,
        pendingAdmin: instApprovedCount,
        approvedCount,
        disbursedCount,
        rejectedCount,
        activeScholarshipsCount,
        institutionsCount,
        registeredStudentsCount,
        totalCommittedAmount,
        totalDisbursedAmount,
      },
      recentAudits,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllApplications,
  submitAdminDecision,
  getAdminMetrics,
};
