const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Institution = require('../models/Institution');
const StudentProfile = require('../models/StudentProfile');
const { logAudit } = require('../utils/auditLogger');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'dev_secret_scholarship_key_2026';
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      institutionId: user.institutionId,
    },
    secret,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a student user
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, institutionId, phone } = req.body;

    if (!name || !email || !password || !institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and institution are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const institution = await Institution.findById(institutionId);
    if (!institution || !institution.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive institution selected.',
      });
    }

    // Create student user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      institutionId,
      phone: phone || '',
    });

    // Create initial student profile
    await StudentProfile.create({
      userId: user._id,
      institutionId,
      admissionNumber: `ADM-${Date.now().toString().slice(-6)}`,
      course: 'Pending Details',
      yearOfStudy: 1,
      gpaOrPercentage: 0,
      familyAnnualIncome: 0,
      gender: 'Male', // placeholder until student completes profile
      bankDetails: {
        accountHolderName: user.name,
        accountNumber: 'PENDING',
        ifscCode: 'PENDING',
        bankName: 'PENDING',
      },
      isProfileComplete: false,
    });

    const token = generateToken(user);

    await logAudit({
      req: { user, socket: req.socket, headers: req.headers },
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: user._id,
      details: { role: 'student', email: user.email },
    });

    res.status(201).json({
      success: true,
      message: 'Student registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).populate(
      'institutionId',
      'name code'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    const token = generateToken(user);

    await logAudit({
      req: { user, socket: req.socket, headers: req.headers },
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id,
      details: { role: user.role, email: user.email },
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institutionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/auth/me
// @desc    Get currently logged in user info
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('institutionId', 'name code address state');

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ userId: user._id }).populate(
        'institutionId',
        'name code'
      );
    }

    res.json({
      success: true,
      user,
      studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/institutions
// @desc    Get list of active institutions (for dropdowns)
// @access  Public
const getInstitutions = async (req, res, next) => {
  try {
    const institutions = await Institution.find({ isActive: true })
      .select('name code state address')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: institutions.length,
      institutions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getInstitutions,
};
