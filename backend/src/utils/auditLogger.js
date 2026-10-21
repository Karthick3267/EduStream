const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, action, resourceType, resourceId, details }) => {
  try {
    const userId = req && req.user ? req.user._id : null;
    const userRole = req && req.user ? req.user.role : 'system';
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';

    await AuditLog.create({
      userId,
      userRole,
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : '',
      details: details || {},
      ipAddress,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { logAudit };
