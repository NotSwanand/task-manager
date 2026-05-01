const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation result and return errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Validation Rules ─────────────────────────────────────────────────────────

const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
  handleValidation,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  handleValidation,
];

const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description too long'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('project').notEmpty().withMessage('Project ID is required').isMongoId().withMessage('Invalid project ID'),
  handleValidation,
];

module.exports = { validateSignup, validateLogin, validateProject, validateTask };
