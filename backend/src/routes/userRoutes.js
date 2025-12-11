const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// TODO: Add authentication middleware
// TODO: Add role-based authorization middleware

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-email', userController.verifyEmail);
router.post('/verify-sms', userController.verifySMS);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Admin/Manager routes
router.get('/list', userController.listUsers);
router.put('/:id/role', userController.updateUserRole);

module.exports = router;

