const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution affiliation is required'],
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission/Roll number is required'],
      trim: true,
    },
    course: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    yearOfStudy: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: 1,
      max: 6,
    },
    currentSemester: {
      type: Number,
      default: 1,
    },
    gpaOrPercentage: {
      type: Number,
      required: [true, 'Marks percentage or CGPA is required'],
      min: 0,
      max: 100,
    },
    familyAnnualIncome: {
      type: Number,
      required: [true, 'Family annual income is required'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
      default: 'General',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountHolderName: {
        type: String,
        required: [true, 'Account holder name is required'],
        trim: true,
      },
      accountNumber: {
        type: String,
        required: [true, 'Bank account number is required'],
        trim: true,
      },
      ifscCode: {
        type: String,
        required: [true, 'Bank IFSC code is required'],
        uppercase: true,
        trim: true,
      },
      bankName: {
        type: String,
        required: [true, 'Bank name is required'],
        trim: true,
      },
      branch: {
        type: String,
        trim: true,
        default: '',
      },
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
