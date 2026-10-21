const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Knowledge doc title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Eligibility', 'Documents', 'Disbursement', 'Verification', 'General'],
      default: 'General',
    },
    schemeCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    summary: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    embedding: {
      type: [Number],
      default: [],
    },
    sourceRef: {
      type: String,
      default: 'EduStream Knowledge Base 2026',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeDocSchema.index({ category: 1, schemeCode: 1 });
knowledgeDocSchema.index({ tags: 1 });

module.exports = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
