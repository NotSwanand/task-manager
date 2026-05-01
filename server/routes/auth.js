const express = require('express');
const router = express.Router();
const { signup, login, getMe, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

router.post('/signup', validateSignup, signup);
router.post('/login',  validateLogin,  login);
router.get('/me',      protect,        getMe);
router.get('/users',   protect,        authorize('admin'), getAllUsers);

module.exports = router;
