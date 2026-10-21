/**
 * Status State Machine for Paperless Scholarship Disbursement Platform
 * Enforces role-based status transition rules
 */

const ALLOWED_TRANSITIONS = {
  Draft: [
    { target: 'Submitted', roles: ['student'] }
  ],
  Submitted: [
    { target: 'Under Institution Review', roles: ['institution_staff'] },
    { target: 'Correction Required', roles: ['institution_staff'] },
    { target: 'Institution Rejected', roles: ['institution_staff'] }
  ],
  'Under Institution Review': [
    { target: 'Institution Approved', roles: ['institution_staff'] },
    { target: 'Correction Required', roles: ['institution_staff'] },
    { target: 'Institution Rejected', roles: ['institution_staff'] }
  ],
  'Correction Required': [
    { target: 'Submitted', roles: ['student'] }
  ],
  'Institution Approved': [
    { target: 'Under Administrative Review', roles: ['admin'] },
    { target: 'Approved', roles: ['admin'] },
    { target: 'Rejected', roles: ['admin'] }
  ],
  'Institution Rejected': [
    // Terminal state for institution stage
  ],
  'Under Administrative Review': [
    { target: 'Approved', roles: ['admin'] },
    { target: 'Rejected', roles: ['admin'] }
  ],
  Approved: [
    { target: 'Under Disbursement', roles: ['finance_officer', 'admin'] }
  ],
  Rejected: [
    // Terminal state for admin stage
  ],
  'Under Disbursement': [
    { target: 'Disbursed', roles: ['finance_officer'] },
    { target: 'Payment Failed', roles: ['finance_officer'] }
  ],
  'Payment Failed': [
    { target: 'Under Disbursement', roles: ['finance_officer'] }
  ],
  Disbursed: [
    // Terminal state for successful disbursement
  ]
};

function isValidTransition(currentStatus, targetStatus, role) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  const match = allowed.find(t => t.target === targetStatus && t.roles.includes(role));
  return !!match;
}

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidTransition,
};
