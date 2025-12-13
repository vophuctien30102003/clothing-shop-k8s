const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateLogin } = require('../middleware/auth');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/verify-email', userController.verifyEmail);
router.post('/verify-email', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);

router.post('/reset-password', authenticateLogin, userController.resetPassword);
router.get('/profile', authenticateLogin, userController.getProfile);
router.put('/profile', authenticateLogin, userController.updateProfile);
router.get('/list', authenticateLogin, userController.listUsers);
router.put('/:id/role', authenticateLogin, userController.updateUserRole);

module.exports = router;
