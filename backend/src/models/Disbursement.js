const mongoose = require('mongoose');

const disbursementSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      unique: true,
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
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    disbursementStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Completed', 'Failed'],
      default: 'Pending',
    },
    transactionReference: {
      type: String,
      trim: true,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentMode: {
      type: String,
      enum: ['Direct Benefit Transfer (DBT)', 'NEFT', 'RTGS', 'PFMS Direct Credit'],
      default: 'Direct Benefit Transfer (DBT)',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bankDetailsSnapshot: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      branch: String,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Disbursement', disbursementSchema);
