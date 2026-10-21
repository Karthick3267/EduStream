const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ragController = require('../controllers/ragController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Optional auth helper: if bearer token is sent, attach user; else proceed as guest
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next();
  }
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_scholarship_key_2026';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid tokens for optional auth and continue as guest
  }
  next();
};

// Ask query via RAG (open to guests and authenticated users)
router.post('/ask', optionalAuth, ragController.askQuestion);

// Get knowledge corpus & policy documents
router.get('/knowledge', ragController.getKnowledgeDocs);

// Re-index / sync vector index (Admins or internal)
router.post('/sync', optionalAuth, ragController.syncKnowledge);

module.exports = router;
