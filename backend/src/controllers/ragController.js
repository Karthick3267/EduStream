const ragService = require('../services/ragService');
const KnowledgeDoc = require('../models/KnowledgeDoc');
const StudentProfile = require('../models/StudentProfile');

/**
 * Handle student or staff question via RAG
 * POST /api/rag/ask
 */
exports.askQuestion = async (req, res) => {
  try {
    const { query, profile } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Query text is required',
      });
    }

    let studentProfile = profile || null;

    // If request has authenticated student and no explicit profile passed, fetch from DB
    if (!studentProfile && req.user && req.user.role?.toLowerCase() === 'student') {
      try {
        studentProfile = await StudentProfile.findOne({ userId: req.user._id }).lean();
      } catch (err) {
        // Continue with null profile if lookup fails
      }
    }

    const result = await ragService.ask(query.trim(), studentProfile);

    return res.status(200).json({
      success: true,
      query: query.trim(),
      answer: result.answer,
      citations: result.citations,
      recommendedSchemes: result.recommendedSchemes,
      mode: result.mode,
    });
  } catch (err) {
    console.error('RAG askQuestion error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process RAG query',
      error: err.message,
    });
  }
};

/**
 * Get knowledge documents and policy rubrics
 * GET /api/rag/knowledge
 */
exports.getKnowledgeDocs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const docs = await KnowledgeDoc.find(filter)
      .select('-embedding')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (err) {
    console.error('RAG getKnowledgeDocs error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch knowledge documents',
      error: err.message,
    });
  }
};

/**
 * Re-sync vector index
 * POST /api/rag/sync
 */
exports.syncKnowledge = async (req, res) => {
  try {
    await ragService.buildIndex();
    return res.status(200).json({
      success: true,
      message: 'Knowledge base and active scheme vector index re-built successfully',
      indexedCount: ragService.localCorpus.length,
    });
  } catch (err) {
    console.error('RAG syncKnowledge error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to re-sync knowledge base',
      error: err.message,
    });
  }
};
