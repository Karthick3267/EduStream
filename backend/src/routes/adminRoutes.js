const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  submitAdminDecision,
  getAdminMetrics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRoles('admin'));

router.get('/applications', getAllApplications);
router.patch('/applications/:id/decision', submitAdminDecision);
router.get('/metrics', getAdminMetrics);

module.exports = router;
