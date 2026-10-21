const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

// @route   GET /api/student/profile
// @desc    Get logged in student's academic and personal profile
// @access  Private (student)
const getProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ userId: req.user._id }).populate(
      'institutionId',
      'name code state address'
    );

    if (!profile) {
      profile = await StudentProfile.create({
        userId: req.user._id,
        institutionId: req.user.institutionId,
        admissionNumber: `ADM-${Date.now().toString().slice(-6)}`,
        course: 'Not Specified',
        yearOfStudy: 1,
        gpaOrPercentage: 0,
        familyAnnualIncome: 0,
        gender: 'Male',
        bankDetails: {
          accountHolderName: req.user.name,
          accountNumber: '',
          ifscCode: '',
          bankName: '',
          branch: '',
        },
        isProfileComplete: false,
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/student/profile
// @desc    Create or update student profile
// @access  Private (student)
const updateProfile = async (req, res, next) => {
  try {
    const {
      admissionNumber,
      course,
      department,
      yearOfStudy,
      currentSemester,
      gpaOrPercentage,
      familyAnnualIncome,
      category,
      gender,
      dateOfBirth,
      address,
      bankDetails,
      phone,
    } = req.body;

    if (phone) {
      await User.findByIdAndUpdate(req.user._id, { phone });
    }

    // Validate essential fields to mark complete
    const isComplete =
      Boolean(admissionNumber) &&
      Boolean(course) &&
      Boolean(yearOfStudy) &&
      gpaOrPercentage !== undefined &&
      gpaOrPercentage !== '' &&
      familyAnnualIncome !== undefined &&
      familyAnnualIncome !== '' &&
      Boolean(gender) &&
      Boolean(bankDetails?.accountHolderName) &&
      Boolean(bankDetails?.accountNumber) &&
      Boolean(bankDetails?.ifscCode) &&
      Boolean(bankDetails?.bankName);

    const updateData = {
      admissionNumber,
      course,
      department: department || '',
      yearOfStudy: Number(yearOfStudy),
      currentSemester: Number(currentSemester) || 1,
      gpaOrPercentage: Number(gpaOrPercentage),
      familyAnnualIncome: Number(familyAnnualIncome),
      category: category || 'General',
      gender,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address: address || '',
      bankDetails: {
        accountHolderName: bankDetails?.accountHolderName?.trim() || '',
        accountNumber: bankDetails?.accountNumber?.trim() || '',
        ifscCode: bankDetails?.ifscCode?.toUpperCase()?.trim() || '',
        bankName: bankDetails?.bankName?.trim() || '',
        branch: bankDetails?.branch?.trim() || '',
      },
      isProfileComplete: isComplete,
    };

    let profile = await StudentProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).populate('institutionId', 'name code state');

    await logAudit({
      req,
      action: 'STUDENT_PROFILE_UPDATED',
      resourceType: 'StudentProfile',
      resourceId: profile._id,
      details: { isComplete },
    });

    res.json({
      success: true,
      message: 'Student profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
