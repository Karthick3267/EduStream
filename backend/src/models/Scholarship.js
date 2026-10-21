const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Scholarship title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Scholarship code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    providerName: {
      type: String,
      required: [true, 'Provider/Sponsor name is required'],
      trim: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      default: '2026-2027',
    },
    amount: {
      type: Number,
      required: [true, 'Scholarship amount is required'],
      min: 1,
    },
    maxAnnualIncome: {
      type: Number,
      default: 0, // 0 = no income ceiling
    },
    minPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    eligibleGenders: {
      type: [String],
      enum: ['All', 'Male', 'Female', 'Other'],
      default: ['All'],
    },
    eligibleCategories: {
      type: [String],
      default: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
    },
    eligibleCourses: {
      type: [String],
      default: [], // empty means all courses eligible
    },
    requiredDocuments: [
      {
        docType: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          default: '',
        },
        isMandatory: {
          type: Boolean,
          default: true,
        },
      },
    ],
    openingDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required'],
    },
    quota: {
      type: Number,
      default: 100,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Scholarship', scholarshipSchema);
