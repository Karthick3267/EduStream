const Scholarship = require('../models/Scholarship');
const { logAudit } = require('../utils/auditLogger');

// @route   GET /api/scholarships
// @desc    Get all active scholarships (or all for admin)
// @access  Public / Protected
const getAllScholarships = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    // Only administrators can see non-active scholarships
    if (req.user && req.user.role === 'admin') {
      if (status) filter.status = status;
    } else {
      filter.status = 'Active';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { providerName: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.eligibleCategories = category;
    }

    const scholarships = await Scholarship.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: scholarships.length,
      scholarships,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/scholarships/:id
// @desc    Get single scholarship details
// @access  Public / Protected
const getScholarshipById = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship scheme not found.',
      });
    }

    res.json({
      success: true,
      scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/scholarships
// @desc    Create new scholarship scheme
// @access  Private (Admin)
const createScholarship = async (req, res, next) => {
  try {
    const {
      title,
      code,
      description,
      providerName,
      academicYear,
      amount,
      maxAnnualIncome,
      minPercentage,
      eligibleGenders,
      eligibleCategories,
      eligibleCourses,
      requiredDocuments,
      deadline,
      quota,
      status,
    } = req.body;

    if (!title || !code || !description || !providerName || !amount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, code, description, provider name, amount, and deadline are required.',
      });
    }

    const existingScheme = await Scholarship.findOne({ code: code.toUpperCase().trim() });
    if (existingScheme) {
      return res.status(409).json({
        success: false,
        message: `A scholarship with code '${code.toUpperCase().trim()}' already exists.`,
      });
    }

    const scholarship = await Scholarship.create({
      title: title.trim(),
      code: code.toUpperCase().trim(),
      description,
      providerName: providerName.trim(),
      academicYear: academicYear || '2026-2027',
      amount: Number(amount),
      maxAnnualIncome: Number(maxAnnualIncome) || 0,
      minPercentage: Number(minPercentage) || 0,
      eligibleGenders: eligibleGenders || ['All'],
      eligibleCategories: eligibleCategories || ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
      eligibleCourses: eligibleCourses || [],
      requiredDocuments: requiredDocuments || [
        { docType: 'Previous Marksheet', isMandatory: true },
        { docType: 'Income Certificate', isMandatory: true },
        { docType: 'Bonafide / Student ID', isMandatory: true },
        { docType: 'Bank Passbook / Cancelled Cheque', isMandatory: true },
      ],
      deadline: new Date(deadline),
      quota: Number(quota) || 100,
      status: status || 'Active',
      createdBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'SCHOLARSHIP_CREATED',
      resourceType: 'Scholarship',
      resourceId: scholarship._id,
      details: { title: scholarship.title, code: scholarship.code },
    });

    res.status(201).json({
      success: true,
      message: 'Scholarship scheme created successfully.',
      scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/scholarships/:id
// @desc    Update scholarship scheme
// @access  Private (Admin)
const updateScholarship = async (req, res, next) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship scheme not found.',
      });
    }

    await logAudit({
      req,
      action: 'SCHOLARSHIP_UPDATED',
      resourceType: 'Scholarship',
      resourceId: scholarship._id,
      details: { title: scholarship.title },
    });

    res.json({
      success: true,
      message: 'Scholarship scheme updated successfully.',
      scholarship,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/scholarships/:id/status
// @desc    Change scholarship status (Active/Closed/Draft)
// @access  Private (Admin)
const updateScholarshipStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Closed', 'Draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Permitted: Active, Closed, Draft.',
      });
    }

    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship scheme not found.',
      });
    }

    res.json({
      success: true,
      message: `Scholarship status updated to ${status}.`,
      scholarship,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  updateScholarshipStatus,
};
