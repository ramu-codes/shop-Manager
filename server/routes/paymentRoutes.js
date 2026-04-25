import express from 'express';
import { getPayments, createPayment } from '../controllers/paymentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();
router.use(auth);

router.route('/').get(getPayments).post(createPayment);

export default router;
