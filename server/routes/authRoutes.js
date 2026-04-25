import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import {
  registerValidators,
  loginValidators,
  handleValidationErrors,
} from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/register', registerValidators, handleValidationErrors, register);
router.post('/login', loginValidators, handleValidationErrors, login);

// Protected route
router.get('/me', auth, getMe);

export default router;
