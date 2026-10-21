const express = require('express');
const router = express.Router();
const {
  getDisbursements,
  processDisbursement,
  getDisbursementSummary,
} = require('../controllers/disbursementController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRoles('finance_officer', 'admin'));

router.get('/', getDisbursements);
router.post('/process', requireRoles('finance_officer'), processDisbursement);
router.get('/summary', getDisbursementSummary);

module.exports = router;
