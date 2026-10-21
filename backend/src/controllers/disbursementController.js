const Disbursement = require('../models/Disbursement');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { isValidTransition } = require('../utils/statusStateMachine');

// @route   GET /api/disbursements
// @desc    Get all disbursement records & approved applications ready for payment
// @access  Private (Finance Officer, Admin)
const getDisbursements = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.disbursementStatus = status;
    }

    let disbursements = await Disbursement.find(filter)
      .populate('applicationId')
      .populate('studentId', 'name email phone')
      .populate('scholarshipId', 'title code amount providerName')
      .populate('processedBy', 'name email')
      .sort({ updatedAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      disbursements = disbursements.filter(
        (d) =>
          d.transactionReference?.toLowerCase().includes(s) ||
          d.studentId?.name?.toLowerCase().includes(s) ||
          d.applicationId?.applicationNumber?.toLowerCase().includes(s) ||
          d.bankDetailsSnapshot?.accountNumber?.includes(s)
      );
    }

    res.json({
      success: true,
      count: disbursements.length,
      disbursements,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/disbursements/process
// @desc    Record transaction reference and mark disbursement status
// @access  Private (Finance Officer)
const processDisbursement = async (req, res, next) => {
  try {
    const {
      applicationId,
      transactionReference,
      paymentDate,
      paymentMode,
      status, // 'Completed' or 'Failed'
      remarks,
    } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status (Completed or Failed) are required.',
      });
    }

    if (status === 'Completed' && !transactionReference) {
      return res.status(400).json({
        success: false,
        message: 'Transaction reference (UTR/Bank Ref Number) is required for completed disbursements.',
      });
    }

    const application = await Application.findById(applicationId).populate('scholarshipId');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    const targetAppStatus = status === 'Completed' ? 'Disbursed' : 'Payment Failed';

    // Verify valid status transition from current application status
    if (
      application.currentStatus !== 'Approved' &&
      application.currentStatus !== 'Under Disbursement' &&
      application.currentStatus !== 'Payment Failed'
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot disburse application in current status: '${application.currentStatus}'. Must be 'Approved' or 'Under Disbursement'.`,
      });
    }

    // Find or create disbursement record
    let disbursement = await Disbursement.findOne({ applicationId: application._id });
    if (!disbursement) {
      disbursement = new Disbursement({
        applicationId: application._id,
        studentId: application.studentId,
        scholarshipId: application.scholarshipId._id,
        amount: application.scholarshipId.amount,
        bankDetailsSnapshot: application.studentProfileSnapshot?.bankDetails,
      });
    }

    disbursement.disbursementStatus = status;
    disbursement.transactionReference = transactionReference?.trim() || '';
    disbursement.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    disbursement.paymentMode = paymentMode || 'Direct Benefit Transfer (DBT)';
    disbursement.processedBy = req.user._id;
    disbursement.remarks = remarks || '';
    await disbursement.save();

    // Update application
    application.currentStatus = targetAppStatus;
    application.disbursementId = disbursement._id;
    application.reviewRemarks.financeRemarks = remarks || '';
    application.statusHistory.push({
      status: targetAppStatus,
      changedBy: req.user._id,
      role: 'finance_officer',
      timestamp: new Date(),
      remarks:
        status === 'Completed'
          ? `Disbursement processed. UTR Ref: ${transactionReference}. Mode: ${paymentMode || 'DBT'}.`
          : `Disbursement failed. Reason: ${remarks || 'Transaction rejected by gateway/bank.'}`,
    });
    await application.save();

    // Notify Student
    if (status === 'Completed') {
      await Notification.create({
        userId: application.studentId,
        title: 'Scholarship Amount Disbursed!',
        message: `Congratulations! ₹${application.scholarshipId.amount.toLocaleString()} has been disbursed to your registered bank account (${application.studentProfileSnapshot?.bankDetails?.bankName} A/C ending in ...${application.studentProfileSnapshot?.bankDetails?.accountNumber?.slice(-4)}). Transaction Reference: ${transactionReference}.`,
        type: 'success',
        link: `/applications/${application._id}`,
      });
    } else {
      await Notification.create({
        userId: application.studentId,
        title: 'Disbursement Issue Encountered',
        message: `Disbursement for application #${application.applicationNumber} encountered an issue: ${remarks || 'Please verify your bank IFSC and account details.'}`,
        type: 'error',
        link: `/applications/${application._id}`,
      });
    }

    await logAudit({
      req,
      action: 'DISBURSEMENT_PROCESSED',
      resourceType: 'Disbursement',
      resourceId: disbursement._id,
      details: {
        applicationNumber: application.applicationNumber,
        status,
        amount: disbursement.amount,
        transactionReference,
      },
    });

    res.json({
      success: true,
      message:
        status === 'Completed'
          ? `Disbursement successfully recorded and status marked as Disbursed.`
          : `Disbursement status marked as Failed.`,
      disbursement,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/disbursements/summary
// @desc    Financial analytics summary for finance officers
// @access  Private (Finance Officer, Admin)
const getDisbursementSummary = async (req, res, next) => {
  try {
    const totalPending = await Disbursement.countDocuments({ disbursementStatus: 'Pending' });
    const totalCompleted = await Disbursement.countDocuments({ disbursementStatus: 'Completed' });
    const totalFailed = await Disbursement.countDocuments({ disbursementStatus: 'Failed' });

    const allDisbursements = await Disbursement.find();
    let totalPaidOut = 0;
    let totalPendingAmount = 0;

    allDisbursements.forEach((d) => {
      if (d.disbursementStatus === 'Completed') {
        totalPaidOut += d.amount || 0;
      } else if (d.disbursementStatus === 'Pending') {
        totalPendingAmount += d.amount || 0;
      }
    });

    res.json({
      success: true,
      summary: {
        totalPending,
        totalCompleted,
        totalFailed,
        totalPaidOut,
        totalPendingAmount,
        totalRecords: allDisbursements.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDisbursements,
  processDisbursement,
  getDisbursementSummary,
};
