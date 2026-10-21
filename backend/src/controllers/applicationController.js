const Application = require('../models/Application');
const Scholarship = require('../models/Scholarship');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAudit } = require('../utils/auditLogger');
const { isValidTransition } = require('../utils/statusStateMachine');

// Helper to generate readable application number
const generateApplicationNumber = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  return `SCH-${year}-${randomPart}`;
};

// @route   POST /api/applications
// @desc    Submit a scholarship application
// @access  Private (Student)
const submitApplication = async (req, res, next) => {
  try {
    const { scholarshipId } = req.body;

    if (!scholarshipId) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship ID is required.',
      });
    }

    // 1. Verify scholarship exists and is open
    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship || scholarship.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This scholarship scheme is currently not active or does not exist.',
      });
    }

    if (new Date(scholarship.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The deadline for this scholarship has already passed.',
      });
    }

    // 2. Check student profile completeness
    const profile = await StudentProfile.findOne({ userId: req.user._id });
    if (!profile || !profile.isProfileComplete) {
      return res.status(400).json({
        success: false,
        message:
          'Your student profile is incomplete. Please fill your academic, personal, and bank details first.',
      });
    }

    // 3. Prevent duplicate applications
    const existing = await Application.findOne({
      studentId: req.user._id,
      scholarshipId,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this scholarship scheme.',
        applicationNumber: existing.applicationNumber,
      });
    }

    // 4. Create snapshot
    const studentUser = await User.findById(req.user._id);
    const profileSnapshot = {
      name: studentUser.name,
      email: studentUser.email,
      phone: studentUser.phone || '',
      admissionNumber: profile.admissionNumber,
      course: profile.course,
      department: profile.department || '',
      yearOfStudy: profile.yearOfStudy,
      gpaOrPercentage: profile.gpaOrPercentage,
      familyAnnualIncome: profile.familyAnnualIncome,
      category: profile.category,
      gender: profile.gender,
      bankDetails: {
        accountHolderName: profile.bankDetails.accountHolderName,
        accountNumber: profile.bankDetails.accountNumber,
        ifscCode: profile.bankDetails.ifscCode,
        bankName: profile.bankDetails.bankName,
        branch: profile.bankDetails.branch || '',
      },
    };

    const applicationNumber = generateApplicationNumber();

    const application = await Application.create({
      applicationNumber,
      studentId: req.user._id,
      scholarshipId: scholarship._id,
      institutionId: profile.institutionId,
      studentProfileSnapshot: profileSnapshot,
      currentStatus: 'Submitted',
      documents: [],
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: req.user._id,
          role: 'student',
          timestamp: new Date(),
          remarks: 'Application submitted by student with digital profile snapshot.',
        },
      ],
      submittedAt: new Date(),
    });

    // Notify student
    await Notification.create({
      userId: req.user._id,
      title: 'Application Submitted',
      message: `Your application #${applicationNumber} for '${scholarship.title}' has been submitted for institution verification.`,
      type: 'success',
      link: `/applications/${application._id}`,
    });

    // Notify institution staff
    const staffMembers = await User.find({
      role: 'institution_staff',
      institutionId: profile.institutionId,
      isActive: true,
    });
    for (const staff of staffMembers) {
      await Notification.create({
        userId: staff._id,
        title: 'New Application for Review',
        message: `Student ${studentUser.name} submitted application #${applicationNumber} for review.`,
        type: 'info',
        link: `/institution/verify/${application._id}`,
      });
    }

    await logAudit({
      req,
      action: 'APPLICATION_SUBMITTED',
      resourceType: 'Application',
      resourceId: application._id,
      details: { applicationNumber, scholarshipCode: scholarship.code },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Please upload required supporting documents.',
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/applications/my
// @desc    Get all applications of current student
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('scholarshipId', 'title code amount deadline providerName')
      .populate('institutionId', 'name code state')
      .populate('disbursementId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/applications/:id
// @desc    Get application details with security permissions
// @access  Private (Student, Staff, Admin, Finance)
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('scholarshipId')
      .populate('institutionId', 'name code address state contactEmail')
      .populate('studentId', 'name email phone')
      .populate('disbursementId')
      .populate('statusHistory.changedBy', 'name role')
      .populate('documents.verifiedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    // Role-based security access check:
    if (req.user.role === 'student') {
      if (application.studentId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own applications.',
        });
      }
    } else if (req.user.role === 'institution_staff') {
      if (
        !req.user.institutionId ||
        application.institutionId._id.toString() !== req.user.institutionId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            'Access denied: You are only authorized to review applications belonging to your assigned institution.',
        });
      }
    }
    // admin and finance_officer have platform-level clearance

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/applications/:id/documents
// @desc    Upload or update a document for an application
// @access  Private (Student)
const uploadDocument = async (req, res, next) => {
  try {
    const { docType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded.',
      });
    }

    if (!docType) {
      return res.status(400).json({
        success: false,
        message: 'Document type (docType) must be specified.',
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found.',
      });
    }

    if (application.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only upload documents to your own application.',
      });
    }

    // Check if docType already exists in documents list; if so, replace/update it
    const existingDocIndex = application.documents.findIndex(
      (d) => d.docType.toLowerCase() === docType.toLowerCase()
    );

    const newDocItem = {
      docType,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadDate: new Date(),
      status: 'Pending',
      verificationRemarks: '',
      verifiedBy: null,
    };

    if (existingDocIndex >= 0) {
      application.documents[existingDocIndex] = newDocItem;
    } else {
      application.documents.push(newDocItem);
    }

    // If application was in Correction Required, re-submitting allows re-entry into review
    let reSubmitted = false;
    if (application.currentStatus === 'Correction Required') {
      application.currentStatus = 'Submitted';
      application.statusHistory.push({
        status: 'Submitted',
        changedBy: req.user._id,
        role: 'student',
        timestamp: new Date(),
        remarks: `Student updated document: ${docType}. Re-submitted for institution verification.`,
      });
      reSubmitted = true;
    }

    await application.save();

    await logAudit({
      req,
      action: 'DOCUMENT_UPLOADED',
      resourceType: 'Application',
      resourceId: application._id,
      details: { docType, fileName: req.file.filename, reSubmitted },
    });

    res.json({
      success: true,
      message: reSubmitted
        ? `Document uploaded and application re-submitted for institution review.`
        : `Document '${docType}' uploaded successfully.`,
      document: newDocItem,
      applicationStatus: application.currentStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
  uploadDocument,
};
