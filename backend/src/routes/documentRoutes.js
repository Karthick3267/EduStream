const express = require('express');
const router = express.Router();
const { downloadDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/:applicationId/:docId', downloadDocument);

module.exports = router;
