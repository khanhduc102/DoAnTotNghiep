const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const controller = require('./auth.controller');
const schema = require('./auth.validation');

const router = express.Router();

// ----- Public -----
router.post('/register', validate(schema.registerSchema), controller.register);
router.post('/login', validate(schema.loginSchema), controller.login);

// ----- Can dang nhap -----
router.get('/me', authenticate, controller.getMe);
router.put('/me', authenticate, validate(schema.updateProfileSchema), controller.updateMe);
router.put(
  '/change-password',
  authenticate,
  validate(schema.changePasswordSchema),
  controller.changePassword
);

module.exports = router;
