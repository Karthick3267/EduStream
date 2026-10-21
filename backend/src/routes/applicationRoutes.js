const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplications,
  getApplicationById,
  uploadDocument,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(protect);

// Student actions
router.post('/', requireRoles('student'), submitApplication);
router.get('/my', requireRoles('student'), getMyApplications);
router.post(
  '/:id/documents',
  requireRoles('student'),
  upload.single('file'),
  uploadDocument
);

// Accessible by authorized participants (Student owner, Staff of institution, Admin, Finance)
router.get('/:id', getApplicationById);

module.exports = router;
