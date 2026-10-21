const express = require('express');
const router = express.Router();
const {
  getInstitutionApplications,
  verifyDocument,
  submitInstitutionDecision,
} = require('../controllers/verificationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(requireRoles('institution_staff'));

router.get('/applications', getInstitutionApplications);
router.patch('/applications/:id/verify-document', verifyDocument);
router.patch('/applications/:id/decision', submitInstitutionDecision);

module.exports = router;
