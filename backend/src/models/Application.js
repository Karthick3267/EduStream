const mongoose = require('mongoose');

const documentItemSchema = new mongoose.Schema({
  docType: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Defective'],
    default: 'Pending',
  },
  verificationRemarks: {
    type: String,
    default: '',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  role: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  remarks: {
    type: String,
    default: '',
  },
});

const applicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scholarshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scholarship',
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    studentProfileSnapshot: {
      name: String,
      email: String,
      phone: String,
      admissionNumber: String,
      course: String,
      department: String,
      yearOfStudy: Number,
      gpaOrPercentage: Number,
      familyAnnualIncome: Number,
      category: String,
      gender: String,
      bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        branch: String,
      },
    },
    currentStatus: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Institution Review',
        'Correction Required',
        'Institution Approved',
        'Institution Rejected',
        'Under Administrative Review',
        'Approved',
        'Rejected',
        'Under Disbursement',
        'Disbursed',
        'Payment Failed',
      ],
      default: 'Submitted',
    },
    documents: [documentItemSchema],
    statusHistory: [statusHistorySchema],
    reviewRemarks: {
      institutionRemarks: { type: String, default: '' },
      adminRemarks: { type: String, default: '' },
      financeRemarks: { type: String, default: '' },
    },
    disbursementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disbursement',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for high-performance multi-filtering
applicationSchema.index({ studentId: 1, scholarshipId: 1 });
applicationSchema.index({ institutionId: 1, currentStatus: 1 });
applicationSchema.index({ currentStatus: 1 });

module.exports = mongoose.model('Application', applicationSchema);
