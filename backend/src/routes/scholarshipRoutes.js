const express = require('express');
const router = express.Router();
const {
  getAllScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  updateScholarshipStatus,
} = require('../controllers/scholarshipController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// Public or optionally authenticated to browse
router.get('/', getAllScholarships);
router.get('/:id', getScholarshipById);

// Admin-only management routes
router.post('/', protect, requireRoles('admin'), createScholarship);
router.put('/:id', protect, requireRoles('admin'), updateScholarship);
router.patch('/:id/status', protect, requireRoles('admin'), updateScholarshipStatus);

module.exports = router;
