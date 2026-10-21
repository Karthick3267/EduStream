const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

router.use(protect);
router.get('/profile', requireRoles('student'), getProfile);
router.put('/profile', requireRoles('student'), updateProfile);

module.exports = router;
